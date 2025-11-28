/**
 * Middleware اعتبارسنجی برای Joi
 */

module.exports = (schema) => {
  return async (req, res, next) => {
    try {
      const { error, value } = schema.validate(req, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "اطلاعات وارد شده نامعتبر است",
            details: error.details.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
        });
      }

      req.body = value.body;
      next();
    } catch (err) {
      console.error("Validation Middleware Error:", err);
      return res.status(500).json({
        success: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "خطا در پردازش اعتبارسنجی"
        }
      });
    }
  };
};
