/**
 * Super Admin Controller
 * مدیریت سیستم توسط سوپر ادمین
 */

const User = require('../models/User');
const Tenant = require('../models/Tenant');
const ActivityLog = require('../models/ActivityLog');
const { successResponse, errorResponse, ErrorCodes } = require('../utils/errorResponse');

/**
 * دریافت آمار کلی داشبورد
 * GET /api/admin/stats
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalTenants = await Tenant.countDocuments();
    const totalUsers = await User.countDocuments();
    const activeTenants = await Tenant.countDocuments({ isActive: true });
    const recentLogs = await ActivityLog.find()
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'name email role');

    res.json(
      successResponse({
        stats: {
          totalTenants,
          activeTenants,
          totalUsers,
          pendingTenants: totalTenants - activeTenants
        },
        recentLogs
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * دریافت لیست فروشگاه‌ها
 * GET /api/admin/tenants
 */
exports.getTenants = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tenants = await Tenant.find()
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('owner', 'name email');

    const total = await Tenant.countDocuments();

    res.json(
      successResponse({
        tenants,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * تغییر وضعیت فروشگاه (تایید/مسدود)
 * PATCH /api/admin/tenants/:id/status
 */
exports.updateTenantStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'فروشگاه یافت نشد')
      );
    }

    tenant.isActive = isActive;
    await tenant.save();

    // ثبت لاگ
    await ActivityLog.create({
      user: req.user._id,
      action: isActive ? 'APPROVE_TENANT' : 'BLOCK_TENANT',
      details: `فروشگاه ${tenant.businessName} ${isActive ? 'تایید' : 'مسدود'} شد`,
      status: 'success'
    });

    res.json(
      successResponse({ tenant }, 'وضعیت فروشگاه با موفقیت تغییر کرد')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * دریافت لاگ فعالیت‌ها
 * GET /api/admin/logs
 */
exports.getActivityLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find()
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email role')
      .populate('tenant', 'businessName');

    const total = await ActivityLog.countDocuments();

    res.json(
      successResponse({
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    );
  } catch (error) {
    next(error);
  }
};
