const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { authMiddleware } = require('../middleware/auth');

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0;
    res.json({ reviews, averageRating, totalReviews: reviews.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add review
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    const existingReview = await Review.findOne({
      productId,
      userId: req.userId
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      productId,
      userId: req.userId,
      userName: req.user.name,
      rating,
      comment,
    });
    
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update review
router.put('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;