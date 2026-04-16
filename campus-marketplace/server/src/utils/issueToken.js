const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

function issueToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
}

module.exports = issueToken;
