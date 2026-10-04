const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const revenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.productId');
    
    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        revenue: revenue[0]?.total || 0,
      },
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manage products
router.post('/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manage orders
router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('items.productId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manage coupons
router.post('/coupons', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/coupons', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;