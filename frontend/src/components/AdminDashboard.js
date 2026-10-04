import React, { useState, useEffect } from 'react';

const AdminDashboard = ({ onClose }) => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [statsRes, productsRes, ordersRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/inventory', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const statsData = await statsRes.json();
      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();
      
      setStats(statsData.stats);
      setProducts(productsData.products);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId, newStock, reason) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/admin/inventory/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock: newStock, reason })
      });
      
      if (response.ok) {
        alert('Stock updated successfully');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const exportOrders = async () => {
    const token = localStorage.getItem('token');
    window.open('http://localhost:5000/api/admin/orders/export?token=' + token, '_blank');
  };

  if (loading) return <div className="spinner">Loading dashboard...</div>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal admin-dashboard" onClick={(e) => e.stopPropagation()}>
        <div className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <button className="close-modal" onClick={onClose}>✕</button>
        </div>
        
        <div className="admin-tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button className={`tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
            Inventory
          </button>
          <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            Orders
          </button>
        </div>
        
        {activeTab === 'overview' && stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>Total Users</h3>
                <p className="stat-number">{stats.totalUsers}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>Total Products</h3>
                <p className="stat-number">{stats.totalProducts}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>Revenue</h3>
                <p className="stat-number">${stats.revenue.toFixed(2)}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <h3>Low Stock</h3>
                <p className="stat-number">{stats.lowStockProducts}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>Pending Orders</h3>
                <p className="stat-number">{stats.pendingOrders}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>Today's Orders</h3>
                <p className="stat-number">{stats.todayOrders}</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'inventory' && (
          <div className="inventory-management">
            <div className="inventory-header">
              <h3>Product Inventory</h3>
              <button className="btn-small" onClick={exportOrders}>Export Orders</button>
            </div>
            <div className="inventory-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 20).map(product => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.stock}</td>
                      <td>
                        <span className={`stock-status ${product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : 'good'}`}>
                          {product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-small"
                          onClick={() => {
                            const newStock = prompt('Enter new stock quantity:', product.stock);
                            if (newStock !== null) {
                              updateStock(product._id, parseInt(newStock), 'Manual update');
                            }
                          }}
                        >
                          Update Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div className="orders-management">
            <h3>Recent Orders</h3>
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 20).map(order => (
                    <tr key={order._id}>
                      <td>#{order._id.slice(-8)}</td>
                      <td>{order.customerName}</td>
                      <td>${order.totalAmount?.toFixed(2)}</td>
                      <td>
                        <span className={`order-status ${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;