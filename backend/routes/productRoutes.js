const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  createProduct,
  getAllProducts,
  getLowStockProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

// All product routes require authentication
router.use(authenticateToken);

// Create new product
router.post('/', createProduct);

// Get low stock products — place before :id route!
router.get('/low-stock', getLowStockProducts);

// Get all products
router.get('/', getAllProducts);

// Get a single product by ID
router.get('/:id', getProductById);

// Update a product
router.put('/:id', updateProduct);

// Delete a product
router.delete('/:id', deleteProduct);

module.exports = router;
