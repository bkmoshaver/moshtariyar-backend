const Product = require('../models/Product');
const Tenant = require('../models/Tenant');

/**
 * @desc    Get all products for a tenant (Public)
 * @route   GET /api/public/shop/:slug/products
 * @access  Public
 */
exports.getPublicProducts = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Find tenant by slug
    const tenant = await Tenant.findOne({ slug });
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'فروشگاه یافت نشد'
      });
    }

    // Find active products for this tenant
    const products = await Product.find({ 
      tenant: tenant._id,
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching public products:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت لیست محصولات'
    });
  }
};

/**
 * @desc    Get all products (Admin)
 * @route   GET /api/products
 * @access  Private (Tenant Admin & Staff)
 */
exports.getProducts = async (req, res) => {
  try {
    // Ensure user belongs to a tenant
    if (!req.user.tenant) {
      return res.status(403).json({
        success: false,
        message: 'شما به هیچ فروشگاهی متصل نیستید'
      });
    }

    const products = await Product.find({ tenant: req.user.tenant })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت محصولات'
    });
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private (Tenant Admin)
 */
exports.createProduct = async (req, res) => {
  try {
    // Ensure user belongs to a tenant
    if (!req.user.tenant) {
      return res.status(403).json({
        success: false,
        message: 'شما به هیچ فروشگاهی متصل نیستید'
      });
    }

    // Check permissions (only admin and staff can create)
    if (!['tenant_admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'شما دسترسی ایجاد محصول ندارید'
      });
    }

    const product = await Product.create({
      ...req.body,
      tenant: req.user.tenant
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ایجاد محصول'
    });
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private (Tenant Admin)
 */
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد'
      });
    }

    // Check ownership
    if (product.tenant.toString() !== req.user.tenant.toString()) {
      return res.status(403).json({
        success: false,
        message: 'شما دسترسی ویرایش این محصول را ندارید'
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ویرایش محصول'
    });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Tenant Admin)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد'
      });
    }

    // Check ownership
    if (product.tenant.toString() !== req.user.tenant.toString()) {
      return res.status(403).json({
        success: false,
        message: 'شما دسترسی حذف این محصول را ندارید'
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'محصول با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در حذف محصول'
    });
  }
};
