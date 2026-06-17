const os = require('os');
const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');

const PORT = config.port || 3000;
const HOST = '0.0.0.0';

function getLanAddresses() {
  const addresses = new Set(['127.0.0.1', 'localhost']);
  const interfaces = os.networkInterfaces();

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family === 'IPv4' && !entry.internal) {
        addresses.add(entry.address);
      }
    }
  }

  return [...addresses];
}

connectDB().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT} in ${config.env} mode`);
    console.log('API URLs for Expo / phone testing:');
    for (const address of getLanAddresses()) {
      console.log(`  http://${address}:${PORT}/api/v1/health`);
    }
    if (config.env === 'development') {
      console.log('Dev OTPs print here after contact-details submit.');
    }
  });
});
