/**
 * Auth Routes
 * مسیرهای احراز هویت
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Changed from user.controller to authController
const validate = require('../middleware/validate');
const { registerUserSchema, loginUserSchema } = require('../validators/user.validator');

/**
 * @route   POST /api/auth/register
 * @desc    ثبت‌نام کاربر جدید
 * @access  Public
 */
router.post('/register', validate(registerUserSchema), authController.register); // Changed method name to register

/**
 * @route   POST /api/auth/login
 * @desc    ورود کاربر
 * @access  Public
 */
router.post('/login', validate(loginUserSchema), authController.login); // Changed method name to login

module.exports = router;
