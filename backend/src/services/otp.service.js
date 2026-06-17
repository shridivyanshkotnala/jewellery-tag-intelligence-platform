const bcrypt = require('bcryptjs');
const { Resend } = require('resend');
const OtpVerification = require('../models/otpVerification.model');
const redisClient = require('../redis/redisClient');
const config = require('../config/env');

const resend = new Resend(config.resend.apiKey);
const isDevelopment = config.env === 'development';
const devOtpStore = new Map();

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const rememberDevOtp = (businessId, type, otp, destination) => {
  const entry = devOtpStore.get(businessId) || {};
  entry[type.toLowerCase()] = otp;
  devOtpStore.set(businessId, entry);
  console.log('');
  console.log('========================================');
  console.log(`[DEV OTP] ${type} OTP: ${otp}`);
  console.log(`[DEV OTP] For: ${destination}`);
  console.log(`[DEV OTP] businessId: ${businessId}`);
  console.log('========================================');
  console.log('');
};

const getDevOtps = (businessId) => devOtpStore.get(businessId) || {};

// Rate limiting and Resend logic
const checkOtpRateLimits = async (businessId, type) => {
  const resendKey = `otp_resend:${businessId}:${type}`;
  const shortLimitKey = `otp_count_short:${businessId}:${type}`;
  const dayKey = `otp_count_day:${businessId}:${type}`;

  const isResendBlocked = await redisClient.get(resendKey);
  if (isResendBlocked) {
    throw new Error('RESEND_TIMEOUT');
  }

  let shortCount = await redisClient.get(shortLimitKey);
  if (shortCount && parseInt(shortCount) >= 5) {
    throw new Error('OTP_LIMIT_EXCEEDED');
  }

  let dayCount = await redisClient.get(dayKey);
  if (dayCount && parseInt(dayCount) >= 10) {
    throw new Error('OTP_LIMIT_EXCEEDED');
  }

  await redisClient.set(resendKey, 'blocked', 'EX', 60);

  if (shortCount) {
    await redisClient.incr(shortLimitKey);
  } else {
    await redisClient.set(shortLimitKey, '1', 'EX', 300);
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
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await OtpVerification.create({
    businessId,
    otpType: 'PHONE',
    destination: phone,
    otpHash,
    expiresAt,
  });

  rememberDevOtp(businessId, 'phone', otp, phone);

  try {
    const response = await fetch('https://control.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authkey: config.msg91.authKey,
      },
      body: JSON.stringify({
        template_id: config.msg91.templateId,
        mobile: `91${phone}`,
        otp,
      }),
    });

    const data = await response.json();

    if (data.type === 'error') {
      throw new Error(data.message || 'MSG91 returned an error');
    }

    console.log(`[MSG91] Sent phone OTP to ${phone}`);
  } catch (error) {
    if (isDevelopment) {
      console.warn(
        `[DEV OTP] MSG91 unavailable (${error.message}) — use terminal OTP above for phone ${phone}`
      );
      return true;
    }
    console.error('MSG91 Request Error:', error);
    throw new Error('Failed to send SMS OTP');
  }

  return true;
};

const sendEmailOtp = async (businessId, email) => {
  await checkOtpRateLimits(businessId, 'EMAIL');

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await OtpVerification.create({
    businessId,
    otpType: 'EMAIL',
    destination: email,
    otpHash,
    expiresAt,
  });

  rememberDevOtp(businessId, 'email', otp, email);

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Your Verification OTP',
      html: `<p>Your verification code is: <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    });
    console.log(`[RESEND] Sent email OTP to ${email}`);
  } catch (error) {
    if (isDevelopment) {
      console.warn(
        `[DEV OTP] Resend unavailable (${error.message}) — use terminal OTP above for ${email}`
      );
      return true;
    }
    console.error('Resend Email Error:', error);
    throw new Error('Failed to send email OTP');
  }

  return true;
};

const verifyOtp = async (businessId, otpType, otp) => {
  const attemptsKey = `otp_attempts:${businessId}:${otpType}`;
  let attempts = await redisClient.get(attemptsKey);
  if (attempts && parseInt(attempts) >= 5) {
    throw new Error('OTP_LIMIT_EXCEEDED');
  }

  const record = await OtpVerification.findOne({
    businessId,
    otpType,
    verified: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) {
    throw new Error('OTP_EXPIRED');
  }

  const isValid = await bcrypt.compare(otp, record.otpHash);

  if (!isValid) {
    if (attempts) {
      await redisClient.incr(attemptsKey);
    } else {
      await redisClient.set(attemptsKey, '1', 'EX', 900);
    }
    throw new Error('OTP_INVALID');
  }

  record.verified = true;
  await record.save();
  await redisClient.del(attemptsKey);

  return true;
};

module.exports = {
  sendPhoneOtp,
  sendEmailOtp,
  verifyOtp,
  getDevOtps,
};
