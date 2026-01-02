/**
 * User Routes
 * مسیرهای کاربران ساده
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Fixed path
const validate = require('../middleware/validate');
const { registerUserSchema, loginUserSchema } = require('../validators/user.validator');
const { authenticate, requireRole } = require('../middleware/auth');

// مسیرهای پروفایل (برای همه کاربران لاگین شده)
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);

// مسیرهای مدیریت کاربران (فقط ادمین و مدیر فروشگاه)
// توجه: سوپر ادمین از مسیر /api/admin/users استفاده می‌کند
router.get('/', authenticate, requireRole(['tenant_admin', 'admin']), userController.getUsers);
router.post('/', authenticate, requireRole(['tenant_admin', 'admin']), userController.createUser);
router.patch('/:id', authenticate, requireRole(['tenant_admin', 'admin']), userController.updateUser);
router.delete('/:id', authenticate, requireRole(['tenant_admin', 'admin']), userController.deleteUser);

module.exports = router;
