import React, { useState, useEffect } from 'react';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'order': return '📦';
      case 'payment': return '💰';
      case 'shipping': return '🚚';
      case 'promotion': return '🎉';
      default: return '🔔';
    }
  };

  return (
    <div className="notification-bell">
      <button onClick={() => setIsOpen(!isOpen)} className="bell-btn">
        🔔 {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      </button>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read">
                Mark all as read
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">No notifications</p>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif._id} 
                  className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                  onClick={() => markAsRead(notif._id)}
                >
                  <div className="notification-icon">{getIcon(notif.type)}</div>
                  <div className="notification-content">
                    <div className="notification-title">{notif.title}</div>
                    <div className="notification-message">{notif.message}</div>
                    <div className="notification-time">
                      {new Date(notif.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;