/**
 * Admin Routes
 * مسیرهای پنل سوپر ادمین
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, requireRole } = require('../middleware/auth');

// همه مسیرها نیاز به احراز هویت و نقش سوپر ادمین دارند
router.use(authenticate);
router.use(requireRole(['super_admin']));

router.get('/stats', adminController.getSystemStats);
router.get('/tenants', adminController.getAllTenants);
router.patch('/tenants/:id/status', adminController.toggleTenantStatus);

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/role', adminController.updateUserRole);

module.exports = router;
