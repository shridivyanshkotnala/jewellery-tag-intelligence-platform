const config = require('../config/env');
const redis = require('../redis/redisClient');

// 24 hours
const TTL = 24 * 60 * 60;
const memoryStore = new Map();

let useMemoryStore = process.env.USE_MEMORY_STORE === 'true';

function scanKey(scanId) {
  return `scan:${scanId}`;
}

function enableMemoryFallback(reason) {
  if (!useMemoryStore) {
    useMemoryStore = true;
    console.warn(`[scan-store] Redis unavailable (${reason}). Using in-memory store for development.`);
  }
}

async function runStoreOp(operation) {
  if (useMemoryStore) {
    return operation('memory');
  }

  try {
    return await operation('redis');
  } catch (err) {
    if (config.env === 'development') {
      enableMemoryFallback(err.message);
      return operation('memory');
    }
    throw err;
  }
}

const setScan = async (scanId, data) => {
  await redis.set(`scan:${scanId}`, JSON.stringify(data), "EX", TTL);
};

const getScan = async (scanId) => {
  return runStoreOp(async (backend) => {
    if (backend === 'memory') {
      const data = memoryStore.get(scanKey(scanId));
      return data ? JSON.parse(data) : null;
    }

    const data = await redis.get(scanKey(scanId));
    return data ? JSON.parse(data) : null;
  });
};

const scanLocks = new Map();

const acquireLock = async (scanId) => {
  while (scanLocks.get(scanId)) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  scanLocks.set(scanId, true);
};

const releaseLock = (scanId) => {
  scanLocks.delete(scanId);
};

const updateScanStatus = async (scanId, status, extraData = {}) => {
  await acquireLock(scanId);
  try {
    const scan = await getScan(scanId);
    if (!scan) throw new Error('Scan not found');

    const updatedScan = {
      ...scan,
      ...extraData,
      status,
      updatedAt: new Date().toISOString(),
    };

    await setScan(scanId, updatedScan);
    return updatedScan;
  } finally {
    releaseLock(scanId);
  }
};

// === GOLD RATES CACHING ===

function goldKey(businessId) {
  return `gold_rates:${businessId}`;
}

const setGoldRatesCache = async (businessId, data) => {
  return runStoreOp(async (backend) => {
    if (backend === 'memory') {
      memoryStore.set(goldKey(businessId), JSON.stringify(data));
      return;
    }
    await redis.set(goldKey(businessId), JSON.stringify(data), "EX", TTL);
  });
};

const getGoldRatesCache = async (businessId) => {
  return runStoreOp(async (backend) => {
    if (backend === 'memory') {
      const data = memoryStore.get(goldKey(businessId));
      return data ? JSON.parse(data) : null;
    }
    const data = await redis.get(goldKey(businessId));
    return data ? JSON.parse(data) : null;
  });
};

const invalidateGoldRatesCache = async (businessId) => {
  return runStoreOp(async (backend) => {
    if (backend === 'memory') {
      memoryStore.delete(goldKey(businessId));
      return;
    }
    await redis.del(goldKey(businessId));
  });
};

const invalidateAllGoldRatesCache = async () => {
  return runStoreOp(async (backend) => {
    if (backend === 'memory') {
      for (const key of memoryStore.keys()) {
        if (key.startsWith('gold_rates:')) {
          memoryStore.delete(key);
        }
      }
      return;
    }
    // In Redis, delete all keys matching gold_rates:*
    const keys = await redis.keys('gold_rates:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  });
};

// === MCX API CACHING (24h TTL since scheduler updates every 60s) ===
const MCX_TTL = 24 * 60 * 60;

function mcxKey() {
  return `mcx_gold_live_rate`;
}

const setMcxCache = async (data) => {
  return runStoreOp(async (backend) => {
    if (backend === 'memory') {
      memoryStore.set(mcxKey(), JSON.stringify(data));
      setTimeout(() => memoryStore.delete(mcxKey()), MCX_TTL * 1000);
      return;
    }
    await redis.set(mcxKey(), JSON.stringify(data), "EX", MCX_TTL);
  });
};

const getMcxCache = async () => {
  return runStoreOp(async (backend) => {
    if (backend === 'memory') {
      const data = memoryStore.get(mcxKey());
      return data ? JSON.parse(data) : null;
    }
    const data = await redis.get(mcxKey());
    return data ? JSON.parse(data) : null;
  });
};

module.exports = {
  setScan,
  getScan,
  updateScanStatus,
  setGoldRatesCache,
  getGoldRatesCache,
  invalidateGoldRatesCache,
  invalidateAllGoldRatesCache,
  setMcxCache,
  getMcxCache
};
