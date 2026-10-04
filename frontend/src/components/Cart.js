import React from 'react';

const Cart = ({ cart, isOpen, onClose, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <button className="close-cart" onClick={onClose}>✕</button>
      </div>
      
      <div className="cart-items">
        {cart.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Your cart is empty</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">${item.price.toFixed(2)}</div>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button 
                    className="quantity-btn"
                    onClick={() => onRemoveItem(item.id)}
                    style={{ marginLeft: 'auto' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {cart.length > 0 && (
        <div className="cart-total">
          <h3>Total: ${total.toFixed(2)}</h3>
          <button className="btn checkout-btn" onClick={onCheckout}>
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;