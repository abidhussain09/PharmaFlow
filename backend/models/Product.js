const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    wholesaler: {
      type: String,
      required: true, 
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
     lowStockThreshold: {
     type: Number,
     default: 5, 
   },
    category: {
      type: String,
      trim: true,
    },
    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Retailer',
      required: true,
    },
  },
  {
    timestamps: true, // ⏱️ adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Product', productSchema);
