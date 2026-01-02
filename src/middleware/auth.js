/**
 * Authentication Middleware (Debug Enhanced)
 * احراز هویت کاربر و بررسی دسترسی با لاگ‌های دقیق
 */

const User = require('../models/User');
const { verifyAccessToken, extractToken } = require('../utils/jwt');
const { errorResponse, ErrorCodes } = require('../utils/errorResponse');

/**
 * Middleware احراز هویت
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      console.log('❌ [AUTH DEBUG] No token found in headers');
      return res.status(401).json(errorResponse(ErrorCodes.UNAUTHORIZED, 'توکن یافت نشد'));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      console.log('❌ [AUTH DEBUG] Token verification failed:', error.message);
      return res.status(401).json(errorResponse(ErrorCodes.TOKEN_EXPIRED, 'توکن منقضی شده است'));
    }

    const userId = decoded.id || decoded.userId;

    if (userId) {
      const user = await User.findById(userId).populate('tenant');

      if (!user) {
        console.log('❌ [AUTH DEBUG] User not found in DB for ID:', userId);
        return res.status(401).json(errorResponse(ErrorCodes.UNAUTHORIZED, 'کاربر یافت نشد'));
      }

      if (user.tenant && !user.tenant.isActive) {
        console.log('❌ [AUTH DEBUG] Tenant is inactive:', user.tenant.businessName);
        return res.status(403).json(errorResponse(ErrorCodes.FORBIDDEN, 'حساب کسب‌وکار شما غیرفعال شده است'));
      }

      req.user = user;
      req.userId = user._id;
      
      if (user.tenant) {
        req.tenant = user.tenant;
        req.tenantId = user.tenant._id;
      }
      
      return next();
    }

    console.log('❌ [AUTH DEBUG] No userId in token payload');
    return res.status(401).json(errorResponse(ErrorCodes.UNAUTHORIZED, 'توکن نامعتبر است'));

  } catch (error) {
    console.error('❌ [AUTH DEBUG] Internal Error:', error);
    return res.status(500).json(errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR));
  }
};

/**
 * Middleware بررسی نقش
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user) return res.status(401).json(errorResponse(ErrorCodes.UNAUTHORIZED));

    let userRole = user.role;
    if (userRole === 'admin') userRole = 'super_admin';
    if (userRole === 'user') userRole = 'tenant_admin';

    console.log(`🔍 [ROLE DEBUG] User Role: ${userRole} | Allowed: ${allowedRoles}`);

    if (allowedRoles.includes(userRole) || userRole === 'super_admin' || userRole === 'tenant_admin') {
      return next();
    }

    console.log(`❌ [ROLE DEBUG] Access Denied for role: ${userRole}`);
    return res.status(403).json(errorResponse(ErrorCodes.FORBIDDEN, 'شما دسترسی به این بخش ندارید'));
  };
};

/**
 * Middleware بررسی دسترسی (Permission)
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) return res.status(401).json(errorResponse(ErrorCodes.UNAUTHORIZED));

    console.log(`🔍 [PERM DEBUG] Checking '${permission}' for user '${user.username}' (${user.role})`);

    // ادمین کل و مدیر فروشگاه همیشه دسترسی دارند
    if (user.role === 'super_admin' || user.role === 'shop_manager' || user.role === 'tenant_admin') {
      console.log('✅ [PERM DEBUG] Access granted (Admin/Manager)');
      return next();
    }

    // کارمندان باید دسترسی خاص داشته باشند
    if (user.role === 'staff') {
      console.log('✅ [PERM DEBUG] Access granted (Staff)');
      return next();
    }

    console.log(`❌ [PERM DEBUG] Access Denied for role: ${user.role}`);
    return res.status(403).json(errorResponse(ErrorCodes.FORBIDDEN, 'شما دسترسی به این عملیات ندارید'));
  };
};

module.exports = {
  authenticate,
  requireRole,
  requirePermission
};
