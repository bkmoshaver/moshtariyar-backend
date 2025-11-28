/**
 * Auth Validators
 * اعتبارسنجی داده‌های احراز هویت
 */

const { z } = require('zod');

/**
 * اعتبارسنجی ثبت‌نام تنانت
 */
const registerTenantSchema = z.object({
  body: z.object({
    // اطلاعات کسب‌وکار
    businessName: z.string()
      .min(2, 'نام کسب‌وکار حداقل 2 کاراکتر باشد')
      .max(100, 'نام کسب‌وکار حداکثر 100 کاراکتر است'),
    
    // اطلاعات مالک
    ownerName: z.string()
      .min(2, 'نام مالک حداقل 2 کاراکتر باشد')
      .max(100, 'نام مالک حداکثر 100 کاراکتر است'),
    
    phone: z.string()
      .regex(/^09\d{9}$/, 'شماره موبایل باید با 09 شروع شود و 11 رقم باشد'),
    
    email: z.string()
      .email('ایمیل نامعتبر است')
      .optional()
      .or(z.literal('')),
    
    password: z.string()
      .min(6, 'رمز عبور حداقل 6 کاراکتر باشد')
      .max(50, 'رمز عبور حداکثر 50 کاراکتر است')
  })
});

/**
 * اعتبارسنجی ورود
 */
const loginSchema = z.object({
  body: z.object({
    phone: z.string()
      .regex(/^09\d{9}$/, 'شماره موبایل باید با 09 شروع شود و 11 رقم باشد'),
    
    password: z.string()
      .min(1, 'رمز عبور الزامی است')
  })
});

module.exports = {
  registerTenantSchema,
  loginSchema
};
