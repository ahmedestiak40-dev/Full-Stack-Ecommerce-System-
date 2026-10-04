import React from 'react';

const ProductCard = ({ product, onAddToCart, onToggleWishlist, isWishlisted, onViewDetails, onCompare }) => {
  return (
    <div className="product-card">
      <button 
        className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(product._id);
        }}
      >
        {isWishlisted ? '❤️' : '🤍'}
      </button>
      <button 
        className="compare-btn-card"
        onClick={(e) => {
          e.stopPropagation();
          onCompare(product);
        }}
      >
        📊 Compare
      </button>
      <img 
        src={product.image} 
        alt={product.name} 
        className="product-image"
        onClick={onViewDetails}
        style={{ cursor: 'pointer' }}
      />
      <div className="product-info">
        <h3 className="product-name" onClick={onViewDetails} style={{ cursor: 'pointer' }}>
          {product.name}
        </h3>
        <p className="product-description">{product.description.substring(0, 80)}...</p>
        <div className="product-price">${product.price.toFixed(2)}</div>
        <button 
          className="btn" 
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;