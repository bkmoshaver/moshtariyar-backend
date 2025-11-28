/**
 * User Validators
 * اعتبارسنجی داده‌های کاربر
 */

const Joi = require('joi');

/**
 * اعتبارسنجی ثبت‌نام کاربر
 */
const registerUserSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'نام الزامی است',
      'string.min': 'نام حداقل 2 کاراکتر باشد',
      'string.max': 'نام حداکثر 100 کاراکتر است',
      'any.required': 'نام الزامی است'
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      'string.empty': 'ایمیل الزامی است',
      'string.email': 'ایمیل نامعتبر است',
      'any.required': 'ایمیل الزامی است'
    }),

  password: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      'string.empty': 'رمز عبور الزامی است',
      'string.min': 'رمز عبور حداقل 6 کاراکتر باشد',
      'string.max': 'رمز عبور حداکثر 50 کاراکتر است',
      'any.required': 'رمز عبور الزامی است'
    })
});

/**
 * اعتبارسنجی ورود کاربر
 */
const loginUserSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      'string.empty': 'ایمیل الزامی است',
      'string.email': 'ایمیل نامعتبر است',
      'any.required': 'ایمیل الزامی است'
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'رمز عبور الزامی است',
      'any.required': 'رمز عبور الزامی است'
    })
});

module.exports = {
  registerUserSchema,
  loginUserSchema
};
