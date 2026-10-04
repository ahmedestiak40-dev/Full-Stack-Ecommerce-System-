import React, { useState } from 'react';

const CouponInput = ({ cartTotal, onCouponApplied }) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to use coupons');
        return;
      }

      const response = await fetch('http://localhost:5000/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponCode, cartTotal }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setAppliedCoupon(data);
        onCouponApplied(data);
        setError('');
      } else {
        setError(data.message);
        setAppliedCoupon(null);
      }
    } catch (error) {
      setError('Error applying coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    onCouponApplied(null);
  };

  return (
    <div className="coupon-section">
      {!appliedCoupon ? (
        <div className="coupon-input">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          />
          <button onClick={handleApplyCoupon} disabled={loading} className="btn-small">
            {loading ? 'Applying...' : 'Apply'}
          </button>
        </div>
      ) : (
        <div className="applied-coupon">
          <span>Coupon applied: {appliedCoupon.coupon}</span>
          <span>Discount: ${appliedCoupon.discount.toFixed(2)}</span>
          <button onClick={handleRemoveCoupon} className="remove-coupon">✕</button>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default CouponInput;