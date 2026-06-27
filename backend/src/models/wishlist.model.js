const mongoose = require('mongoose');

/**
 * Wishlist Item – permanently persisted in MongoDB when the user
 * presses "Add to Wishlist" on the scan-results screen.
 *
 * All scan state lives in Redis until this point.
 */
const wishlistSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    // Client-generated unique id (wl-<timestamp>-<random>) so the
    // frontend can reference the same item without an extra lookup.
    itemId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    tagCode: {
      type: String,
      required: true,
      trim: true,
    },
    // Total MRP in ₹ (number, no formatting here)
    totalMrp: {
      type: Number,
      required: true,
      default: 0,
    },
    // Formatted price badge string, e.g. "₹ 1,84,500 (Including Tax)"
    priceBadge: {
      type: String,
      default: '',
    },
    // ISO string – time the scan session was created
    scanTimestamp: {
      type: String,
      required: true,
    },
    // Complete snapshot: scanData, structuredData, selectedType,
    // diamonds[], colorstones[], pricing fields
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Compound index for efficient per-business lookups
wishlistSchema.index({ businessId: 1, createdAt: -1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);
