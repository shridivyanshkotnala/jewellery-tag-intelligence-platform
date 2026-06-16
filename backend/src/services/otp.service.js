const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Resend } = require('resend');
const OtpVerification = require('../models/otpVerification.model');
const redisClient = require('../redis/redisClient');
const config = require('../config/env');

const resend = new Resend(config.resend.apiKey);

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
};

// Rate limiting and Resend logic
const checkOtpRateLimits = async (businessId, type) => {
  const resendKey = `otp_resend:${businessId}:${type}`;
  const shortLimitKey = `otp_count_short:${businessId}:${type}`;
  const dayKey = `otp_count_day:${businessId}:${type}`;

  // Check Resend Timeout (60 seconds)
  const isResendBlocked = await redisClient.get(resendKey);
  if (isResendBlocked) {
    throw new Error('RESEND_TIMEOUT');
  }

  // Check 5 Minutes Limit (5 max)
  let shortCount = await redisClient.get(shortLimitKey);
  if (shortCount && parseInt(shortCount) >= 5) {
    throw new Error('OTP_LIMIT_EXCEEDED');
  }

  // Check 24 Hour Limit (10 max)
  let dayCount = await redisClient.get(dayKey);
  if (dayCount && parseInt(dayCount) >= 10) {
    throw new Error('OTP_LIMIT_EXCEEDED');
  }

  // Increment counters
  await redisClient.set(resendKey, 'blocked', 'EX', 60);
  
  if (shortCount) {
    await redisClient.incr(shortLimitKey);
  } else {
    await redisClient.set(shortLimitKey, '1', 'EX', 300); // 300 seconds (5 mins)
  }

  if (dayCount) {
    await redisClient.incr(dayKey);
  } else {
    await redisClient.set(dayKey, '1', 'EX', 86400);
  }
};

const sendPhoneOtp = async (businessId, phone) => {
  await checkOtpRateLimits(businessId, 'PHONE');
  
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  
  // Store in DB (Expires in 5 minutes)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await OtpVerification.create({
    businessId,
    otpType: 'PHONE',
    destination: phone,
    otpHash,
    expiresAt
  });

  // Mock MSG91 Integration
  console.log(`[MSG91 MOCK] Sending Phone OTP ${otp} to ${phone}`);
  
  return true;
};

const sendEmailOtp = async (businessId, email) => {
  await checkOtpRateLimits(businessId, 'EMAIL');
  
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  
  // Store in DB (Expires in 5 minutes)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await OtpVerification.create({
    businessId,
    otpType: 'EMAIL',
    destination: email,
    otpHash,
    expiresAt
  });

  // Send via Resend API
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Default testing domain
      to: email,
      subject: 'Your Verification OTP',
      html: `<p>Your verification code is: <strong>${otp}</strong>. It expires in 5 minutes.</p>`
    });
    console.log(`[RESEND EMAIL] Sent Email OTP ${otp} to ${email}`);
  } catch (error) {
    console.error('Resend Email Error:', error);
    throw new Error('Failed to send email OTP');
  }
  
  return true;
};

const verifyOtp = async (businessId, otpType, otp) => {
  const attemptsKey = `otp_attempts:${businessId}:${otpType}`;
  let attempts = await redisClient.get(attemptsKey);
  if (attempts && parseInt(attempts) >= 5) {
    throw new Error('OTP_LIMIT_EXCEEDED'); // Too many failed attempts
  }

  // Find latest unverified OTP
  const record = await OtpVerification.findOne({
    businessId,
    otpType,
    verified: false,
    expiresAt: { $gt: new Date() } // Not expired
  }).sort({ createdAt: -1 });

  if (!record) {
    throw new Error('OTP_EXPIRED'); // Or invalid
  }

  const isValid = await bcrypt.compare(otp, record.otpHash);
  
  if (!isValid) {
    if (attempts) {
      await redisClient.incr(attemptsKey);
    } else {
      await redisClient.set(attemptsKey, '1', 'EX', 900); // Block for 15 mins after 5 attempts
    }
    throw new Error('OTP_INVALID');
  }

  // Mark as verified
  record.verified = true;
  await record.save();

  // Clear attempts
  await redisClient.del(attemptsKey);

  return true;
};

module.exports = {
  sendPhoneOtp,
  sendEmailOtp,
  verifyOtp
};
