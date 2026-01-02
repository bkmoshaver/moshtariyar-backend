/**
 * Super Admin Routes
 * مسیرهای مربوط به سوپر ادمین
 */

const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { authenticate, requireRole } = require('../middleware/auth');

// همه مسیرها نیاز به لاگین و نقش super_admin دارند
router.use(authenticate);
router.use(requireRole(['super_admin']));

// آمار داشبورد
router.get('/stats', superAdminController.getDashboardStats);

// مدیریت فروشگاه‌ها
router.get('/tenants', superAdminController.getTenants);
router.patch('/tenants/:id/status', superAdminController.updateTenantStatus);

// مدیریت کاربران
router.get('/users', superAdminController.getUsers);
router.patch('/users/:id', superAdminController.updateUser);
router.delete('/users/:id', superAdminController.deleteUser);

// لاگ فعالیت‌ها
router.get('/logs', superAdminController.getActivityLogs);

module.exports = router;
