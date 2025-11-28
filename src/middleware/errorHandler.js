/**
 * Error Handler Middleware
 * مدیریت مرکزی خطاها
 */

const { errorResponse, ErrorCodes } = require('../utils/errorResponse');

/**
 * Error Handler اصلی
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ خطا:', err);

  // خطای Mongoose - Validation Error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));

    return res.status(400).json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, 'اطلاعات وارد شده نامعتبر است', details)
    );
  }

  // خطای Mongoose - Duplicate Key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const value = err.keyValue[field];
    
    return res.status(400).json(
      errorResponse(
        ErrorCodes.DUPLICATE_ENTRY,
        `${field} با مقدار "${value}" قبلاً ثبت شده است`
      )
    );
  }

  // خطای Mongoose - Cast Error (ID نامعتبر)
  if (err.name === 'CastError') {
    return res.status(400).json(
      errorResponse(ErrorCodes.INVALID_INPUT, 'شناسه نامعتبر است')
    );
  }

  // خطای JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      errorResponse(ErrorCodes.UNAUTHORIZED, 'توکن نامعتبر است')
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      errorResponse(ErrorCodes.TOKEN_EXPIRED, 'توکن منقضی شده است')
    );
  }

  // خطای پیش‌فرض
  return res.status(err.statusCode || 500).json(
    errorResponse(
      err.code || ErrorCodes.INTERNAL_SERVER_ERROR,
      err.message || 'خطای سرور'
    )
  );
};

/**
 * Handler برای مسیرهای یافت نشده
 */
const notFoundHandler = (req, res) => {
  res.status(404).json(
    errorResponse(ErrorCodes.NOT_FOUND, `مسیر ${req.originalUrl} یافت نشد`)
  );
};

module.exports = {
  errorHandler,
  notFoundHandler
};
