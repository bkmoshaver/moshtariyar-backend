/**
 * Validation Middleware
 * اعتبارسنجی داده‌های ورودی با Zod
 */

const { errorResponse, ErrorCodes } = require('../utils/errorResponse');

/**
 * Middleware اعتبارسنجی
 * @param {Object} schema - Zod schema
 * @returns {Function}
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      // اعتبارسنجی داده‌ها
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      // جایگزینی داده‌های اعتبارسنجی شده
      req.body = validated.body || req.body;
      req.query = validated.query || req.query;
      req.params = validated.params || req.params;

      next();
    } catch (error) {
      // اگر خطای Zod باشد
      if (error.errors && Array.isArray(error.errors)) {
        const details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json(
          errorResponse(
            ErrorCodes.VALIDATION_ERROR,
            'اطلاعات وارد شده نامعتبر است',
            details
          )
        );
      }

      // خطای غیرمنتظره
      console.error('خطا در اعتبارسنجی:', error);
      return res.status(500).json(
        errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR)
      );
    }
  };
};

module.exports = { validate };
