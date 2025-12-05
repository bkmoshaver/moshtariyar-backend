/**
 * Auth Controller
 * مدیریت احراز هویت و ثبت‌نام
 */

const { Tenant, Staff } = require('../models');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { successResponse, errorResponse, ErrorCodes } = require('../utils/errorResponse');

/**
 * ثبت‌نام تنانت جدید
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { businessName, ownerName, phone, email, password } = req.body;

    // بررسی تکراری نبودن شماره موبایل
    const existingStaff = await Staff.findOne({ phone });
    if (existingStaff) {
      return res.status(400).json(
        errorResponse(ErrorCodes.DUPLICATE_ENTRY, 'این شماره موبایل قبلاً ثبت شده است')
      );
    }

    // ایجاد تنانت
    const tenant = new Tenant({
      name: businessName,
      plan: {
        type: 'free',
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 روز رایگان
      }
    });

    await tenant.save();

    // ایجاد کارمند مالک
    const staff = new Staff({
      tenant: tenant._id,
      name: ownerName,
      phone,
      email: email || undefined,
      password,
      role: 'owner'
    });

    // تنظیم دسترسی‌های پیش‌فرض
    staff.setDefaultPermissions();
    await staff.save();

    // ساخت توکن‌ها
    const accessToken = generateAccessToken({
      staffId: staff._id,
      tenantId: tenant._id,
      role: staff.role
    });

    const refreshToken = generateRefreshToken({
      staffId: staff._id,
      tenantId: tenant._id
    });

    // پاسخ موفق
    res.status(201).json(
      successResponse({
        tenant: {
          id: tenant._id,
          name: tenant.name,
          plan: tenant.plan.type
        },
        staff: {
          id: staff._id,
          name: staff.name,
          phone: staff.phone,
          role: staff.role
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }, 'ثبت‌نام با موفقیت انجام شد')
    );

  } catch (error) {
    next(error);
  }
};

/**
 * ورود کاربر
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    // یافتن کارمند
    const staff = await Staff.findOne({ phone })
      .select('+password')
      .populate('tenant', 'name plan isActive');

    if (!staff) {
      return res.status(401).json(
        errorResponse(ErrorCodes.INVALID_CREDENTIALS)
      );
    }

    // بررسی رمز عبور
    const isPasswordValid = await staff.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json(
        errorResponse(ErrorCodes.INVALID_CREDENTIALS)
      );
    }

    // بررسی فعال بودن
    if (!staff.isActive) {
      return res.status(403).json(
        errorResponse(ErrorCodes.FORBIDDEN, 'حساب کاربری شما غیرفعال است')
      );
    }

    if (!staff.tenant.isActive) {
      return res.status(403).json(
        errorResponse(ErrorCodes.FORBIDDEN, 'حساب کسب‌وکار غیرفعال است')
      );
    }

    // به‌روزرسانی آخرین ورود
    staff.lastLogin = new Date();
    await staff.save();

    // ساخت توکن‌ها
    const accessToken = generateAccessToken({
      staffId: staff._id,
      tenantId: staff.tenant._id,
      role: staff.role
    });

    const refreshToken = generateRefreshToken({
      staffId: staff._id,
      tenantId: staff.tenant._id
    });

    // پاسخ موفق
    res.json(
      successResponse({
        staff: {
          id: staff._id,
          name: staff.name,
          phone: staff.phone,
          role: staff.role,
          permissions: staff.permissions
        },
        tenant: {
          id: staff.tenant._id,
          name: staff.tenant.name,
          plan: staff.tenant.plan.type
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }, 'ورود موفقیت‌آمیز بود')
    );

  } catch (error) {
    next(error);
  }
};

/**
 * دریافت اطلاعات کاربر فعلی
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    res.json(
      successResponse({
        staff: {
          id: req.staff._id,
          name: req.staff.name,
          phone: req.staff.phone,
          email: req.staff.email,
          role: req.staff.role,
          permissions: req.staff.permissions,
          stats: req.staff.stats
        },
        tenant: {
          id: req.tenant._id,
          name: req.tenant.name,
          plan: req.tenant.plan,
          giftSettings: req.tenant.giftSettings,
          stats: req.tenant.stats
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
