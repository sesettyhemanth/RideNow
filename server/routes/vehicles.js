
const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const imageUpload = require('../utils/imageUpload');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const allowedTypes = ['bike', 'scooter', 'car'];
const MAX_IMAGES_PER_VEHICLE = 5;

function isValidType(type) {
  return allowedTypes.includes(type);
}

router.get('/', async (req, res) => {
  const vehicles = await Vehicle.find();
  res.json({ success: true, data: vehicles });
});

router.get('/:type', async (req, res) => {
  const { type } = req.params;

  if (!isValidType(type)) {
    return res.status(400).json({ success: false, message: 'Invalid vehicle type' });
  }

  const vehicles = await Vehicle.find({ type });
  res.json({ success: true, data: vehicles });
});

router.get('/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  if (!isValidType(type)) {
    return res.status(400).json({ success: false, message: 'Invalid vehicle type' });
  }

  try {
    const vehicle = await Vehicle.findOne({ _id: id, type });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.json({ success: true, data: vehicle });
  } catch (err) {
    // a malformed id throws a CastError - that just means "not found" to the caller
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.status(500).json({ success: false, message: 'Something went wrong fetching the vehicle' });
  }
});

router.get('/:type/:id/images/:index', async (req, res) => {
  const { type, id, index } = req.params;

  if (!isValidType(type)) {
    return res.status(400).json({ success: false, message: 'Invalid vehicle type' });
  }

  try {
    const vehicle = await Vehicle.findOne({ _id: id, type }).select('images');
    const image = vehicle?.images?.[Number(index)];

    if (!image?.data) {
      return res.status(404).json({ success: false, message: 'No photo at that index' });
    }

    res.set('Content-Type', image.contentType);
    res.set('Cache-Control', 'public, max-age=86400'); // photos rarely change, fine to cache a day
    res.send(image.data);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.status(500).json({ success: false, message: 'Something went wrong fetching that photo' });
  }
});

router.post('/:type', verifyToken, requireAdmin, async (req, res) => {
  const { type } = req.params;

  if (!isValidType(type)) {
    return res.status(400).json({ success: false, message: 'Invalid vehicle type' });
  }

  try {
    const { images, ...safeFields } = req.body; // images never come through this route
    const vehicle = await Vehicle.create({ ...safeFields, type });
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Could not add vehicle' });
  }
});

router.put('/:type/:id', verifyToken, requireAdmin, async (req, res) => {
  const { type, id } = req.params;

  if (!isValidType(type)) {
    return res.status(400).json({ success: false, message: 'Invalid vehicle type' });
  }

  try {
    const { images, ...safeFields } = req.body; // images have their own dedicated routes below
    const vehicle = await Vehicle.findOneAndUpdate({ _id: id, type }, safeFields, {
      new: true,
      runValidators: true,
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.json({ success: true, data: vehicle });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.status(400).json({ success: false, message: err.message || 'Could not update vehicle' });
  }
});

router.put(
  '/:type/:id/images',
  verifyToken,
  requireAdmin,
  imageUpload.array('images', MAX_IMAGES_PER_VEHICLE),
  async (req, res) => {
    const { type, id } = req.params;

    if (!isValidType(type)) {
      return res.status(400).json({ success: false, message: 'Invalid vehicle type' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No photos were uploaded' });
    }

    const vehicle = await Vehicle.findOne({ _id: id, type });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const newImages = req.files.map((file) => ({ data: file.buffer, contentType: file.mimetype }));
    const combined = [...vehicle.images, ...newImages].slice(0, MAX_IMAGES_PER_VEHICLE);

    vehicle.images = combined;
    await vehicle.save();

    res.json({ success: true, message: 'Photos uploaded', data: { imageCount: combined.length } });
  }
);

router.delete('/:type/:id/images/:index', verifyToken, requireAdmin, async (req, res) => {
  const { type, id, index } = req.params;

  if (!isValidType(type)) {
    return res.status(400).json({ success: false, message: 'Invalid vehicle type' });
  }

  const vehicle = await Vehicle.findOne({ _id: id, type });
  if (!vehicle) {
    return res.status(404).json({ success: false, message: 'Vehicle not found' });
  }

  vehicle.images.splice(Number(index), 1);
  await vehicle.save();

  res.json({ success: true, message: 'Photo removed', data: { imageCount: vehicle.images.length } });
});

// DELETE /api/vehicles/:type/:id -> remove a vehicle entirely (admin only)
router.delete('/:type/:id', verifyToken, requireAdmin, async (req, res) => {
  const { type, id } = req.params;

  if (!isValidType(type)) {
    return res.status(400).json({ success: false, message: 'Invalid vehicle type' });
  }

  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: id, type });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.status(500).json({ success: false, message: 'Something went wrong deleting the vehicle' });
  }
});

module.exports = router;
