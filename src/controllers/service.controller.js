/**
 * Service Controller
 * مدیریت سرویس‌ها و ثبت خدمات
 */

const { Service, Client, Tenant } = require('../models');
const { successResponse, errorResponse, ErrorCodes } = require('../utils/errorResponse');

/**
 * دریافت لیست سرویس‌ها
 * GET /api/services
 */
const getServices = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      clientId, 
      staffId, 
      startDate, 
      endDate,
      sortBy = 'serviceDate',
      order = 'desc'
    } = req.query;

    // ساخت query
    const query = { tenant: req.tenantId };
    
    if (clientId) query.client = clientId;
    if (staffId) query.staff = staffId;
    
    if (startDate || endDate) {
      query.serviceDate = {};
      if (startDate) query.serviceDate.$gte = new Date(startDate);
      if (endDate) query.serviceDate.$lte = new Date(endDate);
    }

    // محاسبه pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    // دریافت سرویس‌ها
    const services = await Service.find(query)
      .populate('client', 'name phone')
      .populate('staff', 'name')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // تعداد کل
    const total = await Service.countDocuments(query);

    // محاسبه آمار
    const stats = await Service.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalGifts: { $sum: '$gift.amount' },
          totalFinal: { $sum: '$finalAmount' }
        }
      }
    ]);

    res.json(
      successResponse({
        services,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        stats: stats[0] || {
          totalAmount: 0,
          totalGifts: 0,
          totalFinal: 0
        }
      })
    );

  } catch (error) {
    next(error);
  }
};

/**
 * دریافت یک سرویس
 * GET /api/services/:id
 */
const getService = async (req, res, next) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      tenant: req.tenantId
    })
      .populate('client', 'name phone wallet')
      .populate('staff', 'name phone')
      .populate('tenant', 'name giftSettings');

    if (!service) {
      return res.status(404).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'سرویس یافت نشد')
      );
    }

    res.json(successResponse({ service }));

  } catch (error) {
    next(error);
  }
};

/**
 * ثبت سرویس جدید
 * POST /api/services
 */
const createService = async (req, res, next) => {
  try {
    const { clientId, title, description, amount, useWallet, walletAmount, notes } = req.body;

    // یافتن مشتری
    const client = await Client.findOne({
      _id: clientId,
      tenant: req.tenantId
    });

    if (!client) {
      return res.status(404).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'مشتری یافت نشد')
      );
    }

    // یافتن تنانت
    const tenant = await Tenant.findById(req.tenantId);

    // محاسبه هدیه
    const giftAmount = tenant.calculateGift(amount);
    const giftPercentage = tenant.giftSettings.percentage;

    // محاسبه استفاده از کیف پول
    let actualWalletUsed = 0;
    if (useWallet && walletAmount > 0) {
      if (client.wallet.balance < walletAmount) {
        return res.status(400).json(
          errorResponse(ErrorCodes.INSUFFICIENT_BALANCE, 'موجودی کیف پول کافی نیست')
        );
      }
      actualWalletUsed = Math.min(walletAmount, amount);
    }

    // ایجاد سرویس
    const service = new Service({
      tenant: req.tenantId,
      client: clientId,
      staff: req.staff._id,
      title,
      description: description || undefined,
      amount,
      gift: {
        amount: giftAmount,
        percentage: giftPercentage,
        applied: giftAmount > 0
      },
      walletUsed: {
        amount: actualWalletUsed,
        applied: actualWalletUsed > 0
      },
      notes: notes || undefined,
      serviceDate: new Date()
    });

    await service.save();

    // به‌روزرسانی کیف پول مشتری
    if (actualWalletUsed > 0) {
      client.deductBalance(actualWalletUsed);
    }
    
    // اضافه کردن هدیه
    if (giftAmount > 0) {
      client.addGift(giftAmount);
    }

    // به‌روزرسانی آمار مشتری
    client.updateAfterService(amount);
    await client.save();

    // به‌روزرسانی آمار کارمند
    await req.staff.updateOne({
      $inc: {
        'stats.totalServices': 1,
        'stats.totalRevenue': service.finalAmount
      }
    });

    // به‌روزرسانی آمار تنانت
    await tenant.updateOne({
      $inc: {
        'stats.totalServices': 1,
        'stats.totalRevenue': service.finalAmount
      }
    });

    // بارگذاری اطلاعات کامل
    await service.populate('client', 'name phone wallet');
    await service.populate('staff', 'name');

    res.status(201).json(
      successResponse({ service }, 'سرویس با موفقیت ثبت شد')
    );

  } catch (error) {
    next(error);
  }
};

/**
 * حذف سرویس
 * DELETE /api/services/:id
 */
const deleteService = async (req, res, next) => {
  try {
    // فقط مالک و مدیر می‌توانند سرویس حذف کنند
    if (!['owner', 'manager'].includes(req.staff.role)) {
      return res.status(403).json(
        errorResponse(ErrorCodes.FORBIDDEN, 'شما دسترسی به حذف سرویس ندارید')
      );
    }

    const service = await Service.findOne({
      _id: req.params.id,
      tenant: req.tenantId
    });

    if (!service) {
      return res.status(404).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'سرویس یافت نشد')
      );
    }

    // حذف سرویس
    await service.deleteOne();

    res.json(
      successResponse(null, 'سرویس با موفقیت حذف شد')
    );

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getService,
  createService,
  deleteService
};
