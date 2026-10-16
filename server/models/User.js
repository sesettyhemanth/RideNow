// SAVE THIS AS: server/models/User.js  (replace the old file)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const imageSchema = require('./imageSchema');
const licenseFields = require('./licenseFields');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [
        function phoneRequired() {
          return !this.googleId;
        },
        'Phone number is required',
      ],
      trim: true,
      default: null,
    },
    password: {
      type: String,
      // a Google account never sets a password - there's nothing to hash or compare
      required: [
        function passwordRequired() {
          return !this.googleId;
        },
        'Password is required',
      ],
      minlength: 6,
      select: false, // never return the password hash unless explicitly asked for
    },

    // set only for accounts created through "Continue with Google"
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // extra profile details, editable from the Profile Detail tab
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', null],
      default: null,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 300, // also holds the licence address, so it needs more room than a city name
      default: null,
    },

    profileImage: {
      type: imageSchema,
      default: null,
    },

    licenseNumber: {
      type: String,
      default: null,
    },
    licenseFullName: { type: String, trim: true, default: null },
    licenseDob: { type: Date, default: null },
    licenseMobile: { type: String, trim: true, default: null },
    licenseClasses: { type: [{ type: String, enum: ['2w', '4w'] }], default: [] },
    licenseImage: {
      type: imageSchema,
      default: null,
    },
    licenseBackImage: {
      type: imageSchema,
      default: null,
    },
    licenseSubmittedAt: { type: Date, default: null },
    licenseStatus: {
      type: String,
      // 'pending' = uploaded, waiting for an admin to verify or reject it
      enum: ['not_submitted', 'pending', 'verified', 'rejected'],
      default: 'not_submitted',
    },

    // issue date, valid-until date and address (these were missing from the schema,
    // so Mongoose was silently dropping them before)
    ...licenseFields,

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  if (!this.password) return Promise.resolve(false); // Google accounts have no password to compare
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);