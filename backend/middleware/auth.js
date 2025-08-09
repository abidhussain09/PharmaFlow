const jwt = require('jsonwebtoken');
const Retailer = require('../models/Retailer');

// Middleware to verify JWT token and extract retailer info
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify retailer still exists and is verified (or is a guest)
    const retailer = await Retailer.findById(decoded.id);
    if (!retailer || (!retailer.isEmailVerified && !retailer.isGuest)) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Add retailer info to request object
    req.retailer = {
      id: decoded.id,
      shopName: decoded.shopName,
      email: decoded.email
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};

module.exports = { authenticateToken };
