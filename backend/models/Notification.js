const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['order', 'payment', 'shipping', 'promotion', 'system'],
    required: true,
  },
  title: String,
  message: String,
  isRead: {
    type: Boolean,
    default: false,
  },
  data: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);