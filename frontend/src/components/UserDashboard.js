import React, { useState, useEffect } from 'react';
import OrderTracker from './OrderTracker';

const UserDashboard = ({ user, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || {}
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [ordersRes, recentRes] = await Promise.all([
        fetch('http://localhost:5000/api/user/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/user/recently-viewed', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const ordersData = await ordersRes.json();
      const recentData = await recentRes.json();
      
      setOrders(ordersData);
      setRecentlyViewed(recentData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      
      if (response.ok) {
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) return <div className="spinner">Loading dashboard...</div>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal user-dashboard" onClick={(e) => e.stopPropagation()}>
        <div className="dashboard-header">
          <h2>Welcome, {user?.name}!</h2>
          <button className="close-modal" onClick={onClose}>✕</button>
        </div>
        
        <div className="dashboard-tabs">
          <button 
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            My Orders
          </button>
          <button 
            className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            Recently Viewed
          </button>
          <button 
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>
        
        <div className="dashboard-content">
          {activeTab === 'orders' && (
            <div className="orders-list">
              {orders.length === 0 ? (
                <p>No orders yet. Start shopping!</p>
              ) : (
                orders.map(order => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <span className="order-id">Order #{order._id.slice(-8)}</span>
                      <span className={`order-status ${order.status}`}>{order.status}</span>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <span>{item.name}</span>
                          <span>x{item.quantity}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-footer">
                      <strong>Total: ${order.totalAmount?.toFixed(2)}</strong>
                      <button 
                        className="btn-small"
                        onClick={() => setTrackingOrder(order._id)}
                      >
                        Track Order
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {activeTab === 'recent' && (
            <div className="recent-products">
              {recentlyViewed.length === 0 ? (
                <p>No recently viewed products</p>
              ) : (
                recentlyViewed.map(product => (
                  <div key={product._id} className="recent-product-card">
                    <img src={product.image} alt={product.name} />
                    <div>
                      <h4>{product.name}</h4>
                      <p>${product.price}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user?.email} disabled />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={profile.address?.street || ''}
                  onChange={(e) => setProfile({
                    ...profile, 
                    address: {...profile.address, street: e.target.value}
                  })}
                  placeholder="Street address"
                />
              </div>
              <button type="submit" className="btn">Update Profile</button>
            </form>
          )}
        </div>
        
        {trackingOrder && (
          <OrderTracker 
            orderId={trackingOrder}
            onClose={() => setTrackingOrder(null)}
          />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;