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
 */
exports.registerTenant = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      businessName, // نام مجموعه
      name,         // نام مدیر
      email,        // ایمیل مدیر
      password,     // رمز عبور
      phone         // شماره تماس (اختیاری)
    } = req.body;

    // 1. بررسی تکراری بودن ایمیل
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json(errorResponse(ErrorCodes.DUPLICATE_ENTRY, 'این ایمیل قبلاً ثبت شده است'));
    }

    // 2. ساخت اسلاگ یکتا برای مجموعه
    let slug = businessName.toLowerCase().replace(/\s+/g, '-');
    // بررسی تکراری بودن اسلاگ (ساده)
    const existingTenant = await Tenant.findOne({ slug }).session(session);
    if (existingTenant) {
      slug = `${slug}-${Date.now()}`;
    }

    // 3. ایجاد کاربر ادمین
    const user = await User.create([{
      name,
      email,
      password,
      role: 'tenant_admin',
      phone // اگر شماره تماس در ثبت‌نام باشد
    }], { session });

    // 4. ایجاد مجموعه
    const tenant = await Tenant.create([{
      name: businessName,
      slug,
      owner: user[0]._id,
      phone // شماره تماس مجموعه هم ست می‌شود
    }], { session });

    // 5. آپدیت کاربر با ID مجموعه
    user[0].tenant = tenant[0]._id;
    await user[0].save({ session });

    await session.commitTransaction();
    session.endSession();

    // تولید توکن (ساده شده - در واقعیت باید از متد مدل یا سرویس auth استفاده شود)
    // اینجا فرض می‌کنیم فرانت‌اند بعد از ثبت‌نام رایرکت می‌کند به لاگین
    
    res.status(201).json(successResponse({ 
      tenant: tenant[0],
      user: user[0]
    }, 'مجموعه با موفقیت ایجاد شد'));

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

/**
 * دریافت تنظیمات مجموعه فعلی
 * GET /api/tenants/me
 */
exports.getCurrentTenant = async (req, res, next) => {
  try {
    // کاربر باید لاگین باشد و tenantId داشته باشد
    const tenant = await Tenant.findById(req.user.tenant);
    if (!tenant) {
      return res.status(404).json(errorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'مجموعه یافت نشد'));
    }
    res.json(successResponse(tenant));
  } catch (error) {
    next(error);
  }
};

/**
 * آپدیت تنظیمات مجموعه
 * PUT /api/tenants/me
 */
exports.updateTenant = async (req, res, next) => {
  try {
    const { 
      name, 
      slug, 
      branding, 
      giftSettings,
      address, // فیلد جدید
      phone,   // فیلد جدید
      banner   // فیلد جدید (اگر جداگانه ارسال شود)
    } = req.body;

    const tenant = await Tenant.findById(req.user.tenant);
    if (!tenant) {
      return res.status(404).json(errorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'مجموعه یافت نشد'));
    }

    if (name) tenant.name = name;
    
    // آپدیت فیلدهای جدید
    if (address !== undefined) tenant.address = address;
    if (phone !== undefined) tenant.phone = phone;
    
    // Check slug uniqueness if changed
    if (slug && slug !== tenant.slug) {
      const existing = await Tenant.findOne({ slug, _id: { $ne: tenant._id } });
      if (existing) {
        return res.status(400).json(errorResponse(ErrorCodes.DUPLICATE_ENTRY, 'این نامک قبلاً استفاده شده است'));
      }
      tenant.slug = slug;
    }
    
    if (branding) {
      tenant.branding = {
        ...tenant.branding,
        ...branding
      };
      // اگر بنر در برندینگ باشد که خودکار آپدیت می‌شود
    }
    
    // اگر بنر جداگانه ارسال شده باشد (برای سازگاری)
    if (banner) {
      if (!tenant.branding) tenant.branding = {};
      tenant.branding.banner = banner;
    }

    if (giftSettings) {
      tenant.giftSettings = {
        ...tenant.giftSettings,
        ...giftSettings
      };
    }

    await tenant.save();

    res.json(successResponse(tenant, 'تنظیمات با موفقیت ذخیره شد'));
  } catch (error) {
    next(error);
  }
};
