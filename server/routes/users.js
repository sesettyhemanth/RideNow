
const express = require('express');
const router = express.Router();

const User = require('../models/User');
const imageUpload = require('../utils/imageUpload');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const toPublicUser = require('../utils/toPublicUser');

router.put('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, phone, dateOfBirth, gender, location } = req.body;

    if (name !== undefined) {
      const cleanName = String(name).trim();
      if (!cleanName) {
        return res.status(400).json({ success: false, message: 'Name cannot be empty' });
      }
      user.name = cleanName;
    }

    if (phone !== undefined) {
      const cleanPhone = String(phone).trim();
      if (!cleanPhone && !user.googleId) {
        return res.status(400).json({ success: false, message: 'Phone number cannot be empty' });
      }
      if (cleanPhone && !/^\+?[0-9\s-]{7,15}$/.test(cleanPhone)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid phone number' });
      }
      user.phone = cleanPhone || null;
    }

    if (dateOfBirth !== undefined) {
      if (!dateOfBirth) {
        user.dateOfBirth = null;
      } else {
        const dob = new Date(dateOfBirth);
        if (Number.isNaN(dob.getTime()) || dob > new Date()) {
          return res.status(400).json({ success: false, message: 'Please enter a valid date of birth' });
        }
        user.dateOfBirth = dob;
      }
    }

    if (gender !== undefined) {
      if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
        return res.status(400).json({ success: false, message: 'Invalid gender value' });
      }
      user.gender = gender || null;
    }

    if (location !== undefined) {
      const cleanLocation = String(location).trim();
      if (cleanLocation.length > 100) {
        return res.status(400).json({ success: false, message: 'Location is too long' });
      }
      user.location = cleanLocation || null;
    }

    // save() (not findByIdAndUpdate) so the schema's validators run with the real document
    await user.save();

    res.json({ success: true, message: 'Profile updated', data: toPublicUser(user) });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

router.put(
  '/me/avatar',
  verifyToken,
  imageUpload.single('avatar'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file was uploaded'
        });
      }

      const userId = req.user.id || req.user._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in token'
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          profileImage: {
            data: req.file.buffer,
            contentType: req.file.mimetype
          }
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile photo updated',
        data: {
          hasProfileImage: Boolean(user.profileImage)
        }
      });
    } catch (error) {
      console.error('Upload profile photo error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to upload profile photo'
      });
    }
  }
);

router.get('/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('profileImage');

    if (!user?.profileImage?.data) {
      return res.status(404).json({
        success: false,
        message: 'No profile photo set'
      });
    }

    res.set('Content-Type', user.profileImage.contentType);
    res.send(user.profileImage.data);
  } catch (error) {
    console.error('Get profile photo error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to get profile photo'
    });
  }
});

function sendLicensePhoto(field) {
  return async (req, res) => {
    try {
      const isOwner = String(req.user.id) === req.params.id;
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not allowed to view this' });
      }

      const user = await User.findById(req.params.id).select(field);
      const image = user?.[field];

      if (!image?.data) {
        return res.status(404).json({ success: false, message: 'No license photo on file' });
      }

      res.set('Content-Type', image.contentType);
      res.set('Cache-Control', 'no-store');
      res.send(image.data);
    } catch (error) {
      console.error('Get license photo error:', error);
      res.status(500).json({ success: false, message: 'Failed to get license photo' });
    }
  };
}

router.get('/:id/license-photo', verifyToken, sendLicensePhoto('licenseImage'));
router.get('/:id/license-photo/back', verifyToken, sendLicensePhoto('licenseBackImage'));

router.get('/me/favorites', verifyToken, async (req, res) => {
  try {
    // Support both possible token formats
    const userId = req.user.id || req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token'
      });
    }

    const user = await User.findById(userId).populate('favorites');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.favorites || []
    });
  } catch (error) {
    console.error('Get favorites error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to get favorites'
    });
  }
});

router.put(
  '/me/favorites/:vehicleId',
  verifyToken,
  async (req, res) => {
    try {
      const userId = req.user.id || req.user._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in token'
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: {
            favorites: req.params.vehicleId
          }
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Added to favorites'
      });
    } catch (error) {
      console.error('Add favorite error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to add favorite'
      });
    }
  }
);

router.delete(
  '/me/favorites/:vehicleId',
  verifyToken,
  async (req, res) => {
    try {
      const userId = req.user.id || req.user._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in token'
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          $pull: {
            favorites: req.params.vehicleId
          }
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Removed from favorites'
      });
    } catch (error) {
      console.error('Remove favorite error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to remove favorite'
      });
    }
  }
);

router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select(
        'name email phone licenseStatus licenseNumber licenseFullName licenseDob licenseMobile licenseClasses licenseSubmittedAt licenseImage.contentType licenseBackImage.contentType googleId createdAt'
      )
      .sort({ createdAt: -1 });

    const shaped = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      licenseStatus: user.licenseStatus,
      licenseNumber: user.licenseNumber,
      licenseFullName: user.licenseFullName,
      licenseDob: user.licenseDob,
      licenseMobile: user.licenseMobile,
      licenseClasses: user.licenseClasses || [],
      licenseSubmittedAt: user.licenseSubmittedAt,
      hasLicenseImage: Boolean(user.licenseImage?.contentType),
      hasLicenseBackImage: Boolean(user.licenseBackImage?.contentType),
      isGoogleAccount: Boolean(user.googleId),
      createdAt: user.createdAt
    }));

    res.json({
      success: true,
      data: shaped
    });
  } catch (error) {
    console.error('Get users error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User account deleted'
    });
  } catch (error) {
    console.error('Delete user error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});


module.exports = router;