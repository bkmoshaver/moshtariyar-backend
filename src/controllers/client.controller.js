const ErrorResponse = require('../utils/errorResponse');
const Client = require('../models/Client');
const Tenant = require('../models/Tenant');

exports.getClients = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne();
    if (!tenant) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const clients = await Client.find({ tenant: tenant._id }).sort('-createdAt');
    
    res.status(200).json({ success: true, count: clients.length, data: clients });
  } catch (err) {
    next(err);
  }
};

exports.getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return next(new ErrorResponse(`Client not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

exports.createClient = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne();
    if (!tenant) {
      return next(new ErrorResponse('No tenant found', 404));
    }

    req.body.tenant = tenant._id;
    const client = await Client.create(req.body);
    res.status(201).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

exports.updateClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!client) {
      return next(new ErrorResponse(`Client not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

exports.deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return next(new ErrorResponse(`Client not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
