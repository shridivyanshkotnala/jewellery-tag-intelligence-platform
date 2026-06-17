const { sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  console.error(err);
  
  const errorMapping = {
    'BUSINESS_ALREADY_REGISTERED': { status: 409, msg: 'This GST number is already registered. Please login.' },
    'INVALID_GST_NUMBER': { status: 400, msg: 'The provided GST number is invalid.' },
    'OTP_EXPIRED': { status: 400, msg: 'The OTP has expired or is invalid.' },
    'OTP_INVALID': { status: 400, msg: 'The OTP provided is incorrect.' },
    'OTP_LIMIT_EXCEEDED': { status: 429, msg: 'You have exceeded the maximum number of OTP attempts.' },
    'RESEND_TIMEOUT': { status: 429, msg: 'Please wait before requesting another OTP.' },
    'EMAIL_ALREADY_EXISTS': { status: 409, msg: 'This email is already associated with an account.' },
    'PHONE_ALREADY_EXISTS': { status: 409, msg: 'This phone number is already associated with an account.' },
    'REGISTRATION_SESSION_EXPIRED': { status: 410, msg: 'Registration session expired. Please verify GST again.' },
    'UNAUTHORIZED': { status: 401, msg: 'Missing or invalid authentication token.' },
    'FORBIDDEN': { status: 403, msg: 'You do not have permission to access this resource.' },
    'INVALID_CREDENTIALS': { status: 401, msg: 'Invalid email or password.' },
    'INVALID_PHONE_CREDENTIALS': { status: 401, msg: 'Invalid phone number or password.' }
  };

  let statusCode = err.statusCode || 500;
  let errorKey = err.message || 'Internal Server Error';
  let displayMessage = errorKey;

  // Joi Validation errors
  if (err.isJoi) {
    statusCode = 400;
    errorKey = 'VALIDATION_ERROR';
    displayMessage = err.details[0].message;
  } else if (errorMapping[err.message]) {
    statusCode = errorMapping[err.message].status;
    errorKey = err.message;
    displayMessage = errorMapping[err.message].msg;
  }

  res.status(statusCode).json({
    success: false,
    error: errorKey,
    message: displayMessage
  });
};

module.exports = errorHandler;
