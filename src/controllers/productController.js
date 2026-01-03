const ErrorResponse = require('../utils/errorResponse');

exports.getProducts = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: [] });
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    res.status(201).json({ success: true, data: req.body });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.body });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
