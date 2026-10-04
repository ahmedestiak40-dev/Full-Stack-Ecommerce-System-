import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import CheckoutModal from './components/CheckoutModal';
import LoginModal from './components/LoginModal';
import OrderTracker from './components/OrderTracker';
import CouponInput from './components/CouponInput';
import ProductReviews from './components/ProductReviews';
import SearchBar from './components/SearchBar';
import Filters from './components/Filters';
import Pagination from './components/Pagination';
import UserDashboard from './components/UserDashboard';
import ProductComparison from './components/ProductComparison';
import FlashSaleSection from './components/FlashSaleSection';
import MultiStepCheckout from './components/MultiStepCheckout';
import InvoiceModal from './components/InvoiceModal';
import PaymentModal from './components/PaymentModal';
import AdminDashboard from './components/AdminDashboard';
import BlogSection from './components/BlogSection';
import SupportChat from './components/SupportChat';
import './styles/global.css';
import './styles/features.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(null);
  const [showInvoice, setShowInvoice] = useState(null);
  const [showPayment, setShowPayment] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: null,
    minPrice: null,
    maxPrice: null,
    sort: 'newest'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0
  });

  // Fetch products with filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/products?page=${pagination.currentPage}&limit=12`;
      
      if (searchQuery) url += `&search=${searchQuery}`;
      if (filters.category) url += `&category=${filters.category}`;
      if (filters.minPrice) url += `&minPrice=${filters.minPrice}`;
      if (filters.maxPrice) url += `&maxPrice=${filters.maxPrice}`;
      if (filters.sort) url += `&sort=${filters.sort}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data.products || []);
      setPagination({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        totalProducts: data.totalProducts || 0
      });
      
      if (data.categories && categories.length === 0) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, searchQuery, filters.category, filters.minPrice, filters.maxPrice, filters.sort]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/products/categories/all`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Fetch wishlist
  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setWishlist(data.map(p => p._id));
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  }, []);

  // Check authentication
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          // Check if user is admin
          if (userData.role === 'admin') {
            setIsAdmin(true);
          }
          fetchWishlist();
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
      }
    }
  }, [fetchWishlist]);

  // Load cart from storage
  const loadCartFromStorage = useCallback(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
        setCart([]);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchProducts();
    loadCartFromStorage();
    checkAuth();
  }, [fetchProducts, fetchCategories, loadCartFromStorage, checkAuth]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add to compare
  const addToCompare = (product) => {
    if (compareList.length >= 4) {
      alert('You can compare up to 4 products only');
      return;
    }
    if (compareList.find(p => p._id === product._id)) {
      alert('Product already in comparison list');
      return;
    }
    setCompareList([...compareList, product]);
    alert('Product added to comparison');
  };

  // Remove from compare
  const removeFromCompare = (productId) => {
    setCompareList(compareList.filter(p => p._id !== productId));
    if (compareList.length === 1) setIsCompareOpen(false);
  };

  // Add to recently viewed
  const addToRecentlyViewed = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      await fetch(`${API_URL}/user/recently-viewed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  };

  // Handle product click
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    addToRecentlyViewed(product._id);
  };

  // Handle login
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        if (data.user.role === 'admin') {
          setIsAdmin(true);
        }
        await fetchWishlist();
        alert('Login successful!');
        return Promise.resolve();
      } else {
        alert(data.message || 'Login failed');
        return Promise.reject(new Error(data.message));
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Network error. Make sure backend is running on port 5000');
      return Promise.reject(error);
    }
  };

  // Handle register
  const handleRegister = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        alert('Registration successful!');
        return Promise.resolve();
      } else {
        alert(data.message || 'Registration failed');
        return Promise.reject(new Error(data.message));
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Network error. Make sure backend is running on port 5000');
      return Promise.reject(error);
    }
  };

  // Handle multi-step checkout
  const handleMultiStepCheckout = async (formData) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    
    const orderItems = cart.map(item => ({
      productId: item.id,
      quantity: item.quantity,
    }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerAddress: `${formData.address.street}, ${formData.address.city}, ${formData.address.state} ${formData.address.zipCode}, ${formData.address.country}`,
          items: orderItems,
          totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        }),
      });

      if (response.ok) {
        const order = await response.json();
        setCompletedOrder(order);
        setShowPayment(true);
        setCart([]);
        localStorage.removeItem('cart');
        setIsCheckoutOpen(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setWishlist([]);
    setIsAdmin(false);
    alert('Logged out successfully');
  };

  // Add to cart
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product._id);
      let newCart;
      if (existingItem) {
        newCart = prevCart.map(item =>
          item.id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prevCart, {
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        }];
      }
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  // Update cart quantity
  const updateCartQuantity = (id, quantity) => {
    if (quantity < 1) return;
    const newCart = cart.map(item =>
      item.id === id ? { ...item, quantity: quantity } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  // Remove from cart
  const removeFromCart = (id) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  // Toggle wishlist
  const toggleWishlist = async (productId) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    const token = localStorage.getItem('token');
    const isInWishlist = wishlist.includes(productId);

    try {
      if (isInWishlist) {
        await fetch(`${API_URL}/wishlist/remove/${productId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setWishlist(wishlist.filter(id => id !== productId));
      } else {
        await fetch(`${API_URL}/wishlist/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        });
        setWishlist([...wishlist, productId]);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Error updating wishlist');
    }
  };

  // Handle checkout
  const handleCheckout = async (customerInfo) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const orderItems = cart.map(item => ({
      productId: item.id,
      quantity: item.quantity,
    }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName: customerInfo.customerName,
          customerEmail: customerInfo.customerEmail,
          customerAddress: customerInfo.customerAddress,
          items: orderItems,
          totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        }),
      });

      if (response.ok) {
        const order = await response.json();
        alert(`Order placed successfully! Order ID: ${order._id}`);
        setCart([]);
        localStorage.removeItem('cart');
        setCouponDiscount(null);
        setIsCheckoutOpen(false);
        setTrackingOrder(order._id);
        fetchProducts();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = couponDiscount ? couponDiscount.finalTotal : cartTotal;

  if (loading && products.length === 0) {
    return <div className="spinner">Loading amazing products...</div>;
  }

  const categoryNames = categories.map(c => typeof c === 'object' ? c.name : c);

  return (
    <div className="app">
      <Navbar 
        cartCount={cartCount} 
        user={user}
        isAdmin={isAdmin}
        onCartClick={() => setIsCartOpen(true)}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onDashboardClick={() => setIsDashboardOpen(true)}
        onAdminClick={() => setIsAdminOpen(true)}
      />
      
      {/* Flash Sale Section */}
      <FlashSaleSection onAddToCart={addToCart} />
      
      <div className="main-container">
        <aside className="sidebar">
          <Filters 
            categories={categoryNames}
            onFilterChange={handleFilterChange}
          />
        </aside>
        
        <main className="main-content">
          <div className="search-section">
            <SearchBar onSearch={handleSearch} />
            {compareList.length > 0 && (
              <button 
                className="compare-btn"
                onClick={() => setIsCompareOpen(true)}
              >
                Compare ({compareList.length})
              </button>
            )}
          </div>
          
          <div className="results-info">
            <p>Found {pagination.totalProducts} products</p>
          </div>
          
          <div className="products-grid">
            {products.length === 0 ? (
              <div className="no-products">No products found. Try adjusting your filters.</div>
            ) : (
              products.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  isWishlisted={wishlist.includes(product._id)}
                  onViewDetails={() => handleProductClick(product)}
                  onCompare={() => addToCompare(product)}
                />
              ))
            )}
          </div>
          
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </main>
      </div>

      {/* Blog Section */}
      <BlogSection />

      {/* Cart Sidebar */}
      <Cart
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Multi-step Checkout */}
      {isCheckoutOpen && (
        <MultiStepCheckout
          cart={cart}
          total={cartTotal}
          onComplete={handleMultiStepCheckout}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}

      {/* Regular Checkout Modal (fallback) */}
      <CheckoutModal
        isOpen={false}
        onClose={() => setIsCheckoutOpen(false)}
        onSubmit={handleCheckout}
        total={finalTotal}
        subtotal={cartTotal}
        couponDiscount={couponDiscount}
      >
        <CouponInput 
          cartTotal={cartTotal}
          onCouponApplied={setCouponDiscount}
        />
      </CheckoutModal>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Order Tracker */}
      {trackingOrder && (
        <OrderTracker 
          orderId={trackingOrder}
          onClose={() => setTrackingOrder(null)}
        />
      )}

      {/* User Dashboard */}
      {isDashboardOpen && user && (
        <UserDashboard 
          user={user}
          onClose={() => setIsDashboardOpen(false)}
        />
      )}

      {/* Admin Dashboard */}
      {isAdminOpen && isAdmin && (
        <AdminDashboard onClose={() => setIsAdminOpen(false)} />
      )}

      {/* Product Comparison */}
      {isCompareOpen && compareList.length > 0 && (
        <ProductComparison
          products={compareList}
          onClose={() => setIsCompareOpen(false)}
          onRemove={removeFromCompare}
        />
      )}

      {/* Payment Modal */}
      {showPayment && completedOrder && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => {
            setShowPayment(false);
            setShowInvoice(true);
          }}
          orderId={completedOrder._id}
          amount={completedOrder.totalAmount}
          onSuccess={(payment) => {
            console.log('Payment successful:', payment);
            setShowPayment(false);
            setShowInvoice(true);
          }}
        />
      )}

      {/* Invoice Modal */}
      {showInvoice && completedOrder && (
        <InvoiceModal
          order={completedOrder}
          onClose={() => {
            setShowInvoice(false);
            setCompletedOrder(null);
            alert('Order placed successfully! Check your email for confirmation.');
            fetchProducts();
          }}
        />
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal product-details" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedProduct(null)}>✕</button>
            <img src={selectedProduct.image} alt={selectedProduct.name} />
            <h2>{selectedProduct.name}</h2>
            <p>{selectedProduct.description}</p>
            <p className="price">${selectedProduct.price.toFixed(2)}</p>
            <p>Stock: {selectedProduct.stock} units</p>
            <button 
              className="btn" 
              onClick={() => {
                addToCart(selectedProduct);
                setSelectedProduct(null);
              }}
              disabled={selectedProduct.stock === 0}
            >
              {selectedProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <ProductReviews 
              productId={selectedProduct._id}
              userId={user?._id}
              onReviewAdded={() => {}}
            />
          </div>
        </div>
      )}

      {/* Support Chat */}
      <SupportChat />
    </div>
  );
}

export default App;