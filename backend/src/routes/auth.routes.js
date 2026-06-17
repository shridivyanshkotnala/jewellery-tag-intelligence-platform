const express = require('express');
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validation.middleware');
const {
  gstVerifySchema,
  gstConfirmSchema,
  contactDetailsSchema,
  verifyOtpSchema,
  createPasswordSchema,
  loginSchema,
  employeeLoginSchema,
} = require('../validators/auth.validator');
const { gstRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/business/gst/verify', gstRateLimiter, validate(gstVerifySchema), authController.verifyGst);
router.post('/business/gst/confirm', validate(gstConfirmSchema), authController.confirmGst);
router.post('/business/contact-details', validate(contactDetailsSchema), authController.submitContactDetails);
router.get('/dev/otps/:businessId', authController.getDevOtps);
router.post('/business/verify-phone-otp', validate(verifyOtpSchema), authController.verifyPhoneOtp);
router.post('/business/verify-email-otp', validate(verifyOtpSchema), authController.verifyEmailOtp);
router.post('/business/create-password', validate(createPasswordSchema), authController.createPassword);
router.post('/business/login', validate(loginSchema), authController.login);
router.post('/employee/login', validate(employeeLoginSchema), authController.loginEmployee);

module.exports = router;
