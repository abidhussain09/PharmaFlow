const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getCustomersByRetailer,
  getCustomerOrderHistory,
  createOrUpdateCustomer
} = require('../controllers/customerController');

// All customer routes require authentication
router.use(authenticateToken);

// GET /api/customers?search=name → get all customers of the authenticated retailer with optional search
router.get('/', getCustomersByRetailer);

// POST /api/customers → create or update customer
router.post('/', createOrUpdateCustomer);

// GET /api/customers/:customerId/orders → get customer order history
router.get('/:customerId/orders', getCustomerOrderHistory);

module.exports = router;