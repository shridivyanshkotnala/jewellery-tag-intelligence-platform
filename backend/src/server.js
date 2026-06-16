const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');

const PORT = config.port || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${config.env} mode`);
  });
});
