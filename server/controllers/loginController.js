const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../data/User');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing credentials' });
  }
  
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Unauthorized' });

    // Create tokens
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
    
    // Store refreshToken in DB for rotation
    user.refreshToken = refreshToken;
    await user.save();

    // Set secure cookie flags
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};