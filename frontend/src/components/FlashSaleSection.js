import React, { useState, useEffect } from 'react';
import FlashSaleTimer from './FlashSaleTimer';

const FlashSaleSection = ({ onAddToCart }) => {
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashSales();
  }, []);

  const fetchFlashSales = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/flashsales/active');
      const data = await response.json();
      setFlashSales(data);
    } catch (error) {
      console.error('Error fetching flash sales:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || flashSales.length === 0) return null;

  return (
    <div className="flash-sale-section">
      {flashSales.map(sale => (
        <div key={sale._id} className="flash-sale-container">
          <div className="flash-sale-header">
            <h2>⚡ {sale.name}</h2>
            <FlashSaleTimer 
              endTime={sale.endTime} 
              onEnd={fetchFlashSales}
            />
          </div>
          <p className="flash-sale-description">{sale.description}</p>
          <div className="flash-sale-products">
            {sale.products.map(product => (
              <div key={product._id} className="flash-product-card">
                <div className="discount-badge">-{product.discountPercentage}%</div>
                <img src={product.image} alt={product.name} />
                <h4>{product.name}</h4>
                <div className="pricing">
                  <span className="original-price">${product.originalPrice}</span>
                  <span className="sale-price">${product.salePrice}</span>
                </div>
                <div className="stock-info">
                  Sold: {product.soldCount} / {product.maxQuantity}
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(product.soldCount / product.maxQuantity) * 100}%` }}
                  ></div>
                </div>
                <button 
                  className="btn-flash-sale"
                  onClick={() => onAddToCart(product)}
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlashSaleSection;