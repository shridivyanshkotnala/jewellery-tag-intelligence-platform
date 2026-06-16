const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateTokens = (businessId, userId, role) => {
  const payload = { businessId, userId, role };
  
  const accessToken = jwt.sign(payload, config.jwt.accessSecret, { expiresIn: '24h' });
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: '7d' });
  
  return { accessToken, refreshToken };
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (error) {
    throw new Error('UNAUTHORIZED');
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    throw new Error('UNAUTHORIZED');
  }
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken
};
