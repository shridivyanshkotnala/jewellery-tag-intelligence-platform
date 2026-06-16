const redis = require('../redis/redisClient');

// 24 hours
const TTL = 24 * 60 * 60;

const setScan = async (scanId, data) => {
  await redis.set(`scan:${scanId}`, JSON.stringify(data), "EX", TTL);
};

const getScan = async (scanId) => {
  const data = await redis.get(`scan:${scanId}`);
  return data ? JSON.parse(data) : null;
};

const updateScanStatus = async (scanId, status, extraData = {}) => {
  const scan = await getScan(scanId);
  if (!scan) throw new Error('Scan not found');
  
  const updatedScan = {
    ...scan,
    ...extraData,
    status,
    updatedAt: new Date().toISOString()
  };
  
  await setScan(scanId, updatedScan);
  return updatedScan;
};

module.exports = {
  setScan,
  getScan,
  updateScanStatus
};
