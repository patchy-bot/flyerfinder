// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const verifyJWT = require('./middleware/verifyJWT');

const app = express();

// SECURITY: Use Helmet to set secure HTTP headers
app.use(helmet());

// SECURITY: Only allow trusted origins, enable credentials over HTTPS
const allowedOrigins = process.env.CORS_ORIGINS.split(',');
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(cookieParser());

// Public routes
app.use('/api/login', require('./routes/login'));
app.use('/api/register', require('./routes/register'));

// Protected routes
app.use('/api/refresh', require('./routes/refresh'));
app.use(verifyJWT);  // JWT middleware applied here
app.use('/api/flyer', require('./routes/flyer'));
app.use('/api/filter', require('./routes/api/filter'));
app.use('/api/logout', require('./routes/logout'));
app.use('/api/image', require('./routes/image'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));