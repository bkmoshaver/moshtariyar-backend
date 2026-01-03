const ErrorResponse = require('../utils/errorResponse');
const Service = require('../models/Service');
const Tenant = require('../models/Tenant');

exports.getServices = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne();
    if (!tenant) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const services = await Service.find({ tenant: tenant._id }).sort('-createdAt');
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (err) {
    next(err);
  }
};

exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

exports.createService = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne();
    if (!tenant) {
      return next(new ErrorResponse('No tenant found', 404));
    }

    req.body.tenant = tenant._id;
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!service) {
      return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
