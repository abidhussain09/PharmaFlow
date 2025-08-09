const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { generateReceiptPDF } = require('../services/pdfService');

exports.createSale = async (req, res) => {
  try {
    const { customerInfo, products } = req.body;
    const retailerId = req.retailer.id; // Get from authenticated token

    // Find or create customer
    let customer = await Customer.findOne({
      name: customerInfo.name,
      phone: customerInfo.phone,
      retailerId,
    });

    if (!customer) {
      customer = new Customer({ ...customerInfo, retailerId });
      await customer.save();
    }

    // Calculate total and add cost prices
    let totalAmount = 0;
    const productsWithCost = [];

    for (let p of products) {
      totalAmount += p.quantity * p.price;

      // Get the product to fetch cost price
      const productData = await Product.findById(p.product);
      if (!productData) {
        return res.status(400).json({ message: `Product ${p.product} not found` });
      }

      productsWithCost.push({
        product: p.product,
        quantity: p.quantity,
        price: p.price, // Selling price
        costPrice: productData.price // Cost price from product
      });
    }

    // Create Sale
    const sale = new Sale({
      customer: customer._id,
      products: productsWithCost,
      totalAmount,
      retailerId
    });
    await sale.save();

    // Subtract product quantity
    for (let p of products) {
      await Product.findByIdAndUpdate(p.product, { $inc: { quantity: -p.quantity } });
    }

    res.status(201).json({ message: 'Sale recorded', sale });
  } catch (err) {
    res.status(500).json({ message: 'Sale creation failed', error: err.message });
  }
};


exports.getSaleReceipt = async (req, res) => {
  try {
    const retailerId = req.retailer.id;
    const sale = await Sale.findOne({ _id: req.params.id, retailerId })
      .populate('products.product')
      .populate('customer');

    if (!sale) return res.status(404).json({ message: 'Sale not found' });

    generateReceiptPDF(sale, sale.customer, res);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate receipt', error: err.message });
  }
};

// Get all sales for the authenticated retailer
exports.getAllSales = async (req, res) => {
  try {
    const retailerId = req.retailer.id;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    let filter = { retailerId };

    // Add date range filter if provided
    if (startDate && endDate) {
      filter.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sales = await Sale.find(filter)
      .populate('customer', 'name email phone')
      .populate('products.product', 'name')
      .sort({ saleDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Sale.countDocuments(filter);

    res.json({
      sales,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sales', error: err.message });
  }
};
