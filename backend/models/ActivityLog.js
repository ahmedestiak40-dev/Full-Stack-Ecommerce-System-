const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  userEmail: String,
  action: {
    type: String,
    required: true,
  },
  entity: {
    type: String,
    enum: ['product', 'order', 'user', 'coupon', 'review', 'payment'],
  },
  entityId: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);