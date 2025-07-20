// server/controllers/loginController.js
const User = require('../data/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function handleLogin(req, res) {
  const { username, password } = req.body;
  if (!username || typeof username !== 'string' || username.length > 50) {
    return res.status(400).json({ error: 'Invalid username' });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Invalid password' });
  }

  const user = await User.findOne({ username }).exec();
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ISSUE_TOKEN: shorter-lived access token, httpOnly cookie for refresh
  const accessToken = jwt.sign(
    { UserInfo: { username: user.username, roles: user.roles } },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { username: user.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  // Secure cookie flags
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ accessToken });
}

module.exports = { handleLogin };