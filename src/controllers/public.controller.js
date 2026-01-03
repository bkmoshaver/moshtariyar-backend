const ErrorResponse = require('../utils/errorResponse');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Product = require('../models/Product');
const Service = require('../models/Service');

// @desc    Get public store by slug
// @route   GET /api/public/store/:slug
// @access  Public
exports.getPublicStore = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne({ slug: req.params.slug });

    if (!tenant) {
      return next(new ErrorResponse('Store not found', 404));
    }

    // Get products and services for this store
    const products = await Product.find({ tenant: tenant._id });
    const services = await Service.find({ tenant: tenant._id });

    res.status(200).json({
      success: true,
      data: {
        store: tenant,
        products,
        services
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get public profile by username
// @route   GET /api/public/profile/:username
// @access  Public
exports.getPublicProfile = async (req, res, next) => {
  try {
    // Try to find by username first, then fallback to name for legacy support
    let user = await User.findOne({ username: req.params.username }).select('-password');
    
    if (!user) {
      // Fallback: Try to find by name (case insensitive regex)
      // This is risky if names are not unique, but helpful for legacy users without username
      user = await User.findOne({ 
        name: { $regex: new RegExp(`^${req.params.username}$`, 'i') } 
      }).select('-password');
    }

    if (!user) {
      return next(new ErrorResponse('Profile not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};
