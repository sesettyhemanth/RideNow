const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

async function syncVehicleStatus(vehicleId) {
  if (!vehicleId) return;
  try {
    const activeBookings = await Booking.countDocuments({
      vehicleId: String(vehicleId),
      status: { $in: ['pending', 'confirmed', 'picked_up'] },
    });

    if (activeBookings > 0) {
      await Vehicle.updateOne({ _id: vehicleId, status: 'available' }, { status: 'booked' });
    } else {
      await Vehicle.updateOne({ _id: vehicleId, status: 'booked' }, { status: 'available' });
    }
  } catch (err) {
    // a bad vehicle id or a vehicle that no longer exists must never break the booking itself
    console.error('Could not sync vehicle status:', err.message);
  }
}

module.exports = syncVehicleStatus;