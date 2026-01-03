const ErrorResponse = require('../utils/errorResponse');

exports.getServices = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: [] });
  } catch (err) {
    next(err);
  }
};

exports.getService = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

exports.createService = async (req, res, next) => {
  try {
    res.status(201).json({ success: true, data: req.body });
  } catch (err) {
    next(err);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.body });
  } catch (err) {
    next(err);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
