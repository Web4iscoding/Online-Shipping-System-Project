/**
 * Navigation Component
 * Main navigation bar with links and user menu
 */

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { API_BASE, notifications as notificationsAPI } from "../api";
import "../styles/Navigation.css";
import {
  BellIcon,
  SearchIcon,
  HeartIcon,
  AccountIcon,
  CartIcon,
} from "../assets/icons";
import blank_pfp from "../assets/blank_pfp.png";
import Notifications from "./modals/Notifications";
import ModalBackdrop from "./common/ModalBackdrop";

export const Navigation = ({ setShowSearchModal }) => {
  const { isAuthenticated, user, logout, isVendor } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { pathname } = useLocation();

  // Close notification dropdown on route change
  useEffect(() => {
    setShowNotifications(false);
  }, [pathname]);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCount = async () => {
      try {
        const data = await notificationsAPI.unreadCount();
        setUnreadCount(data.unread_count);
      } catch (err) {
        // silent
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleBellClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setShowNotifications((prev) => !prev);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" style={{ textDecoration: "none" }}>
            <h1 className="site-logo">SenseLondon</h1>
          </Link>
          <div className="navbar-links">
            <div>Categories</div>
            <div>Brands</div>
            <div>Sales</div>
            <Link to="/product-list/in-stock" className="navbar-link">
              In Stock
            </Link>
            <div>Contact Us</div>
          </div>
          <div className="navbar-user-menu">
            <Link
              style={{ display: "flex", position: "relative" }}
              to={isAuthenticated ? "#" : "/login"}
              onClick={isAuthenticated ? handleBellClick : undefined}
            >
              <BellIcon size={0.8} />
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
            <Link
              style={{ display: "flex" }}
              onClick={() => setShowSearchModal(true)}
            >
              <SearchIcon size={0.8} />
            </Link>
            {!isVendor && (
              <Link
                style={{ display: "flex" }}
                to={isAuthenticated ? "/wishlist" : "/login"}
              >
                <HeartIcon size={0.8} />
              </Link>
            )}
            {!isVendor && (
              <Link
                style={{ display: "flex" }}
                to={isAuthenticated ? "/cart" : "/login"}
              >
                <CartIcon size={0.8} />
              </Link>
            )}
            <Link
              style={{ display: "flex" }}
              to={isAuthenticated ? "/profile" : "/login"}
            >
              {isAuthenticated ? (
                <img
                  src={
                    user?.profileImage
                      ? `${API_BASE}${user.profileImage}`
                      : blank_pfp
                  }
                  alt="Profile"
                  className="nav-avatar"
                />
              ) : (
                <AccountIcon size={0.8} />
              )}
            </Link>
          </div>
        </div>
      </nav>
      {showNotifications && (
        <Notifications
          onClose={() => setShowNotifications(false)}
          onUnreadChange={setUnreadCount}
        />
      )}
    </>
  );
};

export default Navigation;
