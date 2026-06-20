const mongoose = require('mongoose');

const diamondRateSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  color: {
    type: String,
    required: true,
    trim: true // Any string accepted, no enum
  },
  clarity: {
    type: String,
    required: true,
    trim: true // Any string accepted, no enum
  },
  rate: {
    type: Number,
    required: true
  }
}, {
  timestamps: true,
  collection: 'diamond_rates'
});

// Ensure uniqueness for a business based on color and clarity
diamondRateSchema.index({ businessId: 1, color: 1, clarity: 1 }, { unique: true });

module.exports = mongoose.model('DiamondRate', diamondRateSchema);
