const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middleware/auth');

// Process payment
router.post('/process', authMiddleware, async (req, res) => {
  try {
    const { orderId, paymentMethod, cardDetails } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Generate unique transaction ID
    const transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Simulate payment processing
    const payment = new Payment({
      orderId,
      userId: req.userId,
      amount: order.totalAmount,
      paymentMethod,
      transactionId,
      cardDetails: cardDetails ? {
        last4: cardDetails.last4,
        cardType: cardDetails.cardType,
      } : null,
      paymentStatus: 'completed',
    });
    
    await payment.save();
    
    // Update order status
    order.status = 'confirmed';
    order.paymentId = payment._id;
    await order.save();
    
    // Create notification
    const notification = new Notification({
      userId: req.userId,
      type: 'payment',
      title: 'Payment Successful',
      message: `Your payment of $${order.totalAmount} for order #${order._id.toString().slice(-8)} has been confirmed.`,
      data: { orderId, paymentId: payment._id },
    });
    await notification.save();
    
    res.json({
      success: true,
      payment,
      transactionId,
      message: 'Payment processed successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment status
router.get('/status/:orderId', authMiddleware, async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;