const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Get wishlist
router.get('/', authMiddleware, async (req, res) => {
  try {
    await req.user.populate('wishlist');
    res.json(req.user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to wishlist
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!req.user.wishlist.includes(productId)) {
      req.user.wishlist.push(productId);
      await req.user.save();
    }
    await req.user.populate('wishlist');
    res.json({ message: 'Added to wishlist', wishlist: req.user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from wishlist
router.delete('/remove/:productId', authMiddleware, async (req, res) => {
  try {
    req.user.wishlist = req.user.wishlist.filter(
      id => id.toString() !== req.params.productId
    );
    await req.user.save();
    await req.user.populate('wishlist');
    res.json({ message: 'Removed from wishlist', wishlist: req.user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;