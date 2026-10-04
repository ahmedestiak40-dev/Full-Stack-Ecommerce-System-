const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  },
  messages: [{
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: String,
    message: String,
    attachments: [String],
    createdAt: { type: Date, default: Date.now },
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolvedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

supportTicketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    this.ticketNumber = 'TKT' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);