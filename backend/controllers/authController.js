const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Retailer = require('../models/Retailer');
const { sendOTPEmail } = require('../utils/emailService');

// POST /api/auth/signup
exports.signup = async (req, res) => {
  const { shopName, email, password } = req.body;

  try {
    const existing = await Retailer.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = uuidv4().split('-')[0];
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const retailer = new Retailer({ shopName, email, password: hashedPassword, otp, otpExpiresAt });
    await retailer.save();

    try {
      await sendOTPEmail(email, otp, shopName);
      res.status(201).json({ message: 'Signup successful. Please verify OTP sent to your email.' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(201).json({
        message: 'Signup successful. However, email sending failed. Your OTP is: ' + otp,
        otp: otp // For development only
      });
    }
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const retailer = await Retailer.findOne({ email });
    if (!retailer) return res.status(404).json({ message: 'Retailer not found' });

    if (retailer.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (retailer.otp !== otp || retailer.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    retailer.isEmailVerified = true;
    retailer.otp = null;
    retailer.otpExpiresAt = null;
    await retailer.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const retailer = await Retailer.findOne({ email });
    if (!retailer) return res.status(404).json({ message: 'Retailer not found' });

    if (!retailer.isEmailVerified) {
      return res.status(401).json({ message: 'Email not verified' });
    }

    const isMatch = await bcrypt.compare(password, retailer.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: retailer._id, shopName: retailer.shopName, email: retailer.email },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );

    res.status(200).json({ token, shopName: retailer.shopName });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Check Auth
exports.checkAuth = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const retailer = await Retailer.findById(decoded.id);

    if (!retailer) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check if guest session has expired
    if (retailer.isGuest) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (retailer.createdAt < oneHourAgo) {
        return res.status(401).json({ message: 'Guest session expired' });
      }
    }

    res.status(200).json({
      token,
      shopName: retailer.shopName,
      isGuest: retailer.isGuest || false
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Guest Signup (no email verification)
const guestSignup = async (req, res) => {
  try {
    const { shopName, email, password } = req.body;

    // Check if user already exists
    const existingRetailer = await Retailer.findOne({ email });
    if (existingRetailer) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create retailer with guest flag
    const retailer = new Retailer({
      shopName,
      email,
      password: hashedPassword,
      isEmailVerified: true, // Auto-verify for guest accounts
      isGuest: true, // Mark as guest account
    });

    await retailer.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: retailer._id, shopName: retailer.shopName, email: retailer.email },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );

    res.status(201).json({
      message: 'Guest account created successfully',
      token,
      shopName: retailer.shopName,
      isGuest: true,
    });
  } catch (error) {
    console.error('Guest signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Guest Cleanup (delete all guest data)
exports.guestCleanup = async (req, res) => {
  try {
    const userId = req.retailer.id;
    const user = await Retailer.findById(userId);

    if (!user || !user.isGuest) {
      return res.status(400).json({ message: 'Not a guest account' });
    }

    // Import models for cleanup (we'll need to create these)
    const Product = require('../models/Product');
    const Sale = require('../models/Sale');

    // Delete all data associated with this guest user
    await Promise.all([
      Product.deleteMany({ retailer: userId }),
      Sale.deleteMany({ retailerId: userId }),
      // Add other models as needed (Customer, etc.)
    ]);

    // Delete the guest user account
    await Retailer.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Guest data cleaned up successfully' });
  } catch (error) {
    console.error('Guest cleanup error:', error);
    res.status(500).json({ message: 'Server error during cleanup' });
  }
};

// Auto-cleanup expired guest accounts (to be called by a cron job)
const cleanupExpiredGuests = async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Find expired guest accounts
    const expiredGuests = await Retailer.find({
      isGuest: true,
      createdAt: { $lt: oneHourAgo }
    });

    // Import models for cleanup
    const Product = require('../models/Product');
    const Sale = require('../models/Sale');

    for (const guest of expiredGuests) {
      // Delete all data associated with this guest user
      await Promise.all([
        Product.deleteMany({ retailer: guest._id }),
        Sale.deleteMany({ retailerId: guest._id }),
        // Add other models as needed (Customer, etc.)
      ]);

      // Delete the guest user account
      await Retailer.findByIdAndDelete(guest._id);
    }

    console.log(`Cleaned up ${expiredGuests.length} expired guest accounts`);
    return expiredGuests.length;
  } catch (error) {
    console.error('Auto-cleanup error:', error);
    return 0;
  }
};

module.exports = {
  signup: exports.signup,
  verifyOTP: exports.verifyOTP,
  login: exports.login,
  checkAuth: exports.checkAuth,
  guestSignup,
  guestCleanup: exports.guestCleanup,
  cleanupExpiredGuests
};
