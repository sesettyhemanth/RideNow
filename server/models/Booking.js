const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true },
    vehicleName: { type: String, required: true },
    vehicleType: { type: String, enum: ['bike', 'scooter', 'car'], required: true },

    pickupLocation: { type: String, required: true },
    pickupDate: { type: String, required: true },
    dropoffDate: { type: String, required: true },
    pickupTime: { type: String, default: '10:00 AM' },
    dropoffTime: { type: String, default: '10:00 AM' },
    addOns: { type: [String], default: [] },
    totalAmount: { type: Number, required: true },

    paymentMethod: { type: String, enum: ['upi', 'card', 'netbanking', 'wallet', 'razorpay', 'cod'], default: undefined },
    paymentStatus: { type: String, enum: ['success', 'pending', 'failed'], default: 'success' },
    transactionId: { type: String, default: undefined },

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userEmail: { type: String, required: true },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'picked_up', 'completed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);