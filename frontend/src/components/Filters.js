import React, { useState } from 'react';

const Filters = ({ categories, onFilterChange }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    applyFilters(category, priceRange, sortBy);
  };

  const handlePriceChange = (type, value) => {
    const newRange = { ...priceRange, [type]: value };
    setPriceRange(newRange);
    applyFilters(selectedCategory, newRange, sortBy);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    applyFilters(selectedCategory, priceRange, sort);
  };

  const applyFilters = (category, price, sort) => {
    onFilterChange({
      category: category === 'all' ? null : category,
      minPrice: price.min || null,
      maxPrice: price.max || null,
      sort,
    });
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
    onFilterChange({ category: null, minPrice: null, maxPrice: null, sort: 'newest' });
  };

  return (
    <div className="filters-sidebar">
      <div className="filter-section">
        <h3>Categories</h3>
        <div className="category-list">
          <button
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('all')}
          >
            All Products
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Price Range</h3>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => handlePriceChange('min', e.target.value)}
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => handlePriceChange('max', e.target.value)}
          />
        </div>
      </div>

      <div className="filter-section">
        <h3>Sort By</h3>
        <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
        </select>
      </div>

      <button className="clear-filters-btn" onClick={clearFilters}>
        Clear All Filters
      </button>
    </div>
  );
};

export default Filters;