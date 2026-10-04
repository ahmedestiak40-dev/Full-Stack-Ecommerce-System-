import React, { useState } from 'react';

const PaymentModal = ({ isOpen, onClose, orderId, amount, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          paymentMethod,
          cardDetails: paymentMethod.includes('card') ? {
            last4: cardDetails.number.slice(-4),
            cardType: cardDetails.number.startsWith('4') ? 'Visa' : 'Mastercard',
          } : null,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`Payment successful! Transaction ID: ${data.transactionId}`);
        onSuccess(data);
        onClose();
      } else {
        alert(data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal payment-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Payment Details</h2>
        <p>Amount to Pay: <strong>${amount.toFixed(2)}</strong></p>
        
        <form onSubmit={handlePayment}>
          <div className="form-group">
            <label>Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="cash_on_delivery">Cash on Delivery</option>
            </select>
          </div>
          
          {paymentMethod.includes('card') && (
            <>
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                  required
                  maxLength="19"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                    required
                    maxLength="4"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                  required
                />
              </div>
            </>
          )}
          
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;