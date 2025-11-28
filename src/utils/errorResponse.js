/**
 * Error Response Utility
 * ساختار یکپارچه برای پاسخ‌های خطا
 */

/**
 * کدهای خطای استاندارد
 */
const ErrorCodes = {
  // خطاهای عمومی
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  
  // خطاهای احراز هویت
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // خطاهای داده
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // خطاهای کسب‌وکار
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  PLAN_LIMIT_EXCEEDED: 'PLAN_LIMIT_EXCEEDED',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED'
};

/**
 * پیام‌های خطای فارسی
 */
const ErrorMessages = {
  INTERNAL_SERVER_ERROR: 'خطای سرور. لطفاً بعداً تلاش کنید',
  VALIDATION_ERROR: 'اطلاعات وارد شده نامعتبر است',
  NOT_FOUND: 'موردی یافت نشد',
  UNAUTHORIZED: 'لطفاً وارد شوید',
  FORBIDDEN: 'شما دسترسی به این بخش ندارید',
  INVALID_CREDENTIALS: 'شماره موبایل یا رمز عبور اشتباه است',
  TOKEN_EXPIRED: 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید',
  DUPLICATE_ENTRY: 'این اطلاعات قبلاً ثبت شده است',
  INVALID_INPUT: 'اطلاعات وارد شده صحیح نیست',
  INSUFFICIENT_BALANCE: 'موجودی کافی نیست',
  PLAN_LIMIT_EXCEEDED: 'محدودیت پلن شما به پایان رسیده است',
  SUBSCRIPTION_EXPIRED: 'اشتراک شما منقضی شده است'
};

/**
 * ساخت پاسخ خطا
 * @param {string} code - کد خطا
 * @param {string} message - پیام سفارشی (اختیاری)
 * @param {Array} details - جزئیات بیشتر (اختیاری)
 * @returns {Object}
 */
const errorResponse = (code, message = null, details = null) => {
  const response = {
    success: false,
    error: {
      code: code,
      message: message || ErrorMessages[code] || ErrorMessages.INTERNAL_SERVER_ERROR
    }
  };

  if (details) {
    response.error.details = details;
  }

  return response;
};

/**
 * ساخت پاسخ موفق
 * @param {*} data - داده‌های پاسخ
 * @param {string} message - پیام موفقیت (اختیاری)
 * @returns {Object}
 */
const successResponse = (data, message = null) => {
  const response = {
    success: true,
    data: data
  };

  if (message) {
    response.message = message;
  }

  return response;
};

module.exports = {
  ErrorCodes,
  ErrorMessages,
  errorResponse,
  successResponse
};
