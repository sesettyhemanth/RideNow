// SAVE THIS AS: server/middleware/auth.js  (replace the old file)
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Admin tokens load the Admin account, normal tokens load the User account.
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'You need to be logged in for this' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired, please login again' });
  }

  try {
    const id = decoded.id || decoded._id;

    if (decoded.role === 'admin') {
      // Explicitly find admin, handling select: false fields if any are triggered
      const admin = await Admin.findById(id).select('+password +profileImage');
      if (!admin) {
        return res.status(401).json({ success: false, message: 'Admin account not found, please login again' });
      }
      req.user = { id: String(admin._id), _id: admin._id, email: admin.email, role: 'admin' };
      req.role = 'admin';
    } else {
      const user = await User.findById(id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Account not found, please login again' });
      }
      req.user = user;
      req.role = 'user';
    }

    next();
  } catch (err) {
    console.error('verifyToken error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not verify your login' });
  }
}

function requireAdmin(req, res, next) {
  if (req.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };