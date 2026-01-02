/**
 * Authentication Middleware
 * احراز هویت کاربر و بررسی دسترسی
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
      console.log('❌ [AUTH] No token found in headers');
      return res.status(401).json(
        errorResponse(ErrorCodes.UNAUTHORIZED, 'توکن یافت نشد. لطفاً وارد شوید')
      );
    }

    // تأیید توکن
    let decoded;
    try {
      decoded = verifyAccessToken(token);
      // console.log('✅ [AUTH] Token decoded:', decoded);
    } catch (error) {
      console.log('❌ [AUTH] Token verification failed:', error.message);
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
        console.log('❌ [AUTH] User not found in DB for ID:', userId);
        return res.status(401).json(
          errorResponse(ErrorCodes.UNAUTHORIZED, 'کاربر یافت نشد')
        );
      }

      // console.log('✅ [AUTH] User authenticated:', user.email, '| Role:', user.role);

      // بررسی فعال بودن مجموعه (اگر کاربر به مجموعه‌ای متصل است)
      if (user.tenant && !user.tenant.isActive) {
        console.log('❌ [AUTH] Tenant is inactive:', user.tenant.businessName);
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

    console.log('❌ [AUTH] No userId in token payload');
    return res.status(401).json(
      errorResponse(ErrorCodes.UNAUTHORIZED, 'توکن نامعتبر است')
    );

  } catch (error) {
    console.error('❌ [AUTH] Internal Error:', error);
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

    // console.log(`🔍 [ROLE CHECK] User Role: ${userRole} | Allowed: ${allowedRoles}`);

    // اگر نقش کاربر در لیست مجاز بود یا سوپر ادمین بود
    if (allowedRoles.includes(userRole) || userRole === 'super_admin') {
      return next();
    }

    console.log('❌ [ROLE CHECK] Access Denied');
    return res.status(403).json(
      errorResponse(ErrorCodes.FORBIDDEN, 'شما دسترسی به این بخش ندارید')
    );
  };
};

/**
 * Middleware بررسی دسترسی (Permission)
 * @param {string} permission - نام دسترسی مورد نیاز
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json(
        errorResponse(ErrorCodes.UNAUTHORIZED)
      );
    }

    // ادمین کل و مدیر فروشگاه همیشه دسترسی دارند
    if (user.role === 'super_admin' || user.role === 'shop_manager' || user.role === 'tenant_admin') {
      return next();
    }

    // کارمندان باید دسترسی خاص داشته باشند
    if (user.role === 'staff') {
      // فعلاً برای جلوگیری از خطا، اگر کاربر staff باشد هم اجازه می‌دهیم
      // تا زمانی که سیستم دسترسی‌های ریز (granular permissions) کامل پیاده شود
      return next();
    }

    // مشتریان دسترسی ندارند
    if (user.role === 'customer') {
      console.log('❌ [PERMISSION] Customer tried to access protected route');
      return res.status(403).json(
        errorResponse(ErrorCodes.FORBIDDEN, 'مشتریان دسترسی به این عملیات ندارند')
      );
    }
    
    // سایر نقش‌ها
    console.log(`❌ [PERMISSION] Access denied for role: ${user.role}`);
    return res.status(403).json(
      errorResponse(ErrorCodes.FORBIDDEN, 'شما دسترسی به این عملیات ندارید')
    );
  };
};

module.exports = {
  authenticate,
  requireRole,
  requirePermission
};
