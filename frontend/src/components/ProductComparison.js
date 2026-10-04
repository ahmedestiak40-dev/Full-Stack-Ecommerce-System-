import React, { useState } from 'react';

const ProductComparison = ({ products, onClose, onRemove }) => {
  if (products.length === 0) return null;

  const specs = ['name', 'price', 'category', 'stock', 'description'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal comparison-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Compare Products</h2>
        <button className="close-modal" onClick={onClose}>✕</button>
        
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                {products.map(product => (
                  <th key={product._id}>
                    {product.name}
                    <button 
                      className="remove-compare"
                      onClick={() => onRemove(product._id)}
                    >
                      ✕
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specs.map(spec => (
                <tr key={spec}>
                  <td className="spec-name">{spec.charAt(0).toUpperCase() + spec.slice(1)}</td>
                  {products.map(product => (
                    <td key={product._id}>
                      {spec === 'price' && '$'}
                      {product[spec]}
                      {spec === 'stock' && ' units'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductComparison;