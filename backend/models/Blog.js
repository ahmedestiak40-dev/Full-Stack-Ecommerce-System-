const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  excerpt: String,
  content: {
    type: String,
    required: true,
  },
  featuredImage: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  category: String,
  tags: [String],
  views: {
    type: Number,
    default: 0,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    comment: String,
    createdAt: { type: Date, default: Date.now },
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  publishedAt: Date,
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Blog', blogSchema);