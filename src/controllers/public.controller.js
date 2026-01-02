/**
 * Public Controller
 * کنترلر بخش‌های عمومی (پروفایل کاربر و فروشگاه)
 */

const User = require('../models/User');
const Tenant = require('../models/Tenant');

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

    // فقط لینک‌های فعال را برگردان
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
 * دریافت صفحه عمومی فروشگاه
 * GET /api/public/store/:slug
 */
exports.getStorePage = async (req, res) => {
  try {
    const { slug } = req.params;

    const tenant = await Tenant.findOne({ slug, isActive: true })
      .select('name slug branding giftSettings stats plan')
      .lean();

    if (!tenant) {
      return res.status(404).json({ message: 'فروشگاه یافت نشد یا غیرفعال است' });
    }

    // بررسی انقضای اشتراک
    if (new Date() > new Date(tenant.plan.expiresAt)) {
      return res.status(403).json({ message: 'اشتراک این فروشگاه به پایان رسیده است' });
    }

    res.json(tenant);
  } catch (error) {
    console.error('Get Store Error:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

/**
 * بررسی آزاد بودن نام کاربری
 * GET /api/public/check-username/:username
 */
exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    // لیست نام‌های رزرو شده
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

/**
 * بررسی آزاد بودن شناسه فروشگاه
 * GET /api/public/check-slug/:slug
 */
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
