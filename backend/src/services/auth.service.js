const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const businessesByGst = new Map();
const businessesById = new Map();
const otpsByBusinessId = new Map();
const usersByEmail = new Map();

function normalizeGstNumber(gstNumber) {
  return String(gstNumber || '').trim().toUpperCase().replace(/^GSTN/i, '');
}

function isValidGstNumber(gstNumber) {
  return GST_REGEX.test(normalizeGstNumber(gstNumber));
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyGst(gstNumber) {
  const normalized = normalizeGstNumber(gstNumber);
  if (!GST_REGEX.test(normalized)) {
    const error = new Error('Enter a valid 15-character GST number');
    error.statusCode = 400;
    throw error;
  }

  return {
    gstNumber: normalized,
    businessName: 'Pratham International',
    legalName: 'Pratham International Pvt Ltd',
    tradeName: 'Pratham International',
  };
}

function confirmGst(gstNumber) {
  const normalized = normalizeGstNumber(gstNumber);
  if (!GST_REGEX.test(normalized)) {
    const error = new Error('Enter a valid 15-character GST number');
    error.statusCode = 400;
    throw error;
  }

  const existing = businessesByGst.get(normalized);
  if (existing) {
    return existing;
  }

  const business = {
    businessId: uuidv4(),
    gstNumber: normalized,
    businessName: 'Pratham International',
    status: 'PENDING_CONTACT',
    phoneVerified: false,
    emailVerified: false,
    createdAt: new Date().toISOString(),
  };

  businessesByGst.set(normalized, business);
  businessesById.set(business.businessId, business);
  return business;
}

function submitContactDetails({ businessId, phone, email }) {
  const business = businessesById.get(businessId);
  if (!business) {
    const error = new Error('Business not found');
    error.statusCode = 404;
    throw error;
  }

  business.phone = phone;
  business.email = email;
  business.status = 'PENDING_OTP';

  const phoneOtp = generateOtp();
  const emailOtp = generateOtp();
  otpsByBusinessId.set(businessId, { phoneOtp, emailOtp });

  console.log(`[auth] Phone OTP for ${phone}: ${phoneOtp}`);
  console.log(`[auth] Email OTP for ${email}: ${emailOtp}`);

  return { businessId, message: 'OTP sent successfully' };
}

function verifyPhoneOtp({ businessId, otp }) {
  const business = businessesById.get(businessId);
  if (!business) {
    const error = new Error('Business not found');
    error.statusCode = 404;
    throw error;
  }

  const stored = otpsByBusinessId.get(businessId);
  if (!stored || stored.phoneOtp !== String(otp).trim()) {
    const error = new Error('Invalid phone OTP');
    error.statusCode = 400;
    throw error;
  }

  business.phoneVerified = true;
  return { businessId, message: 'Phone verified successfully' };
}

function verifyEmailOtp({ businessId, otp }) {
  const business = businessesById.get(businessId);
  if (!business) {
    const error = new Error('Business not found');
    error.statusCode = 404;
    throw error;
  }

  const stored = otpsByBusinessId.get(businessId);
  if (!stored || stored.emailOtp !== String(otp).trim()) {
    const error = new Error('Invalid email OTP');
    error.statusCode = 400;
    throw error;
  }

  business.emailVerified = true;
  return { businessId, message: 'Email verified successfully' };
}

function createPassword({ businessId, password, confirmPassword }) {
  const business = businessesById.get(businessId);
  if (!business) {
    const error = new Error('Business not found');
    error.statusCode = 404;
    throw error;
  }

  if (!business.phoneVerified || !business.emailVerified) {
    const error = new Error('Complete phone and email verification first');
    error.statusCode = 400;
    throw error;
  }

  if (!password || password.length < 8) {
    const error = new Error('Password must be at least 8 characters');
    error.statusCode = 400;
    throw error;
  }

  if (password !== confirmPassword) {
    const error = new Error('Passwords do not match');
    error.statusCode = 400;
    throw error;
  }

  if (!business.email) {
    const error = new Error('Business email is missing');
    error.statusCode = 400;
    throw error;
  }

  usersByEmail.set(business.email.toLowerCase(), {
    businessId,
    email: business.email.toLowerCase(),
    passwordHash: hashPassword(password),
  });

  business.status = 'ACTIVE';
  return { businessId, message: 'Registration completed successfully' };
}

function loginBusiness({ email, password }) {
  const user = usersByEmail.get(String(email || '').trim().toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password)) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  return {
    accessToken: `access-${uuidv4()}`,
    refreshToken: `refresh-${uuidv4()}`,
    businessId: user.businessId,
  };
}

module.exports = {
  normalizeGstNumber,
  isValidGstNumber,
  verifyGst,
  confirmGst,
  submitContactDetails,
  verifyPhoneOtp,
  verifyEmailOtp,
  createPassword,
  loginBusiness,
};
