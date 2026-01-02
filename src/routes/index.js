const express = require('express');
const router = express.Router();

// Import Routes
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes'); // Updated to use user.routes.js
const clientRoutes = require('./client.routes');
const serviceRoutes = require('./service.routes');
const settingsRoutes = require('./settings.routes');
const seedRoutes = require('./seed.routes');
const transactionRoutes = require('./transaction.routes');
const tenantRoutes = require('./tenant.routes');
const staffRoutes = require('./staff.routes');
const adminRoutes = require('./admin.routes');
const publicRoutes = require('./public.routes');
const productRoutes = require('./productRoutes'); // New product routes

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'سرور مشتریار در حال اجراست',
    timestamp: new Date().toISOString()
  });
});

// API Routes
router.use('/auth', authRoutes);      // مسیرهای احراز هویت (login/register)
router.use('/users', userRoutes);     // مسیرهای مدیریت کاربران (profile update)
router.use('/clients', clientRoutes); // مسیرهای مشتریان
router.use('/services', serviceRoutes); // مسیرهای خدمات (سابقه)
router.use('/settings', settingsRoutes); // مسیرهای تنظیمات
router.use('/seed', seedRoutes);      // مسیرهای دیتای اولیه
router.use('/transactions', transactionRoutes); // مسیرهای تراکنش‌ها
router.use('/tenants', tenantRoutes);   // مسیرهای مجموعه‌ها (ثبت‌نام و مدیریت)
router.use('/staff', staffRoutes);      // مسیرهای مدیریت پرسنل
router.use('/admin', adminRoutes);      // مسیرهای سوپر ادمین
router.use('/public', publicRoutes);    // مسیرهای عمومی (پروفایل و فروشگاه)
router.use('/products', productRoutes); // مسیرهای محصولات (منوی فروشگاه)

module.exports = router;
