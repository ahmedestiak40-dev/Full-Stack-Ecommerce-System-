const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/sales', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    let groupBy;
    
    switch(period) {
      case 'day':
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'week':
        groupBy = { $week: '$createdAt' };
        break;
      case 'month':
        groupBy = { $month: '$createdAt' };
        break;
      case 'year':
        groupBy = { $year: '$createdAt' };
        break;
      default:
        groupBy = { $month: '$createdAt' };
    }
    
    const salesData = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(salesData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/products/top', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);
    
    const productsWithDetails = await Promise.all(
      topProducts.map(async (p) => {
        const product = await Product.findById(p._id);
        return { ...p, stock: product?.stock || 0 };
      })
    );
    
    res.json(productsWithDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/customers', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const customerStats = await Order.aggregate([
      {
        $group: {
          _id: '$customerEmail',
          name: { $first: '$customerName' },
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          lastOrder: { $max: '$createdAt' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 20 }
    ]);
    
    res.json(customerStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;