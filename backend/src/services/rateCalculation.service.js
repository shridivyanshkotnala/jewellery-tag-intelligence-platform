const mcxService = require('./mcx.service');

/**
 * Calculates the final gold rate based on the MCX live rate, purity percentage, and an optional increase.
 * Formula: (MCX_LIVE_RATE * (PURITY / 100)) + increaseByAmount (if flat) or + percentage (if percentage)
 * 
 * @param {Number} purity - The purity percentage (e.g., 91.6 for 22Kt)
 * @param {Number} increaseByAmount - The amount to increase by (e.g., 50)
 * @param {String} increaseByType - 'FLAT' (₹) or 'PERCENTAGE' (%)
 * @returns {Number} - The calculated final rate rounded to 2 decimal places.
 */
const calculateGoldFinalRate = async (purity, increaseByAmount = 0, increaseByType = 'FLAT') => {
  if (purity == null || isNaN(purity)) {
    throw new Error('Valid purity percentage is required for calculation.');
  }

  const mcxLiveRate = await mcxService.getLiveMcxRate24K();
  
  // Base calculated rate based on purity
  const baseRate = mcxLiveRate * (purity / 100);

  let finalRate = baseRate;

  // Apply increase
  if (increaseByAmount && !isNaN(increaseByAmount)) {
    if (increaseByType === 'PERCENTAGE') {
      finalRate = baseRate + (baseRate * (increaseByAmount / 100));
    } else {
      // Default to FLAT
      finalRate = baseRate + Number(increaseByAmount);
    }
  }

  // Return rounded to 2 decimal places
  return Math.round(finalRate * 100) / 100;
};

module.exports = {
  calculateGoldFinalRate
};
