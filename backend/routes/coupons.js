const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { authMiddleware } = require('../middleware/auth');

// Validate coupon
router.post('/validate', authMiddleware, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon' });
    }
    
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }
    
    if (cartTotal < coupon.minPurchase) {
      return res.status(400).json({ 
        message: `Minimum purchase of $${coupon.minPurchase} required` 
      });
    }
    
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }
    
    res.json({
      valid: true,
      discount,
      finalTotal: cartTotal - discount,
      coupon: coupon.code,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;