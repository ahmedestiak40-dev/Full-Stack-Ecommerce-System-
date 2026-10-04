const mongoose = require('mongoose');

const flashSaleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 90,
    },
    salePrice: Number,
    maxQuantity: Number,
    soldCount: {
      type: Number,
      default: 0,
    },
  }],
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('FlashSale', flashSaleSchema);