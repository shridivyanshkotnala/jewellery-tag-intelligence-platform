const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/apiResponse');

const verifyGst = async (req, res, next) => {
  try {
    const data = authService.verifyGst(req.body.gstNumber);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const confirmGst = async (req, res, next) => {
  try {
    const business = authService.confirmGst(req.body.gstNumber);
    sendSuccess(res, {
      businessId: business.businessId,
      gstNumber: business.gstNumber,
      businessName: business.businessName,
    });
  } catch (err) {
    next(err);
  }
};

const submitContactDetails = async (req, res, next) => {
  try {
    const data = authService.submitContactDetails(req.body);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const verifyPhoneOtp = async (req, res, next) => {
  try {
    const data = authService.verifyPhoneOtp(req.body);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const verifyEmailOtp = async (req, res, next) => {
  try {
    const data = authService.verifyEmailOtp(req.body);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const createPassword = async (req, res, next) => {
  try {
    const data = authService.createPassword(req.body);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const loginBusiness = async (req, res, next) => {
  try {
    const data = authService.loginBusiness(req.body);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  verifyGst,
  confirmGst,
  submitContactDetails,
  verifyPhoneOtp,
  verifyEmailOtp,
  createPassword,
  loginBusiness,
};
