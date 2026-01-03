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
