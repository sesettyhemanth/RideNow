
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');
const imageUpload = require('../utils/imageUpload');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const MIN_PASSWORD_LENGTH = 8;
const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2 MB
const PHOTO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

// what the frontend is allowed to see - never the password hash
function toPublicAdmin(admin) {
  return {
    id: admin._id,
    email: admin.email,
    name: admin.name,
    phone: admin.phone,
    location: admin.location,
    createdAt: admin.createdAt,
    hasProfileImage: Boolean(admin.hasProfileImage),
    // changes whenever the photo changes, so the frontend knows when to reload it
    imageVersion: admin.profileImageUpdatedAt ? new Date(admin.profileImageUpdatedAt).getTime() : 0,
  };
}

// runs the multer upload but answers with JSON (not an HTML error page) when the file is rejected
function receivePhoto(req, res, next) {
  imageUpload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Could not read that photo' });
    }
    next();
  });
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = generateToken({ id: admin._id, email: admin.email, role: 'admin' });

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: toPublicAdmin(admin),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Something went wrong logging you in' });
  }
});

router.get('/me', verifyToken, requireAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    res.json({ success: true, data: toPublicAdmin(admin) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Something went wrong fetching your account' });
  }
});

router.put('/profile', verifyToken, requireAdmin, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const phone = String(req.body.phone || '').trim();
    const location = String(req.body.location || '').trim();

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address' });
    }
    if (phone && !/^[+\d][\d\s-]{6,}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Enter a valid phone number' });
    }

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    if (email !== admin.email) {
      const taken = await Admin.findOne({ email, _id: { $ne: admin._id } });
      if (taken) {
        return res.status(409).json({ success: false, message: 'Another admin already uses this email' });
      }
    }

    admin.name = name;
    admin.email = email;
    admin.phone = phone;
    admin.location = location;
    await admin.save();

    // the token carries the email, so hand back a fresh one that matches the saved data
    const token = generateToken({ id: admin._id, email: admin.email, role: 'admin' });

    res.json({ success: true, message: 'Profile updated', token, data: toPublicAdmin(admin) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Another admin already uses this email' });
    }
    res.status(500).json({ success: false, message: 'Something went wrong saving your profile' });
  }
});

router.put('/password', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }
    if (String(newPassword).length < MIN_PASSWORD_LENGTH) {
      return res
        .status(400)
        .json({ success: false, message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const admin = await Admin.findById(req.user.id).select('+password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    if (!(await admin.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password must differ from the current one' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Something went wrong updating your password' });
  }
});

router.get('/profile-image', verifyToken, requireAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('+profileImage');
    const image = admin?.profileImage;

    if (!image?.data) {
      return res.status(404).json({ success: false, message: 'No profile photo yet' });
    }

    const bytes = Buffer.isBuffer(image.data) ? image.data : Buffer.from(image.data.buffer || image.data);

    res.set('Content-Type', image.contentType || 'image/jpeg');
    res.set('Cache-Control', 'no-store');
    res.send(bytes);
  } catch (err) {
    console.error('Could not load admin profile photo:', err.message);
    res.status(500).json({ success: false, message: 'Something went wrong fetching your photo' });
  }
});

router.put('/profile-image', verifyToken, requireAdmin, receivePhoto, async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No photo was uploaded' });
    }
    if (!PHOTO_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Use a PNG, JPG or WEBP photo' });
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return res.status(400).json({ success: false, message: 'Photo must be under 2 MB' });
    }

    const admin = await Admin.findByIdAndUpdate(
      req.user.id,
      {
        profileImage: { data: file.buffer, contentType: file.mimetype },
        hasProfileImage: true,
        profileImageUpdatedAt: new Date(),
      },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    res.json({ success: true, message: 'Profile photo updated', data: toPublicAdmin(admin) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Something went wrong saving your photo' });
  }
});

router.delete('/profile-image', verifyToken, requireAdmin, async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.user.id,
      { $unset: { profileImage: 1 }, $set: { hasProfileImage: false, profileImageUpdatedAt: new Date() } },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    res.json({ success: true, message: 'Profile photo removed', data: toPublicAdmin(admin) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Something went wrong removing your photo' });
  }
});

module.exports = router;