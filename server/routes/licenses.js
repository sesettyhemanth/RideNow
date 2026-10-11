const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const imageUpload = require('../utils/imageUpload');
const syncVehicleStatus = require('../utils/syncVehicleStatus');
const basePublicUser = require('../utils/toPublicUser');
const withLicenseDetails = require('../utils/withLicenseDetails');
const toPublicUser = (user) => withLicenseDetails(user, basePublicUser(user));
const { verifyToken, requireAdmin } = require('../middleware/auth');

// the form now asks for the licence APPLICATION number, so accept 5-30 letters/digits/-,/ and spaces
const LICENSE_NUMBER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\-/ ]{4,29}$/;
const LICENSE_CLASSES = ['2w', '4w']; // 2w = bike / scooter, 4w = car
const PHOTO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB each
const MIN_AGE = 18;
// Indian mobile number: exactly 10 digits, starting 6-9 (entered without the +91 prefix)
const MOBILE_PATTERN = /^[6-9]\d{9}$/;

function isValidLicenseNumber(value) {
  return LICENSE_NUMBER_PATTERN.test(String(value || '').trim());
}

function parseDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isAdultDob(value) {
  const dob = parseDate(value);
  if (!dob) return false;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - MIN_AGE);
  return dob <= cutoff;
}

// runs multer for the two photo fields but answers with JSON when a file is rejected
const licenseFiles = imageUpload.fields([
  { name: 'licenseFront', maxCount: 1 },
  { name: 'licenseBack', maxCount: 1 },
]);
function receiveLicenseFiles(req, res, next) {
  licenseFiles(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Could not read those photos' });
    }
    next();
  });
}

const fail = (res, message) => res.status(400).json({ success: false, message });

router.post('/upload', verifyToken, receiveLicenseFiles, async (req, res) => {
  try {
    const { fullName, dob, licenseNumber, issueDate, validityDate, address } = req.body;
    // accept "9876543210", "+91 98765 43210" or "919876543210" and keep only the 10 digits
    const mobileDigits = String(req.body.mobile || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    const front = req.files?.licenseFront?.[0];
    const back = req.files?.licenseBack?.[0];
    const classes = [
      ...new Set(
        String(req.body.licenseClasses || '')
          .split(',')
          .map((c) => c.trim().toLowerCase())
          .filter(Boolean)
      ),
    ];

    if (!String(fullName || '').trim()) return fail(res, 'Full name is required');
    if (!dob || !isAdultDob(dob)) return fail(res, `Enter a valid date of birth (you must be at least ${MIN_AGE})`);
    if (!MOBILE_PATTERN.test(mobileDigits)) {
      return fail(res, 'Enter a valid 10-digit mobile number (+91)');
    }
    if (!licenseNumber || !isValidLicenseNumber(licenseNumber)) {
      return fail(res, 'Enter a valid licence application number (5-30 letters, digits, - or /)');
    }
    if (classes.length === 0 || !classes.every((c) => LICENSE_CLASSES.includes(c))) {
      return fail(res, 'Choose 2-wheeler, 4-wheeler or both');
    }

    const issued = parseDate(issueDate);
    const validUntil = parseDate(validityDate);
    if (!issued || issued > new Date()) return fail(res, 'Enter a valid licence issue date');
    if (!validUntil || validUntil <= issued) return fail(res, 'Validity date must be after the issue date');
    if (validUntil <= new Date()) return fail(res, 'This licence has already expired');

    if (String(address || '').trim().length < 10) return fail(res, 'Enter your full address');

    if (!front || !back) return fail(res, 'Upload both the front and the back of your licence');
    for (const file of [front, back]) {
      if (!PHOTO_TYPES.includes(file.mimetype)) return fail(res, 'Use PNG, JPG or WEBP photos');
      if (file.size > MAX_PHOTO_BYTES) return fail(res, 'Each photo must be under 5 MB');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.licenseFullName = String(fullName).trim();
    user.licenseDob = new Date(dob);
    user.licenseMobile = `+91${mobileDigits}`;
    user.licenseNumber = String(licenseNumber).trim().toUpperCase();
    user.licenseClasses = classes;
    user.licenseIssueDate = issued;
    user.licenseValidUntil = validUntil;
    user.licenseAddress = String(address).trim();
    user.licenseImage = { data: front.buffer, contentType: front.mimetype };
    user.licenseBackImage = { data: back.buffer, contentType: back.mimetype };
    user.licenseSubmittedAt = new Date();
    user.licenseStatus = 'pending'; // an admin must review it - never auto-verified
    await user.save();

    res.json({
      success: true,
      message: 'Licence submitted! It is now waiting for admin verification.',
      data: toPublicUser(user),
    });
  } catch (err) {
    console.error('License upload error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong submitting your licence' });
  }
});

// the signed-in user's own licence record (details + status, never the photo bytes)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Something went wrong fetching your licence' });
  }
});

router.get('/', verifyToken, requireAdmin, async (req, res) => {
  const submissions = await User.find({ licenseStatus: { $ne: 'not_submitted' } }).select(
    'name email licenseNumber licenseFullName licenseDob licenseMobile licenseClasses licenseIssueDate licenseValidUntil licenseAddress licenseStatus licenseSubmittedAt createdAt'
  );

  res.json({ success: true, data: submissions });
});

router.put('/:userId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be verified or rejected' });
    }

    const existing = await User.findById(req.params.userId).select('licenseStatus');
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (existing.licenseStatus === 'not_submitted') {
      return res.status(400).json({ success: false, message: 'This user has not submitted a license' });
    }

    const user = await User.findByIdAndUpdate(req.params.userId, { licenseStatus: status }, { new: true });

    const waiting = await Booking.find({ user: user._id, status: 'pending' }).select('vehicleId');
    if (waiting.length > 0) {
      await Booking.updateMany(
        { user: user._id, status: 'pending' },
        { status: status === 'verified' ? 'confirmed' : 'cancelled' }
      );
      if (status === 'rejected') {
        const vehicleIds = [...new Set(waiting.map((b) => b.vehicleId))];
        await Promise.all(vehicleIds.map((id) => syncVehicleStatus(id)));
      }
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        licenseNumber: user.licenseNumber,
        licenseStatus: user.licenseStatus,
        updatedBookings: waiting.length,
      },
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.error('License review error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong updating this license' });
  }
});

module.exports = router;