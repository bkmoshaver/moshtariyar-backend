/**
 * Tenant Routes
 * مسیرهای مربوط به مجموعه‌ها
 */

const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenant.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');

// اعتبارسنجی ورودی ثبت‌نام
const registerSchema = Joi.object({
  businessName: Joi.string().required().min(3).max(100).messages({'any.required': 'نام کسب‌وکار الزامی است'}),
  name: Joi.string().required().min(3).max(100).messages({'any.required': 'نام مدیر الزامی است'}),
  email: Joi.string().email().required().messages({'string.email': 'ایمیل نامعتبر است'}),
  password: Joi.string().min(6).required().messages({'string.min': 'رمز عبور باید حداقل ۶ کاراکتر باشد'}),
  phone: Joi.string().pattern(/^09\d{9}$/).optional()
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
