/**
 * User Routes
 * مسیرهای کاربران ساده
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const validate = require('../middleware/validate');   // ←← درست شد
const { registerUserSchema, loginUserSchema } = require('../validators/user.validator');
const { authenticate, requireRole } = require('../middleware/auth');

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

// مسیرهای مدیریت کاربران (فقط ادمین)
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    دریافت لیست کاربران
 * @access  Private (Admin)
 */
router.get('/', requireRole(['admin']), userController.getUsers);

/**
 * @route   POST /api/users
 * @desc    ایجاد کاربر جدید توسط ادمین
 * @access  Private (Admin)
 */
router.post('/', requireRole(['admin']), validate(registerUserSchema), userController.createUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    حذف کاربر
 * @access  Private (Admin)
 */
router.delete('/:id', requireRole(['admin']), userController.deleteUser);

module.exports = router;
