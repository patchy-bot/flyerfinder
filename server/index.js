// server/index.js
const express = require('express');
const app = express();
const credentials = require('./middleware/credentials');
const verifyJWT = require('./middleware/verifyJWT');

const flyerRoutes = require('./routes/flyer');
const filterRoutes = require('./routes/api/filter');
const imageRoutes = require('./routes/image');
// ... other imports

app.use(credentials);
app.use(express.json());

// Public routes
app.use('/login', require('./routes/login'));
app.use('/refresh', require('./routes/refresh'));
app.use('/register', require('./routes/register'));

// Protected routes
app.use('/flyer', verifyJWT, flyerRoutes);
app.use('/filter', verifyJWT, filterRoutes);
app.use('/image', verifyJWT, imageRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
