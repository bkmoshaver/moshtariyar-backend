/**
 * Client Validators
 * اعتبارسنجی داده‌های مشتری
 */

const { z } = require('zod');

/**
 * اعتبارسنجی ایجاد مشتری
 */
const createClientSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'نام حداقل 2 کاراکتر باشد')
      .max(100, 'نام حداکثر 100 کاراکتر است'),
    
    phone: z.string()
      .regex(/^09\d{9}$/, 'شماره موبایل باید با 09 شروع شود و 11 رقم باشد'),
    
    email: z.string()
      .email('ایمیل نامعتبر است')
      .optional()
      .or(z.literal('')),
    
    notes: z.string()
      .max(500, 'یادداشت حداکثر 500 کاراکتر است')
      .optional()
  })
});

/**
 * اعتبارسنجی به‌روزرسانی مشتری
 */
const updateClientSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'شناسه الزامی است')
  }),
  body: z.object({
    name: z.string()
      .min(2, 'نام حداقل 2 کاراکتر باشد')
      .max(100, 'نام حداکثر 100 کاراکتر است')
      .optional(),
    
    email: z.string()
      .email('ایمیل نامعتبر است')
      .optional()
      .or(z.literal('')),
    
    notes: z.string()
      .max(500, 'یادداشت حداکثر 500 کاراکتر است')
      .optional(),
    
    tags: z.array(z.string()).optional()
  })
});

/**
 * اعتبارسنجی افزودن موجودی
 */
const addBalanceSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'شناسه الزامی است')
  }),
  body: z.object({
    amount: z.number()
      .positive('مبلغ باید مثبت باشد')
      .int('مبلغ باید عدد صحیح باشد')
  })
});

module.exports = {
  createClientSchema,
  updateClientSchema,
  addBalanceSchema
};
