const ErrorResponse = require('../utils/errorResponse');
const Tenant = require('../models/Tenant');

// @desc    Get store settings
// @route   GET /api/settings
// @access  Private (Tenant Admin/Staff)
exports.getSettings = async (req, res, next) => {
  try {
    // If user is super_admin, they might want to see specific tenant settings
    // But for now, let's assume this is for the current tenant context
    
    if (!req.user.tenant) {
      return next(new ErrorResponse('User is not associated with a tenant', 400));
    }

    const tenant = await Tenant.findById(req.user.tenant);

    if (!tenant) {
      return next(new ErrorResponse('Tenant not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        name: tenant.name,
        slug: tenant.slug,
        logo: tenant.logo,
        banner: tenant.banner,
        theme: tenant.theme,
        address: tenant.address,
        phone: tenant.phone,
        giftPercentage: tenant.giftPercentage,
        walletExpiryDays: tenant.walletExpiryDays,
        smsEnabled: tenant.smsEnabled
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private (Tenant Admin)
exports.updateSettings = async (req, res, next) => {
  try {
    if (!req.user.tenant) {
      return next(new ErrorResponse('User is not associated with a tenant', 400));
    }

    // Check if user is tenant_admin
    if (req.user.role !== 'tenant_admin' && req.user.role !== 'super_admin') {
      return next(new ErrorResponse('Not authorized to update settings', 403));
    }

    const fieldsToUpdate = {
      name: req.body.name,
      slug: req.body.slug,
      logo: req.body.logo,
      banner: req.body.banner,
      theme: req.body.theme,
      address: req.body.address,
      phone: req.body.phone,
      giftPercentage: req.body.giftPercentage,
      walletExpiryDays: req.body.walletExpiryDays,
      smsEnabled: req.body.smsEnabled
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const tenant = await Tenant.findByIdAndUpdate(req.user.tenant, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: tenant
    });
  } catch (err) {
    next(err);
  }
};
