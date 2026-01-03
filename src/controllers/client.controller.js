const ErrorResponse = require('../utils/errorResponse');

exports.getClients = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: [] });
  } catch (err) {
    next(err);
  }
};

exports.getClient = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

exports.createClient = async (req, res, next) => {
  try {
    res.status(201).json({ success: true, data: req.body });
  } catch (err) {
    next(err);
  }
};

exports.updateClient = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.body });
  } catch (err) {
    next(err);
  }
};

exports.deleteClient = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
