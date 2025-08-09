const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number, // Selling price
      costPrice: Number, // Cost price for profit calculation
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  saleDate: {
    type: Date,
    default: Date.now,
  },
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer', 
    required: true,
  },
});

module.exports = mongoose.model('Sale', saleSchema);
