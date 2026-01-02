/**
 * Public Routes
 * مسیرهای عمومی (بدون نیاز به لاگین)
 */

const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

// پروفایل کاربر
router.get('/profile/:username', publicController.getUserProfile);
router.get('/check-username/:username', publicController.checkUsername);

// صفحه فروشگاه
router.get('/store/:slug', publicController.getStorePage);
router.get('/check-slug/:slug', publicController.checkSlug);

module.exports = router;
