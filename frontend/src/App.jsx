/**
 * Main App Component
 * Sets up routing and main layout
 */

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Navigation from "./components/Navigation";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Profile from "./components/auth/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Logout from "./components/auth/Logout";
import "./App.css";
import { wishlist, vendor } from "./api";

// Product pages
import ProductList from "./components/products/ProductList";
import ProductDetail from "./components/products/ProductDetail";


import { useEffect } from "react";
import { apiCall } from "./api";
import RegisterSelection from "./components/auth/RegisterSelection";
import MyOrders from "./components/auth/customer/MyOrders";
import AccountDetails from "./components/auth/customer/AccountDetails";
import Catalog from "./components/auth/vendor/Catalog";
import Orders from "./components/auth/vendor/Orders";
import Discounts from "./components/auth/vendor/Discounts";
import ShippedOrders from "./components/auth/vendor/ShippedOrders";
import StoreDetails from "./components/auth/vendor/StoreDetails";
import HomePage from "./components/HomePage";
import Footer from "./components/Footer";

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="app">
      <Navigation />

      <div className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register-selection" element={<RegisterSelection />} />
          <Route path="/register/:type" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/account-details" element={<AccountDetails />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/discounts" element={<Discounts />} />
          <Route path="/shipped-orders" element={<ShippedOrders />} />
          <Route path="/store-details" element={<StoreDetails />} />
          <Route path="/product-list/:filter" element={<ProductList />} />
          <Route path="/product-list/:type/:name" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
