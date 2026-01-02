/**
 * Client Controller
 * مدیریت مشتریان
 */

const { Client, Transaction } = require('../models');
const { successResponse, errorResponse, ErrorCodes } = require('../utils/errorResponse');

/**
 * دریافت لیست مشتریان
 * GET /api/clients
 */
const getClients = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', sortBy = 'createdAt', order = 'desc' } = req.query;

    // ساخت query جستجو
    // برای User model (MVP): بدون tenant filter
    // برای Staff model: با tenant filter
    const query = req.tenantId ? { tenant: req.tenantId } : {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // محاسبه pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    // دریافت مشتریان
    const clients = await Client.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // تعداد کل
    const total = await Client.countDocuments(query);

    res.json(
      successResponse({
        clients,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      })
    );

  } catch (error) {
    next(error);
  }
};

/**
 * دریافت یک مشتری
 * GET /api/clients/:id
 */
const getClient = async (req, res, next) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      tenant: req.tenantId
    });

    if (!client) {
      return res.status(404).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'مشتری یافت نشد')
      );
    }

    res.json(successResponse({ client }));

  } catch (error) {
    next(error);
  }
};

/**
 * ایجاد مشتری جدید
 * POST /api/clients
 */
const createClient = async (req, res, next) => {
  try {
    const { name, phone, email, notes } = req.body;

    // بررسی تکراری نبودن شماره موبایل
    const query = req.tenantId ? { tenant: req.tenantId, phone } : { phone };
    const existingClient = await Client.findOne(query);

    if (existingClient) {
      return res.status(400).json(
        errorResponse(ErrorCodes.DUPLICATE_ENTRY, 'این شماره موبایل قبلاً ثبت شده است')
      );
    }

    // ایجاد مشتری
    const clientData = {
      name,
      phone,
      email: email || undefined,
      notes: notes || undefined
    };
    
    if (req.tenantId) {
      clientData.tenant = req.tenantId;
    }
    
    const client = new Client(clientData);
    await client.save();

    // به‌روزرسانی آمار تنانت (فقط برای Staff model)
    if (req.tenant) {
      await req.tenant.updateOne({ $inc: { 'stats.totalClients': 1 } });
    }

    res.status(201).json(
      successResponse({ client }, 'مشتری با موفقیت ایجاد شد')
    );

  } catch (error) {
    next(error);
  }
};

/**
 * به‌روزرسانی مشتری
 * PUT /api/clients/:id
 */
const updateClient = async (req, res, next) => {
  try {
    const { name, email, notes, tags } = req.body;

    const client = await Client.findOne({
      _id: req.params.id,
      tenant: req.tenantId
    });

    if (!client) {
      return res.status(404).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'مشتری یافت نشد')
      );
    }

    // به‌روزرسانی فیلدها
    if (name) client.name = name;
    if (email !== undefined) client.email = email || undefined;
    if (notes !== undefined) client.notes = notes;
    if (tags) client.tags = tags;

    await client.save();

    res.json(
      successResponse({ client }, 'مشتری با موفقیت به‌روزرسانی شد')
    );

  } catch (error) {
    next(error);
  }
};

/**
 * حذف مشتری
 * DELETE /api/clients/:id
 */
const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      tenant: req.tenantId
    });

    if (!client) {
      return res.status(404).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'مشتری یافت نشد')
      );
    }

    // به‌روزرسانی آمار تنانت
    await req.tenant.updateOne({ $inc: { 'stats.totalClients': -1 } });

    res.json(
      successResponse(null, 'مشتری با موفقیت حذف شد')
    );

  } catch (error) {
    next(error);
  }
};

/**
 * افزودن موجودی دستی
 * POST /api/clients/:id/balance
 */
const addBalance = async (req, res, next) => {
  try {
    const { amount, type, description } = req.body; // type: 'deposit' or 'withdraw'

    const client = await Client.findOne({
      _id: req.params.id,
      tenant: req.tenantId
    });

    if (!client) {
      return res.status(404).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'مشتری یافت نشد')
      );
    }

    // اطمینان از وجود آبجکت wallet و آرایه gifts
    if (!client.wallet) {
      client.wallet = { balance: 0, gifts: [], totalGifts: 0, totalUsed: 0, totalSpent: 0 };
    }
    if (!client.wallet.gifts) {
      client.wallet.gifts = [];
    }

    let finalAmount = parseInt(amount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      return res.status(400).json(errorResponse(ErrorCodes.VALIDATION_ERROR, 'مبلغ نامعتبر است'));
    }

    if (type === 'withdraw') {
      // برداشت از حساب
      if (client.wallet.balance < finalAmount) {
        return res.status(400).json(errorResponse(ErrorCodes.VALIDATION_ERROR, 'موجودی کافی نیست'));
      }
      client.wallet.balance -= finalAmount;
      // اینجا می‌توانیم منطق کسر از هدایا را هم اضافه کنیم اگر لازم باشد، اما برای سادگی فعلاً فقط از بالانس کم می‌کنیم
    } else {
      // واریز به حساب (هدیه دستی)
      client.wallet.balance += finalAmount;
      client.wallet.totalGifts += finalAmount;
      
      // اضافه کردن به لیست هدایا
      client.wallet.gifts.push({
        amount: finalAmount,
        balance: finalAmount,
        used: 0,
        source: 'manual',
        description: description || 'افزایش دستی اعتبار',
        createdAt: new Date(),
        expiresAt: null // یا یک تاریخ انقضای پیش‌فرض
      });
    }

    await client.save();

    // ثبت تراکنش
    await Transaction.create({
      client: client._id,
      tenant: req.tenantId,
      type: type === 'withdraw' ? 'withdraw' : 'deposit', // 'manual_adjustment' هم می‌تواند باشد
      amount: finalAmount,
      balanceAfter: client.wallet.balance,
      description: description || (type === 'withdraw' ? 'کسر دستی اعتبار' : 'افزایش دستی اعتبار'),
      performedBy: req.userId
    });

    res.json(
      successResponse({ client }, 'موجودی با موفقیت به‌روزرسانی شد')
    );

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  addBalance
};
