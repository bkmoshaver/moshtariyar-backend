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
