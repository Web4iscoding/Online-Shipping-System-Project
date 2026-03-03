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
  useLocation,
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

import { useEffect, useState } from "react";
import { apiCall } from "./api";
import RegisterSelection from "./components/auth/RegisterSelection";
import MyOrders from "./components/auth/customer/MyOrders";
import CustomerAccountDetails from "./components/auth/customer/CustomerAccountDetails";
import Catalog from "./components/auth/vendor/Catalog";
import Orders from "./components/auth/vendor/Orders";
import Discounts from "./components/auth/vendor/Discounts";
import CreateDiscount from "./components/auth/vendor/CreateDiscount";
import ShippedOrders from "./components/auth/vendor/ShippedOrders";
import StoreDetails from "./components/auth/vendor/StoreDetails";
import HomePage from "./components/HomePage";
import Footer from "./components/Footer";
import Cart from "./components/cart/Cart";
import Order from "./components/auth/customer/Order";
import CatalogDetails from "./components/auth/vendor/CatalogDetails";
import VendorOrderDetails from "./components/auth/vendor/VendorOrderDetails";
import Checkout from "./components/cart/Checkout";
import CustomerOrderDetails from "./components/auth/customer/CustomerOrderDetails";
import VendorAccountDetails from "./components/auth/vendor/VendorAccountDetails";
import ScrollToTop from "./components/common/ScrollToTop";
import SearchModal from "./components/modals/SearchModal";
import ModalBackdrop from "./components/common/ModalBackdrop";
import Store from "./components/products/Store";
import WriteReview from "./components/auth/customer/WriteReview";
import AllReviews from "./components/products/AllReviews";
import Wishlist from "./components/auth/customer/Wishlist";
import PurchaseComplete from "./components/cart/PurchaseComplete";
import AllCategories from "./components/products/AllCategories";
import AllBrands from "./components/products/AllBrands";

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setShowSearchModal(false);
  }, [pathname]);

  return (
    <div className="app">
      <Navigation setShowSearchModal={setShowSearchModal} />
      {showSearchModal && (
        <SearchModal onClose={() => setShowSearchModal(false)} />
      )}
      {showSearchModal && (
        <ModalBackdrop onClose={() => setShowSearchModal(false)} />
      )}

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
          <Route
            path="/customer/account-details"
            element={<CustomerAccountDetails />}
          />
          <Route
            path="/vendor/account-details"
            element={<VendorAccountDetails />}
          />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/discounts" element={<Discounts />} />
          <Route path="/create-discount/:productId" element={<CreateDiscount />} />
          <Route path="/shipped-orders" element={<ShippedOrders />} />
          <Route path="/store-details" element={<StoreDetails />} />
          <Route path="/product-list/:filter" element={<ProductList />} />
          <Route path="/product-list/:type/:name" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="/order/:id" element={<Order />} />
          <Route path="/catalog-details/:id" element={<CatalogDetails />} />
          <Route
            path="/vendor/order-details/:id"
            element={<VendorOrderDetails />}
          />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/customer/order-details/:id"
            element={<CustomerOrderDetails />}
          />
          <Route path="/store/:id" element={<Store />} />
          <Route path="/product/:id/reviews" element={<AllReviews />} />
          <Route path="/review/:productId/:orderItemId" element={<WriteReview />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/purchase-complete" element={<PurchaseComplete />} />
          <Route path="/all-categories" element={<AllCategories />} />
          <Route path="/all-brands" element={<AllBrands />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
