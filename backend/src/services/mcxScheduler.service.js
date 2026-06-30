const axios = require('axios');
const redisService = require('./redis.service');
const MCXFetch = require('../models/mcxFetch.model');
const config = require('../config/env');

let schedulerInterval = null;

const fetchAndStoreMcxRate = async () => {
  try {
    const apiKey = process.env.METALS_API_KEY;
    if (!apiKey) {
      console.error('[MCX Scheduler] METALS_API_KEY is not defined');
      return;
    }

    const url = `https://api.metals.dev/v1/metal/authority?api_key=${apiKey}&authority=mcx&currency=INR&unit=10g`;
    
    // Fetch live rate
    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data;

    if (data && data.status === 'success' && data.rates && data.rates.mcx_gold) {
      const liveRate = Math.round(data.rates.mcx_gold);
      
      const oldRate = await redisService.getMcxCache();

      // Store in Redis (24-hour cache instead of 60s since scheduler manages it)
      await redisService.setMcxCache(liveRate);
      console.log(`[MCX Scheduler] Successfully fetched and cached new rate: ${liveRate}`);

      if (oldRate !== liveRate) {
        console.log(`[MCX Scheduler] Rate changed from ${oldRate} to ${liveRate}. Invalidating 24-hour dashboard cache.`);
        await redisService.invalidateAllGoldRatesCache();
      }

      // Track API call in MongoDB
      const now = new Date();
      const nextFetch = new Date(now.getTime() + 60 * 1000); // +60 seconds

      let fetchRecord = await MCXFetch.findOne();
      if (!fetchRecord) {
        fetchRecord = new MCXFetch({
          lastFetchedTime: now,
          expectedNextFetchTime: nextFetch,
          numberOfApiCall: 1
        });
      } else {
        fetchRecord.lastFetchedTime = now;
        fetchRecord.expectedNextFetchTime = nextFetch;
        fetchRecord.numberOfApiCall += 1;
      }
      
      await fetchRecord.save();
    } else {
      console.error('[MCX Scheduler] Invalid response format from Metals API', data);
    }
  } catch (error) {
    console.error('[MCX Scheduler] Failed to fetch live MCX rate:', error.message);
  }
};

const initMcxScheduler = async () => {
  try {
    let fetchRecord = await MCXFetch.findOne();
    const now = new Date();

    // If no record exists OR the current time is past the expected next fetch time,
    // fetch immediately irrespective of the 60s timer
    if (!fetchRecord || now >= fetchRecord.expectedNextFetchTime) {
      console.log('[MCX Scheduler] Starting immediate fetch based on MCXFetch table.');
      await fetchAndStoreMcxRate();
    } else {
      console.log(`[MCX Scheduler] Skipping immediate fetch, next fetch expected at ${fetchRecord.expectedNextFetchTime}`);
    }

    // Start ticking 60 sec timer for calling API
    if (schedulerInterval) {
      clearInterval(schedulerInterval);
    }
    
    schedulerInterval = setInterval(async () => {
      await fetchAndStoreMcxRate();
    }, 60 * 1000);

    console.log('[MCX Scheduler] 60s polling service started successfully.');
  } catch (error) {
    console.error('[MCX Scheduler] Failed to initialize scheduler:', error.message);
  }
};

module.exports = {
  initMcxScheduler,
  fetchAndStoreMcxRate
};
