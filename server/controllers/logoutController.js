const User = require('../data/User');

exports.logout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // No content

  const refreshToken = cookies.jwt;
  // Clear refreshToken in DB
  const user = await User.findOne({ refreshToken });
  if (user) {
    user.refreshToken = '';
    await user.save();
  }

  // Clear cookie with same flags
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict'
  });
  res.sendStatus(204);
};