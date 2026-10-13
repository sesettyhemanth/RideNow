// SAVE THIS AS: server/models/Admin.js  (replace the file I gave you before)
// Contains every field that routes/admin.js reads or writes.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const imageSchema = require('./imageSchema');

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // admin.js asks for it with .select('+password')
    },
    name: { type: String, trim: true, default: 'Admin' },
    phone: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },

    // profile photo (admin.js reads it with .select('+profileImage'))
    profileImage: { type: imageSchema, select: false },
    hasProfileImage: { type: Boolean, default: false },
    profileImageUpdatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);