/**
 * Tenant Routes
 * مسیرهای مربوط به مجموعه‌ها
 */

const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenant.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { z } = require('zod');

// اعتبارسنجی ورودی ثبت‌نام با Zod
const registerSchema = z.object({
  body: z.object({
    businessName: z.string().min(3, 'نام کسب‌وکار باید حداقل ۳ کاراکتر باشد').max(100),
    name: z.string().min(3, 'نام مدیر باید حداقل ۳ کاراکتر باشد').max(100),
    email: z.string().email('ایمیل نامعتبر است'),
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
    phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل نامعتبر است').optional()
  })
});

/**
 * @route   POST /api/tenants/register
 * @desc    ثبت‌نام مجموعه جدید (Onboarding)
 * @access  Public
 */
router.post('/register', validate(registerSchema), tenantController.registerTenant);

/**
 * @route   GET /api/tenants/me
 * @desc    دریافت اطلاعات مجموعه جاری
 * @access  Private (Tenant Admin, Staff)
 */
router.get('/me', authenticate, tenantController.getCurrentTenant);

module.exports = router;
