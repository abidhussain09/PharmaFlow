const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {createSale, getSaleReceipt, getAllSales} = require('../controllers/salesController');

// All sales routes require authentication
router.use(authenticateToken);

// POST /api/sales → create new sale
router.post('/', createSale);

// GET /api/sales → get all sales with pagination and filters
router.get('/', getAllSales);

// GET /api/sales/:id/receipt → generate PDF receipt
router.get('/:id/receipt', getSaleReceipt);

module.exports = router;
