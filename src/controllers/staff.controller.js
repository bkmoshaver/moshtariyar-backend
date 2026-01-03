const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

// @desc      Get all staff for current tenant
// @route     GET /api/v1/staff
// @access    Private (Tenant Admin)
exports.getStaff = async (req, res, next) => {
  try {
    // Find the tenant associated with the current user
    // For now, we assume the user is a tenant_admin and we find their tenant
    // In a real app, req.user.tenant would be populated
    
    // Fallback: Find the first tenant (since we don't have full multi-tenancy yet)
    const tenant = await Tenant.findOne();
    
    if (!tenant) {
      return res.status(200).json({ success: true, count: 0, data: { staff: [] } });
    }

    // Find users who are staff or tenant_admin and linked to this tenant
    // OR users who are staff/tenant_admin but not linked to any tenant (legacy)
    const staff = await User.find({
      role: { $in: ['staff', 'tenant_admin'] },
      $or: [
        { tenant: tenant._id },
        { tenant: null } // Include legacy users for now
      ]
    });

    // Transform data to match frontend expectation
    const staffList = staff.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }));

    res.status(200).json({
      success: true,
      count: staffList.length,
      data: { staff: staffList }
    });
  } catch (err) {
    next(err);
  }
};

// @desc      Create a new staff member
// @route     POST /api/v1/staff
// @access    Private (Tenant Admin)
exports.createStaff = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Find the tenant
    const tenant = await Tenant.findOne();
    if (!tenant) {
      return next(new ErrorResponse('No tenant found', 404));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'staff',
      tenant: tenant._id
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc      Delete staff member
// @route     DELETE /api/v1/staff/:id
// @access    Private (Tenant Admin)
exports.deleteStaff = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`No user with the id of ${req.params.id}`, 404));
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user.id) {
      return next(new ErrorResponse('You cannot delete yourself', 400));
    }

    await user.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc      Update staff role
// @route     PATCH /api/v1/staff/:id/role
// @access    Private (Tenant Admin)
exports.updateStaffRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    const user = await User.findByIdAndUpdate(req.params.id, { role }, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return next(new ErrorResponse(`No user with the id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};
