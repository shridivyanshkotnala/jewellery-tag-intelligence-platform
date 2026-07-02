const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  otpType: {
    type: String,
    enum: ['PHONE', 'EMAIL'],
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  otpHash: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true, 
  collection: 'otp_verifications'
});


otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpVerification', otpVerificationSchema);
