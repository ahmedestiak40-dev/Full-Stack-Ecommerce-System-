const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Get user orders
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ customerEmail: req.user.email })
      .sort({ createdAt: -1 })
      .populate('items.productId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/orders/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      customerEmail: req.user.email
    }).populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    if (address) req.user.address = address;
    await req.user.save();
    res.json({ message: 'Profile updated', user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to recently viewed
router.post('/recently-viewed', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!req.user.recentlyViewed) {
      req.user.recentlyViewed = [];
    }
    
    // Remove if already exists
    req.user.recentlyViewed = req.user.recentlyViewed.filter(
      id => id.toString() !== productId
    );
    
    // Add to beginning
    req.user.recentlyViewed.unshift(productId);
    
    // Keep only last 10
    if (req.user.recentlyViewed.length > 10) {
      req.user.recentlyViewed = req.user.recentlyViewed.slice(0, 10);
    }
    
    await req.user.save();
    res.json({ message: 'Added to recently viewed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recently viewed products
router.get('/recently-viewed', authMiddleware, async (req, res) => {
  try {
    await req.user.populate('recentlyViewed');
    res.json(req.user.recentlyViewed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;