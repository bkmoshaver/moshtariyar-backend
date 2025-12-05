/**
 * Service Validators
 * اعتبارسنجی داده‌های سرویس
 */

const { z } = require('zod');

/**
 * اعتبارسنجی ثبت سرویس
 */
const createServiceSchema = z.object({
  body: z.object({
    clientId: z.string()
      .min(1, 'شناسه مشتری الزامی است'),
    
    title: z.string()
      .min(2, 'عنوان سرویس حداقل 2 کاراکتر باشد')
      .max(200, 'عنوان حداکثر 200 کاراکتر است')
      .optional(),
    
    description: z.string()
      .min(2, 'توضیحات حداقل 2 کاراکتر باشد')
      .max(1000, 'توضیحات حداکثر 1000 کاراکتر است'),
    
    amount: z.number()
      .positive('مبلغ باید مثبت باشد')
      .int('مبلغ باید عدد صحیح باشد'),
    
    useWallet: z.boolean()
      .optional()
      .default(false),
    
    walletAmount: z.number()
      .min(0, 'مبلغ استفاده از کیف پول نمی‌تواند منفی باشد')
      .optional()
      .default(0),
    
    notes: z.string()
      .max(500, 'یادداشت حداکثر 500 کاراکتر است')
      .optional()
  })
});

/**
 * اعتبارسنجی فیلترهای گزارش
 */
const getServicesSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    clientId: z.string().optional(),
    staffId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional()
  })
});

module.exports = {
  createServiceSchema,
  getServicesSchema
};
