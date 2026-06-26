const { sendSuccess } = require('../utils/apiResponse');
const rateCalculationService = require('../services/rateCalculation.service');
const redisService = require('../services/redis.service');

const calculateMRP = async (req, res, next) => {
  try {
    const { scanId } = req.params;
    const { 
      jewelleryType,
      netWt, 
      purityKarat, 
      customPurityPercent,
      labourCharge, 
      diamonds, 
      colorstones 
    } = req.body;
    
    const businessId = req.user.businessId;

    // 1. Fetch live gold rates and purity percentages for this business
    const liveRatesData = await rateCalculationService.getLiveGoldRates(businessId);
    
    // Find the karat purity from the database rows (normalize '14K' vs '14Kt')
    const normalizedKarat = purityKarat ? purityKarat.replace(/t$/i, '').toUpperCase() : '';
    const karatData = liveRatesData.karatRates.find(r => r.carat.replace(/t$/i, '').toUpperCase() === normalizedKarat);
    const karatPurityPercent = karatData ? karatData.purity : 0;

    let effectivePurityPercent = karatPurityPercent;
    if (customPurityPercent !== undefined && customPurityPercent !== null) {
       effectivePurityPercent = parseFloat(customPurityPercent) || 0;
    }

    // 2. Calculate Diamond Amount
    let diamondAmount = 0;
    if (Array.isArray(diamonds)) {
      diamonds.forEach(dia => {
        const wt = parseFloat(dia.weight) || 0;
        const rate = parseFloat(dia.rate) || 0;
        diamondAmount += (wt * rate);
      });
    }

    // 3. Calculate Colorstone Amount
    let colorstoneAmount = 0;
    if (Array.isArray(colorstones)) {
      colorstones.forEach(cs => {
        const wt = parseFloat(cs.weight) || 0;
        const rate = parseFloat(cs.rate) || 0;
        colorstoneAmount += (wt * rate);
      });
    }

    // 4. Calculate Pure Weight and Labour Charge
    const numericNetWt = parseFloat(netWt) || 0;
    let pureWeight = 0;
    let labourAmount = 0;

    if (labourCharge?.type === 'PERCENTAGE') {
      const labourPercent = parseFloat(labourCharge.value) || 0;
      pureWeight = numericNetWt * (labourPercent / 100);
      labourAmount = 0; // Labour is included in pure weight markup
    } else {
      // Labour is AMOUNT (per gram)
      pureWeight = numericNetWt * (effectivePurityPercent / 100);
      const labourRatePerGm = parseFloat(labourCharge?.value) || 0;
      labourAmount = numericNetWt * labourRatePerGm;
    }

    // 5. Calculate Gold Amount
    let baseGoldRatePer10g = liveRatesData.taxSettings?.scannerCalculationUse === 'cash' 
        ? liveRatesData.taxSettings.cashFinalRate 
        : liveRatesData.taxSettings.rtgsFinalRate;
        
    // Fallback if cache is old and doesn't contain pre-calculated final rates
    if (baseGoldRatePer10g === undefined && liveRatesData.mcxLiveRate) {
        const changeBy = liveRatesData.taxSettings?.scannerCalculationUse === 'cash'
           ? (liveRatesData.taxSettings?.cashChangeBy || 0)
           : (liveRatesData.taxSettings?.rtgsChangeBy || 0);
        baseGoldRatePer10g = liveRatesData.mcxLiveRate + changeBy;
    }
    
    const baseGoldRatePerGram = (baseGoldRatePer10g || 0) / 10;

    const goldAmount = baseGoldRatePerGram * pureWeight;

    // 6. Calculate Final MRP
    const finalMRP = goldAmount + diamondAmount + colorstoneAmount + labourAmount;

    const resultData = {
      breakdown: {
        diamondAmount,
        colorstoneAmount,
        pureWeight,
        goldRateApplied: baseGoldRatePerGram,
        goldAmount,
        labourAmount
      },
      finalMRP
    };

    // Store in Redis
    if (scanId) {
       const scan = await redisService.getScan(scanId);
       if (scan) {
         await redisService.updateScanStatus(scanId, scan.status, {
             calculation: resultData
         });
       }
    }

    sendSuccess(res, resultData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateMRP
};
