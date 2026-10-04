import React, { useState } from 'react';

const MultiStepCheckout = ({ cart, total, onComplete, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    shippingMethod: 'standard',
    paymentMethod: 'credit_card',
  });

  const handleNext = () => {
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  const shippingCost = {
    standard: 5.99,
    express: 12.99,
    overnight: 24.99,
  };

  const finalTotal = total + shippingCost[formData.shippingMethod];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal checkout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="checkout-steps">
          <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>
            <span>1</span> Shipping
          </div>
          <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>
            <span>2</span> Payment
          </div>
          <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>
            <span>3</span> Review
          </div>
        </div>

        {step === 1 && (
          <div className="checkout-step">
            <h3>Shipping Information</h3>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                required
                value={formData.customerPhone}
                onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Street Address *</label>
              <input
                type="text"
                required
                value={formData.address.street}
                onChange={(e) => setFormData({
                  ...formData,
                  address: {...formData.address, street: e.target.value}
                })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  required
                  value={formData.address.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: {...formData.address, city: e.target.value}
                  })}
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  required
                  value={formData.address.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: {...formData.address, state: e.target.value}
                  })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ZIP Code *</label>
                <input
                  type="text"
                  required
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: {...formData.address, zipCode: e.target.value}
                  })}
                />
              </div>
              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  required
                  value={formData.address.country}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: {...formData.address, country: e.target.value}
                  })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Shipping Method</label>
              <select
                value={formData.shippingMethod}
                onChange={(e) => setFormData({...formData, shippingMethod: e.target.value})}
              >
                <option value="standard">Standard Shipping - $5.99 (3-5 days)</option>
                <option value="express">Express Shipping - $12.99 (1-2 days)</option>
                <option value="overnight">Overnight Shipping - $24.99 (Next day)</option>
              </select>
            </div>
            <button onClick={handleNext} className="btn">Continue to Payment</button>
          </div>
        )}

        {step === 2 && (
          <div className="checkout-step">
            <h3>Payment Method</h3>
            <div className="payment-methods">
              <label className="payment-option">
                <input
                  type="radio"
                  value="credit_card"
                  checked={formData.paymentMethod === 'credit_card'}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                />
                <span>💳 Credit/Debit Card</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  value="paypal"
                  checked={formData.paymentMethod === 'paypal'}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                />
                <span>💰 PayPal</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  value="cash_on_delivery"
                  checked={formData.paymentMethod === 'cash_on_delivery'}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                />
                <span>💵 Cash on Delivery</span>
              </label>
            </div>
            <div className="order-summary">
              <h4>Order Summary</h4>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>${shippingCost[formData.shippingMethod].toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="step-buttons">
              <button onClick={handleBack} className="btn-secondary">Back</button>
              <button onClick={handleNext} className="btn">Review Order</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="checkout-step">
            <h3>Review Your Order</h3>
            <div className="review-section">
              <h4>Shipping Information</h4>
              <p>{formData.customerName}</p>
              <p>{formData.customerEmail}</p>
              <p>{formData.customerPhone}</p>
              <p>{formData.address.street}</p>
              <p>{formData.address.city}, {formData.address.state} {formData.address.zipCode}</p>
              <p>{formData.address.country}</p>
            </div>
            <div className="review-section">
              <h4>Order Items</h4>
              {cart.map(item => (
                <div key={item.id} className="review-item">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping ({formData.shippingMethod}):</span>
                <span>${shippingCost[formData.shippingMethod].toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="step-buttons">
              <button onClick={handleBack} className="btn-secondary">Back</button>
              <button onClick={handleSubmit} className="btn">Place Order</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiStepCheckout;