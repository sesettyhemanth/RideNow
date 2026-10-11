const jwt = require('jsonwebtoken');

// keeps the token payload shape consistent everywhere a token is issued
function generateToken({ id, email, role }) {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = generateToken;
