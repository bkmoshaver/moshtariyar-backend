/**
 * Authentication Middleware
 * احراز هویت کاربر و بررسی دسترسی
 */

const { Staff } = require('../models');
const { verifyAccessToken, extractToken } = require('../utils/jwt');
const { errorResponse, ErrorCodes } = require('../utils/errorResponse');

/**
 * Middleware احراز هویت
 * بررسی توکن و بارگذاری اطلاعات کاربر
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

    // بارگذاری اطلاعات کارمند
    const staff = await Staff.findById(decoded.staffId)
      .populate('tenant', 'name plan isActive');

    if (!staff) {
      return res.status(401).json(
        errorResponse(ErrorCodes.UNAUTHORIZED, 'کاربر یافت نشد')
      );
    }

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

    // اضافه کردن اطلاعات به request
    req.staff = staff;
    req.tenant = staff.tenant;
    req.tenantId = staff.tenant._id;

    next();
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
    if (!req.staff) {
      return res.status(401).json(
        errorResponse(ErrorCodes.UNAUTHORIZED)
      );
    }

    if (!allowedRoles.includes(req.staff.role)) {
      return res.status(403).json(
        errorResponse(ErrorCodes.FORBIDDEN, 'شما دسترسی به این بخش ندارید')
      );
    }

    next();
  };
};

/**
 * Middleware بررسی دسترسی
 * @param {string} permission - نام دسترسی مورد نیاز
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.staff) {
      return res.status(401).json(
        errorResponse(ErrorCodes.UNAUTHORIZED)
      );
    }

    if (!req.staff.hasPermission(permission)) {
      return res.status(403).json(
        errorResponse(ErrorCodes.FORBIDDEN, 'شما دسترسی به این عملیات ندارید')
      );
    }

    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
  requirePermission
};
