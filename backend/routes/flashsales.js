const express = require('express');
const router = express.Router();
const FlashSale = require('../models/FlashSale');
const Product = require('../models/Product');

// Get active flash sales
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const flashSales = await FlashSale.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).populate('products.productId');
    
    // Calculate remaining time and sale prices
    const salesWithDetails = flashSales.map(sale => {
      const remainingTime = sale.endTime - now;
      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (3600000)) / 60000);
      const seconds = Math.floor((remainingTime % 60000) / 1000);
      
      return {
        ...sale.toObject(),
        remainingTime: { hours, minutes, seconds },
        products: sale.products.map(p => ({
          ...p.productId.toObject(),
          salePrice: p.salePrice,
          discountPercentage: p.discountPercentage,
          originalPrice: p.productId.price,
          maxQuantity: p.maxQuantity,
          soldCount: p.soldCount,
        })),
      };
    });
    
    res.json(salesWithDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get flash sale by ID
router.get('/:id', async (req, res) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id).populate('products.productId');
    res.json(flashSale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;