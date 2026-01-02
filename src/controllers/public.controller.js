/**
 * Public Controller (Robust Version)
 * کنترلر بخش‌های عمومی با قابلیت خودترمیمی
 */

const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * دریافت پروفایل عمومی کاربر
 * GET /api/public/profile/:username
 */
exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select('name username bio links avatar role')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    if (user.links) {
      user.links = user.links.filter(link => link.active);
    }

    res.json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

/**
 * دریافت صفحه عمومی فروشگاه (با منطق فال‌بک)
 * GET /api/public/store/:slug
 */
exports.getStorePage = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`🔍 Searching for store: ${slug}`);

    // 1. جستجو با slug دقیق
    let tenant = await Tenant.findOne({ slug, isActive: true });

    // 2. اگر پیدا نشد، جستجو با نام (Case Insensitive)
    if (!tenant) {
      console.log(`⚠️ Store not found by slug, trying name: ${slug}`);
      tenant = await Tenant.findOne({ 
        name: { $regex: new RegExp(`^${slug}$`, 'i') },
        isActive: true 
      });

      // اگر با نام پیدا شد، slug را برایش ست کن (Self-Healing)
      if (tenant && !tenant.slug) {
        console.log(`🛠️ Self-healing: Setting slug for ${tenant.name} to ${slug}`);
        tenant.slug = slug.toLowerCase();
        await tenant.save();
      }
    }

    // 3. اگر باز هم پیدا نشد، شاید ID باشد
    if (!tenant && slug.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`⚠️ Store not found by name, trying ID: ${slug}`);
      tenant = await Tenant.findOne({ _id: slug, isActive: true });
      
      // اگر با ID پیدا شد، slug پیش‌فرض بساز
      if (tenant && !tenant.slug) {
        const newSlug = `store-${slug.slice(-6)}`;
        console.log(`🛠️ Self-healing: Setting slug for ${tenant.name} to ${newSlug}`);
        tenant.slug = newSlug;
        await tenant.save();
      }
    }

    if (!tenant) {
      console.log('❌ Store absolutely not found');
      return res.status(404).json({ message: 'فروشگاه یافت نشد یا غیرفعال است' });
    }

    // بررسی انقضای اشتراک
    if (tenant.plan && tenant.plan.expiresAt && new Date() > new Date(tenant.plan.expiresAt)) {
      return res.status(403).json({ message: 'اشتراک این فروشگاه به پایان رسیده است' });
    }

    // انتخاب فیلدهای عمومی
    const publicData = {
      _id: tenant._id,
      name: tenant.name,
      slug: tenant.slug,
      branding: tenant.branding,
      giftSettings: tenant.giftSettings,
      stats: tenant.stats,
      address: tenant.address,
      phone: tenant.phone
    };

    res.json(publicData);
  } catch (error) {
    console.error('Get Store Error:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const reservedNames = ['admin', 'login', 'dashboard', 'register', 'api', 'shop', 'store', 's'];
    if (reservedNames.includes(username.toLowerCase())) {
      return res.json({ available: false, message: 'این نام کاربری رزرو شده است' });
    }
    const user = await User.findOne({ username });
    res.json({ available: !user });
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور' });
  }
};

exports.checkSlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const reservedSlugs = ['admin', 'api', 'www', 'mail', 'ftp'];
    if (reservedSlugs.includes(slug.toLowerCase())) {
      return res.json({ available: false, message: 'این شناسه رزرو شده است' });
    }
    const tenant = await Tenant.findOne({ slug });
    res.json({ available: !tenant });
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور' });
  }
};

/**
 * ثبت سفارش جدید
 * POST /api/public/orders
 */
exports.createOrder = async (req, res) => {
  try {
    const { tenantId, slug, customerName, customerPhone, items, note } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'سبد خرید خالی است' });
    }

    // Find tenant
    let tenant;
    if (tenantId) {
      tenant = await Tenant.findById(tenantId);
    } else if (slug) {
      tenant = await Tenant.findOne({ slug });
    }

    if (!tenant) {
      return res.status(404).json({ message: 'فروشگاه یافت نشد' });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const order = new Order({
      tenant: tenant._id,
      customerName,
      customerPhone,
      items,
      totalAmount,
      note,
      status: 'pending'
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'سفارش با موفقیت ثبت شد',
      orderId: order._id
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'خطا در ثبت سفارش' });
  }
};
