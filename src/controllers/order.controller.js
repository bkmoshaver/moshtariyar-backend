const ErrorResponse = require('../utils/errorResponse');
const Order = require('../models/Order');
const Tenant = require('../models/Tenant');

exports.getOrders = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne();
    if (!tenant) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const orders = await Order.find({ tenant: tenant._id }).sort('-createdAt');
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne();
    if (!tenant) {
      return next(new ErrorResponse('No tenant found', 404));
    }

    req.body.tenant = tenant._id;
    const order = await Order.create(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};
