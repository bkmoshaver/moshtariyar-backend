/**
 * Staff Routes (Multi-Tenant)
 * مسیرهای احراز هویت Staff/Tenant - برای آینده
 * فعلاً غیرفعال است
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerTenantSchema, loginSchema } = require('../validators/auth.validator');

/**
 * @route   POST /api/staff/register
 * @desc    ثبت‌نام تنانت جدید
 * @access  Public
 */
router.post('/register', validate(registerTenantSchema), authController.register);

/**
 * @route   POST /api/staff/login
 * @desc    ورود کارمند
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   GET /api/staff/me
 * @desc    دریافت اطلاعات کارمند فعلی
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;
