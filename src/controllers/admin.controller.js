/**
 * Admin Controller
 * مدیریت کل سیستم (Super Admin)
 */

const Tenant = require('../models/Tenant');
const User = require('../models/User');
const { successResponse, errorResponse, ErrorCodes } = require('../utils/errorResponse');

/**
 * دریافت آمار کلی سیستم
 * GET /api/admin/stats
 */
exports.getSystemStats = async (req, res, next) => {
  try {
    const totalTenants = await Tenant.countDocuments();
    const activeTenants = await Tenant.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments();
    
    // محاسبه درآمد کل (فرضی - از روی پلن‌ها)
    // در آینده باید از جدول پرداخت‌ها خوانده شود
    const revenue = 0; 

    res.json(successResponse({
      totalTenants,
      activeTenants,
      totalUsers,
      revenue
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * دریافت لیست تمام مجموعه‌ها
 * GET /api/admin/tenants
 */
exports.getAllTenants = async (req, res, next) => {
  try {
    const tenants = await Tenant.find()
      .sort({ createdAt: -1 })
      .select('name plan isActive createdAt stats');

    res.json(successResponse({ tenants }));
  } catch (error) {
    next(error);
  }
};

/**
 * تغییر وضعیت مجموعه (فعال/غیرفعال)
 * PATCH /api/admin/tenants/:id/status
 */
exports.toggleTenantStatus = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    
    if (!tenant) {
      return res.status(404).json(errorResponse(ErrorCodes.NOT_FOUND, 'مجموعه یافت نشد'));
    }

    tenant.isActive = !tenant.isActive;
    await tenant.save();

    res.json(successResponse({ 
      id: tenant._id, 
      isActive: tenant.isActive 
    }, 'وضعیت مجموعه تغییر کرد'));
  } catch (error) {
    next(error);
  }
};

/**
 * دریافت لیست تمام کاربران سیستم
 * GET /api/admin/users
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('tenant', 'name')
      .sort({ createdAt: -1 });

    res.json(successResponse({ users }));
  } catch (error) {
    next(error);
  }
};

/**
 * تغییر نقش هر کاربری در سیستم
 * PATCH /api/admin/users/:id/role
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['super_admin', 'tenant_admin', 'staff', 'client'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'نقش انتخاب شده معتبر نیست')
      );
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json(errorResponse(ErrorCodes.NOT_FOUND, 'کاربر یافت نشد'));
    }

    // جلوگیری از تغییر نقش خود سوپر ادمین توسط خودش (برای جلوگیری از قفل شدن)
    if (user._id.toString() === req.user._id.toString() && role !== 'super_admin') {
      return res.status(400).json(
        errorResponse(ErrorCodes.ACCESS_DENIED, 'شما نمی‌توانید نقش سوپر ادمین خود را تغییر دهید')
      );
    }

    user.role = role;
    await user.save();

    res.json(successResponse({ 
      id: user._id, 
      role: user.role 
    }, 'نقش کاربر با موفقیت تغییر کرد'));
  } catch (error) {
    next(error);
  }
};
