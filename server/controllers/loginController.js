const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../data/User');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '15m';

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  try {
    const user = await User.findOne({ username }).exec();
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const payload = { sub: user._id, roles: user.roles };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    // Set HTTP-only, Secure cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { login };