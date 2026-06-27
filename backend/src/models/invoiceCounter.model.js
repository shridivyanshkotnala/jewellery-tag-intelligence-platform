const mongoose = require('mongoose');

/**
 * Tracks the last used sequence counter per day, globally across all businesses.
 * Format: INV-YYYY-MMDD-NNNNN
 */
const invoiceCounterSchema = new mongoose.Schema({
  dateKey: { type: String, required: true, unique: true }, // e.g. "2026-0627"
  seq: { type: Number, default: 0 },
});

const InvoiceCounter = mongoose.model('InvoiceCounter', invoiceCounterSchema, 'invoice_counters');

/**
 * Atomically increments the daily counter and returns the new invoice number.
 * e.g. "INV-2026-0627-00001"
 */
async function generateInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateKey = `${year}-${mm}${dd}`;

  const counter = await InvoiceCounter.findOneAndUpdate(
    { dateKey },
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  );

  const seq = String(counter.seq).padStart(5, '0');
  return `INV-${year}-${mm}${dd}-${seq}`;
}

module.exports = { generateInvoiceNumber };
