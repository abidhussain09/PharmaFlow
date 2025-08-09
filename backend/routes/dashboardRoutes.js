const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getDashboardAnalytics,
  getRecentSales,
  getSalesSummary
} = require('../controllers/dashboardController');

// All dashboard routes require authentication
router.use(authenticateToken);

// GET /api/dashboard/analytics?period=1month|6months|1year
router.get('/analytics', getDashboardAnalytics);

// GET /api/dashboard/recent-sales?limit=10
router.get('/recent-sales', getRecentSales);

// GET /api/dashboard/sales-summary?startDate=2024-01-01&endDate=2024-12-31
router.get('/sales-summary', getSalesSummary);

module.exports = router;
