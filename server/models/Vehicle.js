const mongoose = require('mongoose');
const imageSchema = require('./imageSchema');

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vehicle name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['bike', 'scooter', 'car'],
      required: true,
    },

    // shown in the admin "Manage Vehicles" table
    brand: { type: String, trim: true, default: '' },
    numberPlate: { type: String, trim: true, uppercase: true, default: '' },

    images: {
      type: [imageSchema],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'A vehicle can have at most 5 photos',
      },
      default: [],
    },

    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: 0,
    },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    trips: { type: Number, default: 0 },
    cc: { type: String, default: '' },
    mileage: { type: String, default: '' },
    gears: { type: String, default: '' },
    seats: { type: Number, default: 2 },
    fuel: { type: String, enum: ['Petrol', 'Diesel', 'Electric'], default: 'Petrol' },
    transmission: { type: String, enum: ['Manual', 'Automatic'], default: 'Manual' },
    location: { type: String, default: 'Visakhapatnam, Andhra Pradesh' },
    about: { type: String, default: '' },
    features: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['available', 'booked', 'maintenance'],
      default: 'available',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.imageCount = ret.images ? ret.images.length : 0;
        delete ret._id;
        delete ret.__v;
        delete ret.images;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
