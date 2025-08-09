const Customer = require('../models/Customer');
const Sale = require('../models/Sale');

exports.getCustomersByRetailer = async (req, res) => {
  try {
    const retailerId = req.retailer.id; // Get from authenticated token
    const { search } = req.query;

    let filter = { retailerId };

    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch customers', error: err.message });
  }
};

// Get customer order history
exports.getCustomerOrderHistory = async (req, res) => {
  try {
    const { customerId } = req.params;
    const retailerId = req.retailer.id;

    // Verify customer belongs to this retailer
    const customer = await Customer.findOne({ _id: customerId, retailerId });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const orders = await Sale.find({ customer: customerId, retailerId })
      .populate('products.product', 'name')
      .sort({ saleDate: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order history', error: err.message });
  }
};

// Create or update customer
exports.createOrUpdateCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const retailerId = req.retailer.id;

    // Check if customer already exists
    let customer = await Customer.findOne({
      $or: [{ email }, { phone }],
      retailerId
    });

    if (customer) {
      // Update existing customer
      customer.name = name;
      customer.email = email;
      customer.phone = phone;
      customer.address = address;
      await customer.save();
    } else {
      // Create new customer
      customer = new Customer({ name, email, phone, address, retailerId });
      await customer.save();
    }

    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create/update customer', error: err.message });
  }
};
