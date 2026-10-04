import React, { useState, useEffect } from 'react';

const OrderTracker = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const steps = ['pending', 'confirmed', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  if (loading) return <div className="spinner">Loading order details...</div>;
  if (!order) return null;

  const currentStep = getStatusStep(order.status);
  const steps = [
    { name: 'Order Placed', status: 'pending' },
    { name: 'Confirmed', status: 'confirmed' },
    { name: 'Shipped', status: 'shipped' },
    { name: 'Delivered', status: 'delivered' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal order-tracker" onClick={(e) => e.stopPropagation()}>
        <h2>Order Tracking</h2>
        <p>Order ID: {order._id}</p>
        <p>Total: ${order.totalAmount?.toFixed(2)}</p>
        
        <div className="tracking-steps">
          {steps.map((step, index) => (
            <div key={step.name} className={`step ${index <= currentStep ? 'active' : ''}`}>
              <div className="step-circle">{index + 1}</div>
              <div className="step-name">{step.name}</div>
              {index < steps.length - 1 && <div className="step-line"></div>}
            </div>
          ))}
        </div>

        <div className="order-items">
          <h3>Items</h3>
          {order.items?.map((item, idx) => (
            <div key={idx} className="order-item">
              <span>{item.name}</span>
              <span>Qty: {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default OrderTracker;