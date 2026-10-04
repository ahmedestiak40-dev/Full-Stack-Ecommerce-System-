import React, { useState } from 'react';

const CheckoutModal = ({ isOpen, onClose, onSubmit, total }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerAddress: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Checkout</h2>
        <h3>Total Amount: ${total.toFixed(2)}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              required
              rows="3"
              value={formData.customerAddress}
              onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
            />
          </div>
          <button type="submit" className="btn">Place Order</button>
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ marginTop: '0.5rem' }}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;