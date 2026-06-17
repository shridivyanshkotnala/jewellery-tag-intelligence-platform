const gstService = require('../services/gst.service');
const registrationService = require('../services/registration.service');
const otpService = require('../services/otp.service');
const config = require('../config/env');
const { sendSuccess } = require('../utils/apiResponse');

const verifyGst = async (req, res, next) => {
  try {
    const { gstNumber } = req.body;
    const data = await gstService.verifyGST(gstNumber);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const confirmGst = async (req, res, next) => {
  try {
    const { gstNumber } = req.body;
    // For confirm, we re-verify or just accept it based on flow.
    // The api contract says we just send gstNumber.
    // Let's assume the frontend sends the confirmed gstNumber.
    // We should probably fetch the mock details again to save them.
    const gstData = await gstService.verifyGST(gstNumber);
    const data = await registrationService.confirmGst(gstData);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const submitContactDetails = async (req, res, next) => {
  try {
    const { businessId, phone, email } = req.body;
    console.log(`[auth] contact-details request: businessId=${businessId}, phone=${phone}, email=${email}`);
    const data = await registrationService.submitContactDetails(businessId, phone, email);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const getDevOtps = async (req, res, next) => {
  try {
    if (config.env !== 'development') {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    const data = otpService.getDevOtps(req.params.businessId);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const verifyPhoneOtp = async (req, res, next) => {
  try {
    const { businessId, otp } = req.body;
    const data = await registrationService.verifyPhoneOtp(businessId, otp);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const verifyEmailOtp = async (req, res, next) => {
  try {
    const { businessId, otp } = req.body;
    const data = await registrationService.verifyEmailOtp(businessId, otp);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const createPassword = async (req, res, next) => {
  try {
    const { businessId, password } = req.body;
    const data = await registrationService.createPassword(businessId, password);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await registrationService.login(email, password);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const loginEmployee = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const data = await registrationService.loginWithPhone(phone, password);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  verifyGst,
  confirmGst,
  submitContactDetails,
  getDevOtps,
  verifyPhoneOtp,
  verifyEmailOtp,
  createPassword,
  login,
  loginEmployee,
};
