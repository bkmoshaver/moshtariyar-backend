const ErrorResponse = require('../utils/errorResponse');
const Tenant = require('../models/Tenant');

exports.getTenants = async (req, res, next) => {
  try {
    const tenants = await Tenant.find();
    res.status(200).json({ success: true, count: tenants.length, data: tenants });
  } catch (err) {
    next(err);
  }
};

exports.getTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return next(new ErrorResponse(`Tenant not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: tenant });
  } catch (err) {
    next(err);
  }
};

exports.createTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.create(req.body);
    res.status(201).json({ success: true, data: tenant });
  } catch (err) {
    next(err);
  }
};

exports.updateTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!tenant) {
      return next(new ErrorResponse(`Tenant not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: tenant });
  } catch (err) {
    next(err);
  }
};

exports.deleteTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);
    if (!tenant) {
      return next(new ErrorResponse(`Tenant not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// New methods for /me route
exports.getMyTenant = async (req, res, next) => {
  try {
    // Fallback: Find any tenant (since we don't have tenantId in User model yet)
    let tenant = await Tenant.findOne();
    
    if (!tenant) {
      // Create a default tenant if none exists
      tenant = await Tenant.create({
        name: 'My Store',
        slug: 'my-store-' + Date.now(),
        address: '',
        phone: '',
        branding: {
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          logo: '',
          banner: ''
        },
        giftSettings: {
          enabled: true,
          percentage: 5,
          expireDays: 30
        }
      });
    }

    res.status(200).json({ 
      success: true, 
      data: { tenant } // Wrap in object to match frontend expectation: data.data.tenant
    });
  } catch (err) {
    next(err);
  }
};

exports.updateMyTenant = async (req, res, next) => {
  try {
    let tenant = await Tenant.findOne();
    
    if (!tenant) {
      return next(new ErrorResponse('No tenant found to update', 404));
    }

    tenant = await Tenant.findByIdAndUpdate(tenant._id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ 
      success: true, 
      data: { tenant } 
    });
  } catch (err) {
    next(err);
  }
};
