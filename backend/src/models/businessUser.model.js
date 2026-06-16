const mongoose = require('mongoose');

const businessUserSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['OWNER', 'EMP'],
    default: 'OWNER',
    required: true
  },
  emailVerified: {
    type: Boolean,
    default: true
  },
  phoneVerified: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'business_users'
});

module.exports = mongoose.model('BusinessUser', businessUserSchema);
