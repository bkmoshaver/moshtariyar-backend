const ErrorResponse = require('../utils/errorResponse');
const Product = require('../models/Product');
const Tenant = require('../models/Tenant');

// @desc    Get all products (Private - Tenant scoped)
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res, next) => {
  try {
    // If user is logged in, use their tenant
    // If not, this route is protected anyway
    
    let tenantId;
    if (req.user && req.user.tenant) {
      tenantId = req.user.tenant;
    } else {
      // Fallback for single tenant mode or if user has no tenant (shouldn't happen in strict mode)
      const tenant = await Tenant.findOne();
      if (tenant) tenantId = tenant._id;
    }

    if (!tenantId) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const products = await Product.find({ tenant: tenantId }).sort('-createdAt');
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res, next) => {
  try {
    let tenantId;
    if (req.user && req.user.tenant) {
      tenantId = req.user.tenant;
    } else {
      const tenant = await Tenant.findOne();
      if (tenant) tenantId = tenant._id;
    }

    if (!tenantId) {
      return next(new ErrorResponse('No tenant found', 404));
    }

    req.body.tenant = tenantId;
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// @desc    Get public products by store slug
// @route   GET /api/products/public/:slug
// @access  Public
exports.getPublicProducts = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne({ slug: req.params.slug });

    if (!tenant) {
      return next(new ErrorResponse('Store not found', 404));
    }

    const products = await Product.find({ tenant: tenant._id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    next(err);
  }
};
