const express = require('express');
const joi = require('joi');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validation.middleware');

const gstNumberSchema = joi.string().trim().min(15).max(20).required();

const verifyGstSchema = joi.object({
  gstNumber: gstNumberSchema,
});

const confirmGstSchema = joi.object({
  gstNumber: gstNumberSchema,
});

const contactDetailsSchema = joi.object({
  businessId: joi.string().uuid().required(),
  phone: joi.string().pattern(/^[6-9]\d{9}$/).required(),
  email: joi.string().email().required(),
});

const otpSchema = joi.object({
  businessId: joi.string().uuid().required(),
  otp: joi.string().pattern(/^\d{6}$/).required(),
});

const createPasswordSchema = joi.object({
  businessId: joi.string().uuid().required(),
  password: joi.string().min(8).required(),
  confirmPassword: joi.string().valid(joi.ref('password')).required(),
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

router.post('/business/gst/verify', validate(verifyGstSchema), authController.verifyGst);
router.post('/business/gst/confirm', validate(confirmGstSchema), authController.confirmGst);
router.post('/business/contact-details', validate(contactDetailsSchema), authController.submitContactDetails);
router.post('/business/verify-phone-otp', validate(otpSchema), authController.verifyPhoneOtp);
router.post('/business/verify-email-otp', validate(otpSchema), authController.verifyEmailOtp);
router.post('/business/create-password', validate(createPasswordSchema), authController.createPassword);
router.post('/business/login', validate(loginSchema), authController.loginBusiness);

module.exports = router;
