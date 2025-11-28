/**
 * Auth Routes
 * مسیرهای احراز هویت
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerTenantSchema, loginSchema } = require('../validators/auth.validator');

/**
 * @route   POST /api/auth/register
 * @desc    ثبت‌نام تنانت جدید
 * @access  Public
 */
router.post('/register', validate(registerTenantSchema), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    ورود کاربر
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    دریافت اطلاعات کاربر فعلی
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;
