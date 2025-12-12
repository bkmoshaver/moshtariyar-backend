/**
 * Settings Routes
 * مسیرهای مدیریت تنظیمات
 */

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate } = require('../middleware/auth');

// تمام مسیرها نیاز به احراز هویت دارند
router.use(authenticate);

/**
 * @route   GET /api/settings
 * @desc    دریافت تنظیمات
 * @access  Private
 */
router.get('/', settingsController.getSettings);

/**
 * @route   PUT /api/settings
 * @desc    به‌روزرسانی تنظیمات
 * @access  Private
 */
router.put('/', settingsController.updateSettings);

module.exports = router;
