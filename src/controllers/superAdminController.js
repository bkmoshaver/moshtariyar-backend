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
      ; // .populate('owner', 'name email'); // Owner field does not exist in Tenant schema

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

/**
 * دریافت لیست کاربران (برای سوپر ادمین)
 * GET /api/admin/users
 */
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('tenant', 'businessName');

    const total = await User.countDocuments();

    res.json(
      successResponse({
        users,
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
 * ویرایش کاربر (برای سوپر ادمین)
 * PATCH /api/admin/users/:id
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, password, tenant } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'کاربر یافت نشد')
      );
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (password) user.password = password; // Password hashing is handled in User model pre-save
    
    // اگر نقش نیاز به فروشگاه دارد و tenant ارسال شده است، آن را ست کن
    if (tenant) {
      user.tenant = tenant;
    } else if (role === 'client' || role === 'super_admin') {
      // اگر نقش مشتری یا سوپر ادمین است، فروشگاه را حذف کن (اختیاری)
      // user.tenant = undefined; 
    }

    await user.save();

    // ثبت لاگ
    await ActivityLog.create({
      user: req.user._id,
      action: 'UPDATE_USER',
      details: `کاربر ${user.email} ویرایش شد`,
      status: 'success'
    });

    res.json(
      successResponse({ user }, 'کاربر با موفقیت ویرایش شد')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * حذف کاربر (برای سوپر ادمین)
 * DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json(
        errorResponse(ErrorCodes.NOT_FOUND, 'کاربر یافت نشد')
      );
    }

    await User.deleteOne({ _id: req.params.id });

    // ثبت لاگ
    await ActivityLog.create({
      user: req.user._id,
      action: 'DELETE_USER',
      details: `کاربر ${user.email} حذف شد`,
      status: 'success'
    });

    res.json(
      successResponse(null, 'کاربر با موفقیت حذف شد')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * دریافت لیست ساده فروشگاه‌ها برای دراپ‌داون
 * GET /api/admin/tenants/list
 */
exports.getTenantsList = async (req, res, next) => {
  try {
    const tenants = await Tenant.find({ isActive: true })
      .select('name _id businessName')
      .sort('name');

    res.json(
      successResponse({ tenants })
    );
  } catch (error) {
    next(error);
  }
};
