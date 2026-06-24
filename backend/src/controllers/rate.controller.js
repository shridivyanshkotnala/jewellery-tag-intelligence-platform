const GoldRate = require('../models/goldRate.model');
const DiamondRate = require('../models/diamondRate.model');
const ColorstoneRate = require('../models/colorstoneRate.model');
const LabourRate = require('../models/labourRate.model');
const { calculateGoldFinalRate } = require('../services/rateCalculation.service');
const mcxService = require('../services/mcx.service');

// === GOLD RATES ===

const updateGoldRate = async (req, res) => {
  try {
    const { carat, purity, increaseByAmount, increaseByType } = req.body;
    const businessId = req.user.businessId;

    if (!carat || purity == null) {
      return res.status(400).json({ success: false, message: 'Carat and purity are required' });
    }

    const calculatedFinalRate = await calculateGoldFinalRate(purity, increaseByAmount, increaseByType);

    const goldRate = await GoldRate.findOneAndUpdate(
      { businessId, carat },
      { 
        purity, 
        increaseByAmount: increaseByAmount || 0, 
        increaseByType: increaseByType || 'FLAT', 
        calculatedFinalRate 
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: goldRate });
  } catch (error) {
    console.error('Update Gold Rate Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

const getGoldRates = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    let rates = await GoldRate.find({ businessId });
    
    const requiredCarats = [
      { carat: '22Kt', purity: 91.6 },
      { carat: '20Kt', purity: 85 },
      { carat: '18Kt', purity: 75 },
      { carat: '14Kt', purity: 58.5 },
      { carat: '9Kt', purity: 39 }
    ];

    // Initialize the fixed rows if they don't exist
    if (rates.length < 5) {
      const existingCarats = rates.map(r => r.carat);
      const toCreate = requiredCarats.filter(rc => !existingCarats.includes(rc.carat));
      
      for (const rc of toCreate) {
        const calculatedFinalRate = await calculateGoldFinalRate(rc.purity, 0, 'FLAT');
        const newRate = new GoldRate({
          businessId,
          carat: rc.carat,
          purity: rc.purity,
          increaseByAmount: 0,
          increaseByType: 'FLAT',
          calculatedFinalRate
        });
        await newRate.save();
        rates.push(newRate);
      }
    }

    const mcxLiveRate = await mcxService.getLiveMcxRate24K();

    res.status(200).json({ success: true, mcxLiveRate, data: rates });
  } catch (error) {
    console.error('Get Gold Rates Error:', error);
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
  addOrUpdateDiamondRate,
  getDiamondRates,
  deleteDiamondRate,
  addOrUpdateColorstoneRate,
  getColorstoneRates,
  deleteColorstoneRate,
  getLabourRate,
  upsertLabourRate,
};
