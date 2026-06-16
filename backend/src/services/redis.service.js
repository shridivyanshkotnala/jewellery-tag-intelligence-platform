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

const updateScanStatus = async (scanId, status, extraData = {}) => {
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
};

module.exports = {
  setScan,
  getScan,
  updateScanStatus,
};
