/**
 * Authentication Middleware
 * احراز هویت کاربر و بررسی دسترسی (نسخه Multi-Tenant)
 */

const User = require('../models/User');
const { verifyAccessToken, extractToken } = require('../utils/jwt');
const { errorResponse, ErrorCodes } = require('../utils/errorResponse');

/**
 * Middleware احراز هویت
 */
const authenticate = async (req, res, next) => {
  try {
    // استخراج توکن از هدر
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json(
        errorResponse(ErrorCodes.UNAUTHORIZED, 'توکن یافت نشد. لطفاً وارد شوید')
      );
    }

    // تأیید توکن
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      return res.status(401).json(
        errorResponse(ErrorCodes.TOKEN_EXPIRED, 'توکن منقضی شده است')
      );
    }

    // بارگذاری اطلاعات کاربر
    // نکته مهم: در authController.js توکن با کلید id ساخته می‌شود، اما اینجا userId چک می‌شد
    // برای اطمینان، هر دو حالت (id و userId) را چک می‌کنیم
    const userId = decoded.id || decoded.userId;

    if (userId) {
      // populate کردن tenant برای دسترسی به اطلاعات مجموعه
      const user = await User.findById(userId).populate('tenant');

      if (!user) {
        return res.status(401).json(
          errorResponse(ErrorCodes.UNAUTHORIZED, 'کاربر یافت نشد')
        );
      }

      // بررسی فعال بودن مجموعه (اگر کاربر به مجموعه‌ای متصل است)
      if (user.tenant && !user.tenant.isActive) {
        return res.status(403).json(
          errorResponse(ErrorCodes.FORBIDDEN, 'حساب کسب‌وکار شما غیرفعال شده است')
        );
      }

      // اضافه کردن اطلاعات به request
      req.user = user;
      req.userId = user._id;
      
      // اگر کاربر به مجموعه‌ای متصل است، tenantId را ست می‌کنیم
      // این کلید اصلی فیلتر کردن داده‌ها در کنترلرهاست
      if (user.tenant) {
        req.tenant = user.tenant;
        req.tenantId = user.tenant._id;
      }
      
      return next();
    }

    return res.status(401).json(
      errorResponse(ErrorCodes.UNAUTHORIZED, 'توکن نامعتبر است')
    );

  } catch (error) {
    console.error('خطا در احراز هویت:', error);
    return res.status(500).json(
      errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

/**
 * Middleware بررسی نقش
 * @param {Array<string>} allowedRoles - نقش‌های مجاز
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json(
        errorResponse(ErrorCodes.UNAUTHORIZED)
      );
    }

    // نگاشت نقش‌های قدیمی به جدید برای سازگاری
    let userRole = user.role;
    if (userRole === 'admin') userRole = 'super_admin'; // ادمین قدیمی -> سوپر ادمین
    if (userRole === 'user') userRole = 'tenant_admin'; // یوزر قدیمی -> مدیر مجموعه (پیش‌فرض)

    // اگر نقش کاربر در لیست مجاز بود یا سوپر ادمین بود
    if (allowedRoles.includes(userRole) || userRole === 'super_admin') {
      return next();
    }

    return res.status(403).json(
      errorResponse(ErrorCodes.FORBIDDEN, 'شما دسترسی به این بخش ندارید')
    );
  };
};

/**
 * Middleware بررسی دسترسی (Permission)
 * فعلاً ساده‌سازی شده
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    // فعلاً همه کاربران لاگین شده دسترسی دارند
    // در آینده بر اساس جدول دسترسی‌ها چک می‌شود
    if (req.user) {
      return next();
    }
    return res.status(403).json(errorResponse(ErrorCodes.FORBIDDEN));
  };
};

module.exports = {
  authenticate,
  requireRole,
  requirePermission
};
