const mcxService = require('./mcx.service');
const GoldTaxSetting = require('../models/goldTaxSetting.model');
const GoldRate = require('../models/goldRate.model');
const redisService = require('./redis.service');

const getLiveGoldRates = async (businessId) => {
  if (!businessId) throw new Error('Business ID is required');

  // 1. Check Redis Cache First
  const cachedData = await redisService.getGoldRatesCache(businessId.toString());
  if (cachedData) {
    return cachedData;
  }

  // 2. Fetch MCX Live Rate (The Supreme Truth)
  const mcxLiveRate = await mcxService.getLiveMcxRate24K();

  // 3. Fetch Gold Tax Settings from DB (or assume defaults)
  let taxSettings = await GoldTaxSetting.findOne({ businessId });
  if (!taxSettings) {
    taxSettings = {
      rtgsChangeBy: 0,
      cashChangeBy: 0,
      scannerCalculationUse: 'rtgs'
    };
  }

  // 4. Compute Live Final Tax Rates
  const rtgsFinalRate = mcxLiveRate + taxSettings.rtgsChangeBy;
  const cashFinalRate = mcxLiveRate + taxSettings.cashChangeBy;

  // 5. Determine Base Rate for Karat Calculations
  const baseRate = taxSettings.scannerCalculationUse === 'cash' ? cashFinalRate : rtgsFinalRate;

  // 6. Fetch Gold Rate Rows from DB
  let karatRows = await GoldRate.find({ businessId });
  
  // Initialize missing default rows if they don't exist
  const requiredCarats = [
    { carat: '22Kt', purity: 91.6 },
    { carat: '20Kt', purity: 85 },
    { carat: '18Kt', purity: 75 },
    { carat: '14Kt', purity: 58.5 },
    { carat: '9Kt', purity: 39 }
  ];

  if (karatRows.length < 5) {
    const existingCarats = karatRows.map(r => r.carat);
    const toCreate = requiredCarats.filter(rc => !existingCarats.includes(rc.carat));
    
    for (const rc of toCreate) {
      const newRate = new GoldRate({
        businessId,
        carat: rc.carat,
        purity: rc.purity,
        increaseByAmount: 0,
        increaseByType: 'FLAT'
      });
      await newRate.save();
      karatRows.push(newRate);
    }
  }

  // 7. Calculate Final Live Rates for Each Row
  const computedKaratRates = karatRows.map(row => {
    const basePurityRate = baseRate * (row.purity / 100);
    let finalRate = basePurityRate;

    if (row.increaseByAmount && !isNaN(row.increaseByAmount)) {
      if (row.increaseByType === 'PERCENTAGE') {
        finalRate = basePurityRate + (basePurityRate * (row.increaseByAmount / 100));
      } else {
        finalRate = basePurityRate + row.increaseByAmount;
      }
    }

    // Compute all three rates explicitly for the UI dashboard
    const mcxRate = Math.round(mcxLiveRate * (row.purity / 100));
    const cashRate = Math.round(cashFinalRate * (row.purity / 100));
    const rtgsRate = Math.round(rtgsFinalRate * (row.purity / 100));

    return {
      _id: row._id,
      carat: row.carat,
      purity: row.purity,
      increaseByAmount: row.increaseByAmount,
      increaseByType: row.increaseByType,
      finalRate: Math.round(finalRate * 100) / 100, // Legacy fallback
      mcxRate,
      cashRate,
      rtgsRate
    };
  });

  // Sort rows to maintain consistent order
  const caratOrder = { '22Kt': 1, '20Kt': 2, '18Kt': 3, '14Kt': 4, '9Kt': 5 };
  computedKaratRates.sort((a, b) => caratOrder[a.carat] - caratOrder[b.carat]);

  // 8. Compile the Final Rich Response
  const responseData = {
    mcxLiveRate,
    taxSettings: {
      rtgsChangeBy: taxSettings.rtgsChangeBy,
      cashChangeBy: taxSettings.cashChangeBy,
      scannerCalculationUse: taxSettings.scannerCalculationUse,
      rtgsFinalRate,
      cashFinalRate
    },
    karatRates: computedKaratRates
  };

  // 9. Cache in Redis for 24 hours
  await redisService.setGoldRatesCache(businessId.toString(), responseData);

  return responseData;
};

module.exports = {
  getLiveGoldRates
};
