const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const InventoryLog = require('../models/InventoryLog');
const ActivityLog = require('../models/ActivityLog');
const Blog = require('../models/Blog');
const SupportTicket = require('../models/SupportTicket');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Dashboard Stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - 7));
    const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenue,
      lowStockProducts,
      pendingOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      topProducts,
      topCategories,
      recentActivities
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Product.find({ stock: { $lt: 10 } }).countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.name', totalSold: { $sum: '$items.quantity' } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
      ]),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      ActivityLog.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'name email')
    ]);

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        revenue: revenue[0]?.total || 0,
        lowStockProducts,
        pendingOrders,
        todayOrders,
        weekOrders,
        monthOrders,
      },
      topProducts,
      topCategories,
      recentActivities,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Inventory Management
router.get('/inventory', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const products = await Product.find().sort({ stock: 1 });
    const lowStock = products.filter(p => p.stock < 10);
    const outOfStock = products.filter(p => p.stock === 0);
    
    res.json({
      products,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/inventory/:productId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { stock, reason } = req.body;
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const previousStock = product.stock;
    product.stock = stock;
    await product.save();
    
    // Log inventory change
    const inventoryLog = new InventoryLog({
      productId: product._id,
      action: 'adjustment',
      quantity: stock - previousStock,
      previousStock,
      newStock: stock,
      reason,
      performedBy: req.userId,
    });
    await inventoryLog.save();
    
    res.json({ message: 'Stock updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk Product Operations
router.post('/products/bulk', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { action, productIds, data } = req.body;
    
    let result;
    switch (action) {
      case 'delete':
        result = await Product.deleteMany({ _id: { $in: productIds } });
        break;
      case 'update-stock':
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { $inc: { stock: data.stockChange } }
        );
        break;
      case 'update-price':
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { $mul: { price: data.priceMultiplier } }
        );
        break;
      case 'update-category':
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { category: data.category }
        );
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
    
    res.json({ message: 'Bulk operation completed', result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Order Export
router.get('/orders/export', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.productId')
      .sort({ createdAt: -1 });
    
    const csv = [
      ['Order ID', 'Customer', 'Email', 'Total', 'Status', 'Date', 'Items'].join(','),
      ...orders.map(order => [
        order._id,
        `"${order.customerName}"`,
        order.customerEmail,
        order.totalAmount,
        order.status,
        order.createdAt.toISOString(),
        `"${order.items.map(i => `${i.name}(${i.quantity})`).join(', ')}"`
      ].join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Blog Management
router.get('/blogs', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).populate('author', 'name');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/blogs', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const blog = new Blog({
      ...req.body,
      author: req.userId,
      slug: req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    });
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Support Tickets
router.get('/tickets', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/tickets/:ticketId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, message } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    if (status) ticket.status = status;
    if (message) {
      ticket.messages.push({
        senderId: req.userId,
        senderName: req.user.name,
        message,
      });
    }
    
    if (status === 'resolved') ticket.resolvedAt = new Date();
    await ticket.save();
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Activity Logs
router.get('/activities', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { limit = 50, entity, action } = req.query;
    const query = {};
    if (entity) query.entity = entity;
    if (action) query.action = action;
    
    const activities = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'name email');
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Log activity helper function
const logActivity = async (userId, userEmail, action, entity, entityId, details, req) => {
  const activity = new ActivityLog({
    userId,
    userEmail,
    action,
    entity,
    entityId,
    details,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });
  await activity.save();
};

module.exports = router;