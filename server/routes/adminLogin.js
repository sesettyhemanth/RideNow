// SAVE THIS AS: server/routes/adminLogin.js  (a NEW file, so your existing admin.js is not touched)
// Then in server/index.js (or app.js) add, BEFORE your other /api/admin routes:
//   app.use('/api/admin', require('./routes/adminLogin'));
const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');

    // 401 here is what lets the login page fall through to the normal user login
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // role: 'admin' is what makes verifyToken load the Admin account
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      token,
      admin: { id: String(admin._id), email: admin.email },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Admin login failed' });
  }
});

module.exports = router;