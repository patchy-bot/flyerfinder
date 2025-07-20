const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const verifyJWT = require('./middleware/verifyJWT');
const credentials = require('./middleware/credentials');

const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const refreshRouter = require('./routes/refresh');
const logoutRouter = require('./routes/logout');
const flyerRouter = require('./routes/flyer');
const filterRouter = require('./routes/api/filter');
const imageRouter = require('./routes/image');

const app = express();

// Security middleware
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(credentials());

// Rate limiter for auth endpoints
defineAuthLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests, please try again later.' });
app.use('/api/login', defineAuthLimiter);
app.use('/api/register', defineAuthLimiter);

// Public routes
app.use('/api/login', loginRouter);
app.use('/api/register', registerRouter);
app.use('/api/refresh', refreshRouter);

// Protected routes - require JWT
app.use(verifyJWT);
app.use('/api/logout', logoutRouter);
app.use('/api/flyer', flyerRouter);
app.use('/api/filter', filterRouter);
app.use('/api/image', imageRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

module.exports = app;