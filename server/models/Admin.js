const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const imageSchema = require('./imageSchema');

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    // profile details edited on the admin Settings page
    name: { type: String, trim: true, default: 'Administrator' },
    phone: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },

    profileImage: { type: imageSchema, select: false },
    hasProfileImage: { type: Boolean, default: false },
    profileImageUpdatedAt: { type: Date },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);