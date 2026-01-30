/**
 * Main App Component
 * Sets up routing and main layout
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Navigation from './components/Navigation';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Profile from './components/auth/Profile';
import PrivateRoute from './components/PrivateRoute';
import './App.css';
import { wishlist, vendor } from './api';

// Product pages
import ProductList from './components/products/ProductList';
import ProductDetail from './components/products/ProductDetail';

// Cart and Wishlist pages
import Cart from './components/cart/Cart';
import Wishlist from './components/wishlist/Wishlist';

// Order pages (to be created)
// import OrderHistory from './components/orders/OrderHistory';
// import OrderDetail from './components/orders/OrderDetail';
// import Checkout from './components/orders/Checkout';

// Vendor pages
import VendorDashboard from './components/vendor/VendorDashboard';
import { useEffect } from 'react';
import { apiCall } from './api';

// Home page (placeholder)
const HomePage = () => (
  <div className="home-container">
    <div className="hero">
      <h1>placeholder</h1>
      <p>Your one-stop shop for quality products</p>
    </div>
  </div>
);

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="app">
      <Navigation />
      {isAuthenticated ? "authenticated" : "not authenticated"}
    </div>
  );
};

function App() {

  return (
      <AuthProvider>
        <AppContent />
      </AuthProvider>

  );
}

export default App;
