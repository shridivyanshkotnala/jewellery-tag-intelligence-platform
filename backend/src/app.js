const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const scanRoutes = require('./routes/scan.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));




app.use('/api/v1/scans', scanRoutes);
app.use('/api/v1/auth', authRoutes);




app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});


app.use(errorHandler);

module.exports = app;
