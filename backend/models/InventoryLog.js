const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  action: {
    type: String,
    enum: ['stock_in', 'stock_out', 'adjustment', 'order_deduct', 'return'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  previousStock: Number,
  newStock: Number,
  reason: String,
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);