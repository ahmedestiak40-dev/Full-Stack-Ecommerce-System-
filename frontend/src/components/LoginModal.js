import React, { useState } from 'react';

const LoginModal = ({ isOpen, onClose, onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validate inputs
    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }
    
    if (!isLogin && !formData.name) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }
    
    try {
      if (isLogin) {
        await onLogin(formData.email, formData.password);
      } else {
        await onRegister(formData.name, formData.email, formData.password);
      }
      // Close modal on success
      onClose();
      // Reset form
      setFormData({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isLogin ? 'Login' : 'Create Account'}</h2>
          <button className="close-modal" onClick={onClose}>✕</button>
        </div>
        
        {error && <div className="error-message" style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              minLength="6"
            />
          </div>
          
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
          
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ name: '', email: '', password: '' });
            }}
            style={{ marginTop: '0.5rem', width: '100%' }}
          >
            {isLogin ? 'Create New Account' : 'Already Have an Account? Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;