const Product = require('../models/Product');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, wholesaler, price, lowStockThreshold, quantity, category } = req.body;
    const retailer = req.retailer.id; // Get from authenticated token

    const newProduct = new Product({
      name,
      description,
      wholesaler,
      price,
      lowStockThreshold,
      quantity,
      category,
      retailer,
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
};

// Get all products for the authenticated retailer
exports.getAllProducts = async (req, res) => {
  try {
    const retailerId = req.retailer.id; // Get from authenticated token

    const products = await Product.find({ retailer: retailerId }).sort({ createdAt: -1 }); // newest first
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return updated product
    );

    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
};

// Get products with quantity lower than threshold for the authenticated retailer
exports.getLowStockProducts = async (req, res) => {
  try {
    const retailerId = req.retailer.id; // Get from authenticated token

    const lowStockProducts = await Product.find({
      retailer: retailerId,
      $expr: { $lt: ['$quantity', '$lowStockThreshold'] },
    });

    res.json(lowStockProducts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching low stock products', error: err.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
};
