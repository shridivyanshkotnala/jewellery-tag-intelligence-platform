const GoldRate = require('../models/goldRate.model');
const DiamondRate = require('../models/diamondRate.model');
const ColorstoneRate = require('../models/colorstoneRate.model');
const LabourRate = require('../models/labourRate.model');
const GoldTaxSetting = require('../models/goldTaxSetting.model');
const { getLiveGoldRates } = require('../services/rateCalculation.service');
const redisService = require('../services/redis.service');

// === GOLD RATES ===

const updateGoldRate = async (req, res) => {
  try {
    const { carat, purity, increaseByAmount, increaseByType } = req.body;
    const businessId = req.user.businessId;

    if (!carat || purity == null) {
      return res.status(400).json({ success: false, message: 'Carat and purity are required' });
    }

    const goldRate = await GoldRate.findOneAndUpdate(
      { businessId, carat },
      { 
        purity, 
        increaseByAmount: increaseByAmount || 0, 
        increaseByType: increaseByType || 'FLAT'
      },
      { new: true, upsert: true }
    );

    // Invalidate Cache since configuration changed
    await redisService.invalidateGoldRatesCache(businessId.toString());

    res.status(200).json({ success: true, data: goldRate });
  } catch (error) {
    console.error('Update Gold Rate Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

const getGoldRates = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    // Uses the "Supreme Truth Engine" which orchestrates MongoDB + Redis + Live Math
    const data = await getLiveGoldRates(businessId);
    
    // The previous frontend expected data format: { success, mcxLiveRate, data: rates }
    // The new UI uses taxSettings too, so we'll merge them in the response.
    res.status(200).json({ 
      success: true, 
      mcxLiveRate: data.mcxLiveRate, 
      taxSettings: data.taxSettings,
      data: data.karatRates 
    });
  } catch (error) {
    console.error('Get Gold Rates Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// === GOLD TAX SETTINGS ===

const getGoldTaxSettings = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    let taxSettings = await GoldTaxSetting.findOne({ businessId });
    if (!taxSettings) {
      taxSettings = { rtgsChangeBy: 0, cashChangeBy: 0, scannerCalculationUse: 'rtgs' };
    }
    res.status(200).json({ success: true, data: taxSettings });
  } catch (error) {
    console.error('Get Gold Tax Settings Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateGoldTaxSettings = async (req, res) => {
  try {
    const { rtgsChangeBy, cashChangeBy, scannerCalculationUse } = req.body;
    const businessId = req.user.businessId;

    const updateData = {};
    if (rtgsChangeBy !== undefined) updateData.rtgsChangeBy = rtgsChangeBy;
    if (cashChangeBy !== undefined) updateData.cashChangeBy = cashChangeBy;
    if (scannerCalculationUse) updateData.scannerCalculationUse = scannerCalculationUse;

    const taxSettings = await GoldTaxSetting.findOneAndUpdate(
      { businessId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    // Invalidate Cache since base rate logic changed
    await redisService.invalidateGoldRatesCache(businessId.toString());

    res.status(200).json({ success: true, data: taxSettings });
  } catch (error) {
    console.error('Update Gold Tax Settings Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// === DIAMOND RATES ===

const addOrUpdateDiamondRate = async (req, res) => {
  try {
    const { color, clarity, rate } = req.body;
    const businessId = req.user.businessId;

    if (!color || !clarity || rate == null) {
      return res.status(400).json({ success: false, message: 'Color, clarity, and rate are required' });
    }

    const diamondRate = await DiamondRate.findOneAndUpdate(
      { businessId, color, clarity },
      { rate },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: diamondRate });
  } catch (error) {
    console.error('Add Diamond Rate Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getDiamondRates = async (req, res) => {
  try {
    console.log('[RATE] GET /rates/diamond hit by user:', req.user?.businessId);
    const businessId = req.user.businessId;
    const rates = await DiamondRate.find({ businessId });
    res.status(200).json({ success: true, data: rates });
  } catch (error) {
    console.error('Get Diamond Rates Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const deleteDiamondRate = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;
    await DiamondRate.findOneAndDelete({ _id: id, businessId });
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// === COLORSTONE RATES ===

const addOrUpdateColorstoneRate = async (req, res) => {
  try {
    const { color, clarity, rate } = req.body;
    const businessId = req.user.businessId;

    if (!color || !clarity || rate == null) {
      return res.status(400).json({ success: false, message: 'Color, clarity, and rate are required' });
    }

    const colorstoneRate = await ColorstoneRate.findOneAndUpdate(
      { businessId, color, clarity },
      { rate },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: colorstoneRate });
  } catch (error) {
    console.error('Add Colorstone Rate Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getColorstoneRates = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const rates = await ColorstoneRate.find({ businessId });
    res.status(200).json({ success: true, data: rates });
  } catch (error) {
    console.error('Get Colorstone Rates Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const deleteColorstoneRate = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;
    await ColorstoneRate.findOneAndDelete({ _id: id, businessId });
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// === LABOUR RATES ===

const getLabourRate = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const labourRate = await LabourRate.findOne({ businessId });
    res.status(200).json({ success: true, data: labourRate ?? null });
  } catch (error) {
    console.error('Get Labour Rate Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const upsertLabourRate = async (req, res) => {
  try {
    const { chargeType, value } = req.body;
    const businessId = req.user.businessId;

    if (!chargeType || value == null) {
      return res.status(400).json({
        success: false,
        message: 'chargeType and value are required',
      });
    }

    if (!['AMOUNT', 'PERCENTAGE'].includes(chargeType)) {
      return res.status(400).json({
        success: false,
        message: 'chargeType must be AMOUNT or PERCENTAGE',
      });
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'value must be a positive number',
      });
    }

    if (chargeType === 'PERCENTAGE' && numericValue > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage value must be between 0 and 100',
      });
    }

    const labourRate = await LabourRate.findOneAndUpdate(
      { businessId },
      { chargeType, value: numericValue },
      { new: true, upsert: true },
    );

    res.status(200).json({ success: true, data: labourRate });
  } catch (error) {
    console.error('Upsert Labour Rate Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

module.exports = {
  updateGoldRate,
  getGoldRates,
  getGoldTaxSettings,
  updateGoldTaxSettings,
  addOrUpdateDiamondRate,
  getDiamondRates,
  deleteDiamondRate,
  addOrUpdateColorstoneRate,
  getColorstoneRates,
  deleteColorstoneRate,
  getLabourRate,
  upsertLabourRate,
};
