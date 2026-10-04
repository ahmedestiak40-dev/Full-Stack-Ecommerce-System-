import React from 'react';
import NotificationBell from './NotificationBell';

const Navbar = ({ cartCount, user, isAdmin, onCartClick, onLoginClick, onLogout, onDashboardClick, onAdminClick }) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="logo" onClick={() => window.location.reload()}>
          🛍️ ShopEase
        </div>
        <div className="nav-right">
          {user && <NotificationBell />}
          {user && (
            <>
              {isAdmin && (
                <button className="admin-btn" onClick={onAdminClick}>
                  👑 Admin
                </button>
              )}
              <span className="user-name" onClick={onDashboardClick} style={{ cursor: 'pointer' }}>
                👋 {user.name}
              </span>
              <div className="cart-icon" onClick={onCartClick}>
                🛒
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </div>
              <button className="logout-btn" onClick={onLogout}>Logout</button>
            </>
          )}
          {!user && (
            <>
              <div className="cart-icon" onClick={onCartClick}>
                🛒
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </div>
              <button className="login-btn" onClick={onLoginClick}>Login</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;