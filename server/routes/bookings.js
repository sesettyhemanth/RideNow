// Booking routes - now backed by MongoDB instead of a JSON file.
const express = require('express');
const router = express.Router();

const ACTIVE_STATUSES = ['pending', 'confirmed', 'picked_up'];
const Booking = require('../models/Booking');
const User = require('../models/User');
const syncVehicleStatus = require('../utils/syncVehicleStatus');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/', verifyToken, requireAdmin, async (req, res) => {
  const bookings = await Booking.find().populate('user', 'name').sort({ createdAt: -1 });
  res.json({ success: true, data: bookings });
});

router.get('/mine', verifyToken, async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: bookings });
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      vehicleId,
      vehicleName,
      vehicleType,
      pickupLocation,
      pickupDate,
      dropoffDate,
      pickupTime,
      dropoffTime,
      addOns,
      totalAmount,
      paymentMethod,
      transactionId,
    } = req.body;

    if (!vehicleId || !pickupDate || !dropoffDate) {
      return res.status(400).json({ success: false, message: 'Missing required booking details' });
    }

    const activeBooking = await Booking.exists({
      user: req.user.id,
      status: { $in: ACTIVE_STATUSES },
    });
    if (activeBooking) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active booking. You can book another vehicle once it is completed.',
      });
    }

    const renter = await User.findById(req.user.id).select('licenseStatus licenseClasses');
    if (!renter || !['pending', 'verified'].includes(renter.licenseStatus)) {
      return res.status(403).json({
        success: false,
        message: 'Please submit your driving license before booking a vehicle',
      });
    }

    const neededClass = vehicleType === 'car' ? '4w' : '2w';
    if (renter.licenseClasses?.length && !renter.licenseClasses.includes(neededClass)) {
      return res.status(403).json({
        success: false,
        message: `Your license does not cover ${neededClass === '4w' ? '4-wheelers (cars)' : '2-wheelers (bikes & scooters)'}`,
      });
    }

    const booking = await Booking.create({
      vehicleId,
      vehicleName,
      vehicleType,
      pickupLocation,
      pickupDate,
      dropoffDate,
      pickupTime: pickupTime || '10:00 AM',
      dropoffTime: dropoffTime || '10:00 AM',
      addOns: addOns || [],
      totalAmount,
      paymentMethod,
      // cash on delivery is collected later, so it is not a successful payment yet
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'success',
      transactionId,
      status: renter.licenseStatus === 'verified' ? 'confirmed' : 'pending',
      user: req.user.id,
      userEmail: req.user.email,
    });

    await syncVehicleStatus(booking.vehicleId);

    res.status(201).json({
      success: true,
      message: booking.status === 'pending' ? 'Booking received - waiting for license verification' : 'Booking confirmed',
      data: booking,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Something went wrong confirming your booking' });
  }
});

router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'name email phone licenseStatus');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(500).json({ success: false, message: 'Something went wrong fetching this booking' });
  }
});

router.put('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'confirmed', 'picked_up', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'licenseStatus');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (['confirmed', 'picked_up'].includes(status) && booking.user && booking.user.licenseStatus !== 'verified') {
      return res.status(400).json({
        success: false,
        message: "Verify the renter's driving license on the Users page first",
      });
    }

    booking.status = status;
    await booking.save();

    await syncVehicleStatus(booking.vehicleId);

    res.json({ success: true, data: { ...booking.toObject(), user: booking.user?._id || booking.user } });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(500).json({ success: false, message: 'Something went wrong updating this booking' });
  }
});

module.exports = router;