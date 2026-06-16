const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Business = require('../models/business.model');
const BusinessUser = require('../models/businessUser.model');
const redisClient = require('../redis/redisClient');
const otpService = require('./otp.service');
const authService = require('./auth.service');

const confirmGst = async (gstData) => {
  let business = await Business.findOne({ gstNumber: gstData.gstNumber });
  
  if (business) {
    if (business.isRegistered) {
      throw new Error('BUSINESS_ALREADY_REGISTERED');
    }
    // Resume registration, just return the existing ID
    return {
      businessId: business._id.toString(),
      status: business.registrationStep
    };
  }

  // Create new Business (No User Yet)
  business = await Business.create({
    gstNumber: gstData.gstNumber,
    legalName: gstData.legalName,
    tradeName: gstData.tradeName,
    businessType: gstData.businessType,
    gstStatus: gstData.gstStatus,
    address: gstData.address,
    stateCode: gstData.stateCode,
    stateName: gstData.stateName,
    pincode: gstData.pincode,
    registrationStep: 'GST_CONFIRMED',
    isRegistered: false
  });

  return {
    businessId: business._id.toString(),
    status: 'GST_CONFIRMED'
  };
};

const submitContactDetails = async (businessId, phone, email) => {
  const business = await Business.findById(businessId);
  if (!business) throw new Error('Business not found');

  // Check if email or phone is already taken by a fully registered user
  const existingUser = await BusinessUser.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    if (existingUser.email === email) throw new Error('EMAIL_ALREADY_EXISTS');
    if (existingUser.phone === phone) throw new Error('PHONE_ALREADY_EXISTS');
  }

  // Save temp state in Redis
  const tempState = {
    phone,
    email,
    phoneVerified: false,
    emailVerified: false
  };
  await redisClient.set(`registration:${businessId}`, JSON.stringify(tempState), "EX", 86400); // 24 hours

  business.registrationStep = 'CONTACT_DETAILS_SUBMITTED';
  await business.save();

  // Send OTPs
  await otpService.sendPhoneOtp(businessId, phone);
  await otpService.sendEmailOtp(businessId, email);

  return {
    phoneOtpSent: true,
    emailOtpSent: true
  };
};

const verifyPhoneOtp = async (businessId, otp) => {
  await otpService.verifyOtp(businessId, 'PHONE', otp);
  
  const stateStr = await redisClient.get(`registration:${businessId}`);
  if (!stateStr) throw new Error('Session expired');
  
  const state = JSON.parse(stateStr);
  state.phoneVerified = true;
  await redisClient.set(`registration:${businessId}`, JSON.stringify(state), "EX", 86400);

  await Business.findByIdAndUpdate(businessId, { registrationStep: 'PHONE_VERIFIED' });

  return { phoneVerified: true };
};

const verifyEmailOtp = async (businessId, otp) => {
  await otpService.verifyOtp(businessId, 'EMAIL', otp);
  
  const stateStr = await redisClient.get(`registration:${businessId}`);
  if (!stateStr) throw new Error('Session expired');
  
  const state = JSON.parse(stateStr);
  state.emailVerified = true;
  await redisClient.set(`registration:${businessId}`, JSON.stringify(state), "EX", 86400);

  await Business.findByIdAndUpdate(businessId, { registrationStep: 'EMAIL_VERIFIED' });

  return { emailVerified: true };
};

const createPassword = async (businessId, password) => {
  const stateStr = await redisClient.get(`registration:${businessId}`);
  if (!stateStr) throw new Error('Session expired or incomplete registration');
  
  const state = JSON.parse(stateStr);
  if (!state.phoneVerified || !state.emailVerified) {
     throw new Error('Please verify both email and phone first');
  }

  const business = await Business.findById(businessId);
  if (!business) throw new Error('Business not found');

  const passwordHash = await bcrypt.hash(password, 10);

  // MongoDB Transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newUsers = await BusinessUser.create([{
      businessId: business._id,
      email: state.email,
      phone: state.phone,
      passwordHash,
      role: 'OWNER',
      emailVerified: true,
      phoneVerified: true,
      isActive: true
    }], { session });

    business.registrationStep = 'COMPLETED';
    business.isRegistered = true;
    await business.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Clean up redis
    await redisClient.del(`registration:${businessId}`);

    return {
      registrationCompleted: true,
      userId: newUsers[0]._id.toString()
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const login = async (email, password) => {
  const user = await BusinessUser.findOne({ email });
  if (!user || !user.isActive) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  const tokens = authService.generateTokens(user.businessId.toString(), user._id.toString(), user.role);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    businessId: user.businessId.toString(),
    userId: user._id.toString()
  };
};

module.exports = {
  confirmGst,
  submitContactDetails,
  verifyPhoneOtp,
  verifyEmailOtp,
  createPassword,
  login
};
