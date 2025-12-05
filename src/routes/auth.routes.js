/**
 * Auth Routes
 * مسیرهای احراز هویت - فعلاً فقط User (بعداً Staff/Tenant اضافه می‌شود)
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const validate = require('../middleware/validate');
const { registerUserSchema, loginUserSchema } = require('../validators/user.validator');

/**
 * @route   POST /api/auth/register
 * @desc    ثبت‌نام کاربر جدید
 * @access  Public
 */
router.post('/register', validate(registerUserSchema), userController.registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    ورود کاربر
 * @access  Public
 */
router.post('/login', validate(loginUserSchema), userController.loginUser);

module.exports = router;
