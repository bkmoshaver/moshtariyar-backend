/**
 * User Routes
 * مسیرهای کاربران ساده
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const validate = require('../middleware/validate');   // ←← درست شد
const { registerUserSchema, loginUserSchema } = require('../validators/user.validator');

/**
 * @route   POST /api/auth/user/register
 * @desc    ثبت‌نام کاربر جدید
 * @access  Public
 */
router.post('/register', validate(registerUserSchema), userController.registerUser);

/**
 * @route   POST /api/auth/user/login
 * @desc    ورود کاربر
 * @access  Public
 */
router.post('/login', validate(loginUserSchema), userController.loginUser);

module.exports = router;
