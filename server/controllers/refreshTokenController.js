const jwt = require('jsonwebtoken');
const User = require('../data/User');

exports.refreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);

  const refreshToken = cookies.jwt;
  const user = await User.findOne({ refreshToken });
  if (!user) return res.sendStatus(403); // Forbidden

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err || decoded.username !== user.username) {
        return res.sendStatus(403);
      }
      // Rotate refresh token
      const newRefreshToken = jwt.sign(
        { username: user.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );
      user.refreshToken = newRefreshToken;
      await user.save();

      const accessToken = jwt.sign(
        { UserInfo: { username: user.username, roles: user.roles } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );
      res.cookie('jwt', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      res.json({ accessToken });
    }
  );
};