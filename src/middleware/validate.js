/**
 * Joi Validation Middleware
 */

module.exports = (schema) => {
  return (req, res, next) => {
    const options = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    };

    const { error, value } = schema.validate(req, options);

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "اطلاعات وارد شده نامعتبر است",
          details: error.details.map((err) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }
      });
    }

    req.body = value.body;
    next();
  };
};
