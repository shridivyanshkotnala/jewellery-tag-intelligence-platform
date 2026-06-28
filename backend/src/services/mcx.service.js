const axios = require('axios');
const redisService = require('./redis.service');
const config = require('../config/env');

const getLiveMcxRate24K = async () => {
  try {
    // 1. Check Redis Cache First
    const cachedRate = await redisService.getMcxCache();
    if (cachedRate) {
      return cachedRate;
    }

    // 2. Fetch from Metals API
    const apiKey = process.env.METALS_API_KEY;
    if (!apiKey) {
      throw new Error('METALS_API_KEY is not defined in environment variables');
    }
    const url = `https://api.metals.dev/v1/metal/authority?api_key=${apiKey}&authority=mcx&currency=INR&unit=10g`;
    
    const response = await axios.get(url, { timeout: 10000 }); // 10 second timeout
    const data = response.data;

    if (data && data.status === 'success' && data.rates && data.rates.mcx_gold) {
      const liveRate = Math.round(data.rates.mcx_gold);
      
      // 3. Cache the successful result
      await redisService.setMcxCache(liveRate);
      
      return liveRate;
    } else {
      throw new Error('Invalid response format from Metals API');
    }
  } catch (error) {
    console.error('[MCX Service] Failed to fetch live MCX rate:', error.message);
    // Fallback if no cache and API fails
    return 160000;
  }
};

module.exports = {
  getLiveMcxRate24K
};
