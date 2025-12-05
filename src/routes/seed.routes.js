/**
 * Seed Routes
 * مسیرهای seed داده‌های تستی
 */

const express = require('express');
const router = express.Router();
const seedController = require('../controllers/seed.controller');

/**
 * @route   POST /api/seed/users
 * @desc    ایجاد کاربران تستی
 * @access  Public (فقط برای development)
 */
router.post('/users', seedController.seedUsers);

module.exports = router;
