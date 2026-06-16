const app = require('./app');
const config = require('./config/env');

const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${config.env} mode`);
});
