/**
 * Service Controller
 * کنترلر مدیریت سرویس‌ها
 */

const { Service, Client, Tenant } = require('../models');
const { successResponse, errorResponse, ErrorCodes } = require('../utils/errorResponse');
const { smsQueue } = require('../config/queue');

/**
 * دریافت لیست سرویس‌ها
 * GET /api/services
 */
const getServices = async (req, res, next) => {
  try {
    const { clientId, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};
    if (req.tenantId) query.tenant = req.tenantId;
    if (clientId) query.client = clientId;
    
    if (startDate || endDate) {
      query.serviceDate = {};
      if (startDate) query.serviceDate.$gte = new Date(startDate);
      if (endDate) query.serviceDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      Service.find(query)
        .populate('client', 'name phone wallet')
        .populate('staff', 'name phone')
        .populate('tenant', 'name')
        .sort({ serviceDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Service.countDocuments(query)
    ]);

    res.json(successResponse({
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }));

  } catch (error) {
    next(error);
  }
};

/**
 * دریافت جزئیات یک سرویس
 * GET /api/services/:id
 */
const getService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = { _id: id };
    if (req.tenantId) query.tenant = req.tenantId;

    const service = await Service.findOne(query)
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
 * ثبت سرویس جدید با کسر خودکار کیف پول و ارسال پیامک
 * POST /api/services
 */
const createService = async (req, res, next) => {
  try {
    const { clientId, title, description, amount, notes } = req.body;

    // یافتن مشتری
    const query = { _id: clientId };
    if (req.tenantId) query.tenant = req.tenantId;
    
    const client = await Client.findOne(query);

    if (!client) {
      return res.status(404).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'مشتری یافت نشد')
      );
    }

    // ✅ اطمینان از وجود wallet و gifts
    if (!client.wallet) {
      client.wallet = {
        balance: 0,
        totalGifts: 0,
        totalUsed: 0,
        totalSpent: 0,
        gifts: []
      };
    }
    if (!client.wallet.gifts) {
      client.wallet.gifts = [];
    }

    // تنظیمات هدیه (پیش‌فرض 10% و 30 روز)
    const giftPercentage = 10;
    const giftExpiryDays = 30;

    // کسر خودکار کیف پول (FIFO - قدیمی‌ترین هدایا اول)
    let walletUsedAmount = 0;
    const usedGifts = [];

    if (client.wallet.balance > 0 && amount > 0) {
      let remainingAmount = amount;
      
      // مرتب‌سازی هدایا بر اساس تاریخ (FIFO)
      const activeGifts = client.wallet.gifts
        .filter(g => g.balance > 0 && (!g.expiresAt || g.expiresAt > new Date()))
        .sort((a, b) => a.createdAt - b.createdAt);

      for (const gift of activeGifts) {
        if (remainingAmount <= 0) break;

        const useAmount = Math.min(gift.balance, remainingAmount);
        
        gift.balance -= useAmount;
        gift.used += useAmount;
        
        usedGifts.push({
          giftId: gift._id,
          amount: useAmount,
          remainingBalance: gift.balance
        });

        walletUsedAmount += useAmount;
        remainingAmount -= useAmount;
      }

      // به‌روزرسانی موجودی کل کیف پول
      client.wallet.balance -= walletUsedAmount;
      client.wallet.totalUsed += walletUsedAmount;
    }

    // محاسبه مبلغ نهایی
    const finalAmount = amount - walletUsedAmount;

    // محاسبه هدیه جدید (بر اساس مبلغ پرداختی واقعی)
    const giftAmount = Math.floor(finalAmount * (giftPercentage / 100));

    // ایجاد سرویس
    const serviceData = {
      client: clientId,
      title: title || description,
      description: description || undefined,
      amount,
      gift: {
        amount: giftAmount,
        percentage: giftPercentage,
        applied: giftAmount > 0
      },
      walletUsed: {
        amount: walletUsedAmount,
        applied: walletUsedAmount > 0,
        gifts: usedGifts
      },
      finalAmount,
      notes: notes || undefined,
      serviceDate: new Date()
    };
    
    if (req.tenantId) serviceData.tenant = req.tenantId;
    if (req.staff) serviceData.staff = req.staff._id;
    
    const service = new Service(serviceData);
    await service.save();

    // اضافه کردن هدیه جدید به کیف پول
    if (giftAmount > 0) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + giftExpiryDays);

      client.wallet.gifts.push({
        amount: giftAmount,
        balance: giftAmount,
        used: 0,
        source: 'service',
        sourceId: service._id,
        expiresAt: expiryDate,
        createdAt: new Date()
      });

      client.wallet.balance += giftAmount;
      client.wallet.totalGifts += giftAmount;
    }

    // به‌روزرسانی آمار مشتری
    client.wallet.totalSpent += finalAmount;
    client.stats.totalServices += 1;
    client.stats.totalVisits += 1;
    client.stats.lastVisit = new Date();
    
    if (client.stats.totalServices > 0) {
      client.stats.averageSpending = Math.floor(client.wallet.totalSpent / client.stats.totalServices);
    }

    await client.save();

    // به‌روزرسانی آمار کارمند (فقط برای Tenant mode)
    if (req.staff) {
      await req.staff.updateOne({
        $inc: {
          'stats.totalServices': 1,
          'stats.totalRevenue': finalAmount
        }
      });
    }

    // ارسال پیامک فوری (IMMEDIATE_SMS)
    try {
      if (smsQueue) {
        // استفاده از Queue
        await smsQueue.add('IMMEDIATE_SMS', {
          type: 'IMMEDIATE_SMS',
          data: {
            phone: client.phone,
            name: client.name,
            amount: finalAmount,
            gift: giftAmount,
            balance: client.wallet.balance,
            businessName: process.env.BUSINESS_NAME || 'مشتریار'
          }
        });
        console.log(`✅ Immediate SMS queued for ${client.phone}`);
      } else {
        // ارسال مستقیم بدون Queue
        const smsService = require('../services/sms');
        await smsService.sendServiceSMS({
          phone: client.phone,
          name: client.name,
          amount: finalAmount,
          gift: giftAmount,
          balance: client.wallet.balance,
          businessName: process.env.BUSINESS_NAME || 'مشتریار'
        });
        console.log(`✅ Immediate SMS sent directly to ${client.phone}`);
      }
    } catch (smsError) {
      console.error('❌ خطا در ارسال پیامک:', smsError);
      // ادامه می‌دهیم حتی اگر پیامک ارسال نشود
    }

    // بازگشت سرویس با اطلاعات کامل
    const populatedService = await Service.findById(service._id)
      .populate('client', 'name phone wallet')
      .populate('staff', 'name phone')
      .populate('tenant', 'name');

    res.status(201).json(successResponse({
      service: populatedService,
      message: 'سرویس با موفقیت ثبت شد'
    }));

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
    const { id } = req.params;

    const query = { _id: id };
    if (req.tenantId) query.tenant = req.tenantId;

    const service = await Service.findOne(query);

    if (!service) {
      return res.status(404).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'سرویس یافت نشد')
      );
    }

    await service.deleteOne();

    res.json(successResponse({
      message: 'سرویس با موفقیت حذف شد'
    }));

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
