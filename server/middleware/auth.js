const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Checks that a valid JWT was sent, fetches the user from DB, and attaches the full user object to req.user
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'You need to be logged in for this' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Look up user in MongoDB using any possible ID key from the token payload
    const userId = decoded.id || decoded._id || decoded.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    req.user = user; // Now req.user is the full Mongoose user document
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired, please login again' });
  }
}

// Use this after verifyToken on any route that only the admin should be able to hit
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };