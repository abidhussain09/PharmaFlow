const mongoose = require('mongoose');

const retailerSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isGuest: {
    type: Boolean,
    default: false,
  },
  otp: String,
  otpExpiresAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Retailer', retailerSchema);
