const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products with search, filter, pagination
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      sort, 
      page = 1, 
      limit = 12 
    } = req.query;
    
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'name_asc':
        sortOption = { name: 1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    // Get all categories for filter
    const categories = await Product.distinct('category');
    
    res.json({
      products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalProducts: total,
      categories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by ID with related products
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get related products from same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4);
    
    res.json({ product, relatedProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const categoryCounts = await Promise.all(
      categories.map(async (category) => ({
        name: category,
        count: await Product.countDocuments({ category })
      }))
    );
    res.json(categoryCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;