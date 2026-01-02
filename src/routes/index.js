const express = require('express');
const router = express.Router();

// Import Routes
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const clientRoutes = require('./client.routes');
const serviceRoutes = require('./service.routes');
const settingsRoutes = require('./settings.routes');
const seedRoutes = require('./seed.routes');
const transactionRoutes = require('./transaction.routes');
const tenantRoutes = require('./tenant.routes');

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
router.use('/users', userRoutes);     // مسیرهای مدیریت کاربران (admin only)
router.use('/clients', clientRoutes); // مسیرهای مشتریان
router.use('/services', serviceRoutes); // مسیرهای خدمات
router.use('/settings', settingsRoutes); // مسیرهای تنظیمات
router.use('/seed', seedRoutes);      // مسیرهای دیتای اولیه
router.use('/transactions', transactionRoutes); // مسیرهای تراکنش‌ها
router.use('/tenants', tenantRoutes);   // مسیرهای مجموعه‌ها (ثبت‌نام و مدیریت)

module.exports = router;
