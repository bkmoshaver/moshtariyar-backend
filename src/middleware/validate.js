// src/middleware/validate.js

/**
 * Zod Validation Middleware
 */

const validate = (schema) => {
  return (req, res, next) => {
    try {
      // اگر اسکیمای ما Zod باشد
      const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query
      });

      if (!result.success) {
        const formatted = result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "اطلاعات وارد شده نامعتبر است",
            details: formatted
          }
        });
      }

      // مقدار پارس‌شده را بازنویسی می‌کنیم
      req.body = result.data.body || req.body;
      req.params = result.data.params || req.params;
      req.query = result.data.query || req.query;

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validate;
