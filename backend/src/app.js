const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const scanRoutes = require('./routes/scan.routes');
const authRoutes = require('./routes/auth.routes');

const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));




app.use('/api/v1/scans', scanRoutes);
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/employees', require('./routes/employee.routes'));
app.use('/api/v1/rates', require('./routes/rate.routes'));



app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});


app.use(errorHandler);

module.exports = app;
