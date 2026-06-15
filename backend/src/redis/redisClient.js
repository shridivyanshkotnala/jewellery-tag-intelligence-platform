const Redis = require('ioredis');
const config = require('../config/env');

let redis = null;

if (process.env.USE_MEMORY_STORE !== 'true') {
  redis = new Redis(config.redis.url);

  redis.on('connect', () => {
    console.log('Connected to Redis');
  });

  redis.on('error', (err) => {
    console.error('Redis error:', err.message);
  });
} else {
  console.log('[redis] USE_MEMORY_STORE=true — skipping Redis connection');
}

module.exports = redis;
