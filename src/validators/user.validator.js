/**
 * User Validators
 * اعتبارسنجی داده‌های کاربر
 */

const { z } = require('zod');

/**
 * اعتبارسنجی ثبت‌نام کاربر
 */
const registerUserSchema = z.object({
  body: z.object({
    name: z.string()
      .trim()
      .min(2, 'نام حداقل 2 کاراکتر باشد')
      .max(100, 'نام حداکثر 100 کاراکتر است'),

    email: z.string()
      .trim()
      .toLowerCase()
      .email('ایمیل نامعتبر است'),

    password: z.string()
      .min(6, 'رمز عبور حداقل 6 کاراکتر باشد')
      .max(50, 'رمز عبور حداکثر 50 کاراکتر است')
  })
});

/**
 * اعتبارسنجی ورود کاربر
 */
const loginUserSchema = z.object({
  body: z.object({
    email: z.string()
      .trim()
      .toLowerCase()
      .email('ایمیل نامعتبر است'),

    password: z.string()
      .min(1, 'رمز عبور الزامی است')
  })
});

module.exports = {
  registerUserSchema,
  loginUserSchema
};
