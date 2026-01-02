/**
 * Tenant Controller
 * مدیریت ثبت‌نام و تنظیمات مجموعه‌ها
 */

const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const { successResponse, errorResponse, ErrorCodes } = require('../utils/errorResponse');

/**
 * ثبت‌نام مجموعه جدید (Onboarding)
 * POST /api/tenants/register
 * همزمان Tenant و User (Admin) می‌سازد
 */
exports.registerTenant = async (req, res, next) => {
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    const { 
      businessName, // نام مجموعه
      name,         // نام مدیر
      email,        // ایمیل مدیر
      password,     // رمز عبور
      phone         // شماره تماس (اختیاری)
    } = req.body;

    // ۱. بررسی تکراری نبودن ایمیل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // await session.abortTransaction();
      return res.status(400).json(
        errorResponse(ErrorCodes.DUPLICATE_ENTRY, 'این ایمیل قبلاً ثبت شده است')
      );
    }

    // ۲. ایجاد مجموعه (Tenant)
    const tenant = new Tenant({
      name: businessName,
      plan: {
        type: 'free', // پلن پیش‌فرض رایگان
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // ۳۰ روز اعتبار اولیه
      }
    });
    await tenant.save();

    // ۳. ایجاد مدیر مجموعه (Tenant Admin)
    const user = new User({
      name,
      email,
      password,
      role: 'tenant_admin',
      tenant: tenant._id // اتصال کاربر به مجموعه
    });
    await user.save();

    // await session.commitTransaction();

    // ۴. ارسال پاسخ موفقیت
    res.status(201).json(
      successResponse({
        tenant: {
          id: tenant._id,
          name: tenant.name,
          plan: tenant.plan.type
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }, 'مجموعه شما با موفقیت ساخته شد')
    );

  } catch (error) {
    // await session.abortTransaction();
    next(error);
  } finally {
    // session.endSession();
  }
};

/**
 * دریافت اطلاعات مجموعه (برای داشبورد)
 * GET /api/tenants/me
 */
exports.getCurrentTenant = async (req, res, next) => {
  try {
    if (!req.tenant) {
      return res.status(404).json(errorResponse(ErrorCodes.NOT_FOUND, 'مجموعه‌ای یافت نشد'));
    }
    
    res.json(successResponse({ tenant: req.tenant }));
  } catch (error) {
    next(error);
  }
};

/**
 * به‌روزرسانی تنظیمات مجموعه
 * PUT /api/tenants/me
 */
exports.updateTenant = async (req, res, next) => {
  try {
    const { name, branding, giftSettings } = req.body;
    const tenant = req.tenant;

    if (name) tenant.name = name;
    
    if (branding) {
      tenant.branding = {
        ...tenant.branding,
        ...branding
      };
    }

    if (giftSettings) {
      tenant.giftSettings = {
        ...tenant.giftSettings,
        ...giftSettings
      };
    }

    await tenant.save();

    res.json(successResponse({ tenant }, 'تنظیمات با موفقیت ذخیره شد'));
  } catch (error) {
    next(error);
  }
};
