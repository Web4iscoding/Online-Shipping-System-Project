/**
 * Navigation Component
 * Main navigation bar with links and user menu
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "../styles/Navigation.css";
import {
  BellIcon,
  SearchIcon,
  HeartIcon,
  AccountIcon,
  CartIcon,
} from "../assets/icons";

export const Navigation = () => {
  const { isAuthenticated, user, logout, isVendor } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" style={{ textDecoration: "none" }}>
          <h1 className="site-logo">SenseLondon</h1>
        </Link>
        <div className="navbar-links">
          <div>Categories</div>
          <div>Brands</div>
          <div>Sales</div>
          <div>In Stock</div>
          <div>Contact Us</div>
        </div>
        <div className="navbar-user-menu">
          <Link
            style={{ display: "flex" }}
            to={isAuthenticated ? "/notifications" : "/login"}
          >
            <BellIcon size={0.8} />
          </Link>
          <Link
            style={{ display: "flex" }}
            to={isAuthenticated ? "/search" : "/login"}
          >
            <SearchIcon size={0.8} />
          </Link>
          <Link
            style={{ display: "flex" }}
            to={isAuthenticated ? "/wishlist" : "/login"}
          >
            <HeartIcon size={0.8} />
          </Link>
          <Link
            style={{ display: "flex" }}
            to={isAuthenticated ? "/profile" : "/login"}
          >
            <AccountIcon size={0.8} />
          </Link>
          <Link
            style={{ display: "flex" }}
            to={isAuthenticated ? "/cart" : "/login"}
          >
            <CartIcon size={0.8} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
