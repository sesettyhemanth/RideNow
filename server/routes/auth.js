const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { verifyToken } = require('../middleware/auth');
const basePublicUser = require('../utils/toPublicUser');
const withLicenseDetails = require('../utils/withLicenseDetails');
// the public user plus the licence details (issue / validity date, address)
const toPublicUser = (user) => withLicenseDetails(user, basePublicUser(user));

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, phone, password });
    const token = generateToken({ id: user._id, email: user.email, role: 'user' });

    res.status(201).json({ success: true, message: 'Account created', token, data: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Something went wrong creating your account' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // password has `select: false` on the schema, so we have to ask for it explicitly here
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken({ id: user._id, email: user.email, role: 'user' });

    res.json({ success: true, message: 'Login successful', token, data: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Something went wrong logging you in' });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Missing Google credential' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account has no email on it' });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

    if (!user) {
      // brand new account - no password, no phone number yet
      user = await User.create({ name, email, googleId });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = generateToken({ id: user._id, email: user.email, role: 'user' });

    res.json({ success: true, message: 'Login successful', token, data: toPublicUser(user) });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Could not verify that Google account' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Something went wrong fetching your account' });
  }
});

module.exports = router;
module.exports.toPublicUser = toPublicUser;