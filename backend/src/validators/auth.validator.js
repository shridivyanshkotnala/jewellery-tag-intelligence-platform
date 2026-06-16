const Joi = require('joi');

const gstVerifySchema = Joi.object({
  gstNumber: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).required().messages({
    'string.pattern.base': 'INVALID_GST_NUMBER',
    'any.required': 'GST number is required'
  })
});

const gstConfirmSchema = Joi.object({
  gstNumber: Joi.string().required()
});

const contactDetailsSchema = Joi.object({
  businessId: Joi.string().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  email: Joi.string().email().required()
});

const verifyOtpSchema = Joi.object({
  businessId: Joi.string().required(),
  otp: Joi.string().length(6).required()
});

const createPasswordSchema = Joi.object({
  businessId: Joi.string().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = {
  gstVerifySchema,
  gstConfirmSchema,
  contactDetailsSchema,
  verifyOtpSchema,
  createPasswordSchema,
  loginSchema
};
