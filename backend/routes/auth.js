const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/guest-signup', authController.guestSignup);
router.post('/guest-cleanup', authenticateToken, authController.guestCleanup);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', authController.login);
router.get('/check', authController.checkAuth);

module.exports = router;
