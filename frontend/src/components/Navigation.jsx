/**
 * Navigation Component
 * Main navigation bar with links and user menu
 */

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { API_BASE, notifications as notificationsAPI, products as productsAPI } from "../api";
import "../styles/Navigation.css";
import {
  BellIcon,
  SearchIcon,
  HeartIcon,
  AccountIcon,
  CartIcon,
  MenuIcon,
  CloseIcon,
} from "../assets/icons";
import blank_pfp from "../assets/blank_pfp.png";
import noImage from "../assets/no_image_available.jpg";
import Notifications from "./modals/Notifications";
import ModalBackdrop from "./common/ModalBackdrop";

export const Navigation = ({ setShowSearchModal }) => {
  const { isAuthenticated, user, logout, isVendor } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [mobileSearchResults, setMobileSearchResults] = useState([]);
  const { pathname } = useLocation();

  // Close notification dropdown and mobile menu on route change
  useEffect(() => {
    setShowNotifications(false);
    setShowMobileMenu(false);
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

  // Mobile inline search
  useEffect(() => {
    if (!mobileSearchQuery || mobileSearchQuery.trim() === "") {
      setMobileSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await productsAPI.list(1, mobileSearchQuery);
        setMobileSearchResults(data.results || []);
      } catch {
        setMobileSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [mobileSearchQuery]);

  // Clear mobile search when menu closes
  useEffect(() => {
    if (!showMobileMenu) {
      setMobileSearchQuery("");
      setMobileSearchResults([]);
    }
  }, [showMobileMenu]);

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
          <div className="navbar-mobile-left">
            <button
              onClick={() => setShowMobileMenu((prev) => !prev)}
              aria-label="Toggle menu"
            >
              <MenuIcon size={1} />
            </button>
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
            <button
              className="navbar-hamburger"
              onClick={() => setShowMobileMenu((prev) => !prev)}
              aria-label="Toggle menu"
            >
              <MenuIcon size={1} />
            </button>
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
              className="navbar-search-link"
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
              className="navbar-profile-link"
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
      {/* Mobile menu drawer */}
      <div className={`mobile-menu-backdrop${showMobileMenu ? " open" : ""}`} onClick={() => setShowMobileMenu(false)} />
      <div className={`mobile-menu-drawer${showMobileMenu ? " open" : ""}`}>
        <button className="mobile-menu-close" onClick={() => setShowMobileMenu(false)}>
          <CloseIcon size={1} />
        </button>
        <div className="mobile-menu-search-wrapper">
          <SearchIcon size={0.7} className="mobile-menu-search-icon" />
          <input
            type="text"
            placeholder=""
            value={mobileSearchQuery}
            onChange={(e) => setMobileSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && mobileSearchQuery?.trim()) {
                navigate(
                  `/product-list/search?query=${encodeURIComponent(mobileSearchQuery.trim())}`,
                );
                setShowMobileMenu(false);
              }
            }}
          />
        </div>
        <hr className="mobile-menu-divider" />
        {mobileSearchQuery.trim() && mobileSearchResults.length > 0 ? (
          <div className="mobile-menu-results">
            {mobileSearchResults.slice(0, 3).map((result) => (
              <div className="mobile-search-result-card" key={result.productID}>
                <button
                  onClick={() => {
                    navigate(`/product/${result.productID}`);
                    setShowMobileMenu(false);
                  }}
                >
                  <img
                    src={
                      result.primary_image
                        ? `${API_BASE}/${result.primary_image}`
                        : noImage
                    }
                    alt={result.productName}
                  />
                </button>
                <p>{result.productName}</p>
              </div>
            ))}
            <button
              className="mobile-menu-view-more"
              onClick={() => {
                navigate(
                  `/product-list/search?query=${encodeURIComponent(mobileSearchQuery.trim())}`,
                );
                setShowMobileMenu(false);
              }}
            >
              VIEW MORE
            </button>
          </div>
        ) : (
          <nav className="mobile-menu-links">
            <div onClick={() => setShowMobileMenu(false)}>Categories</div>
            <div onClick={() => setShowMobileMenu(false)}>Brands</div>
            <div onClick={() => setShowMobileMenu(false)}>Sale</div>
            <Link to="/product-list/in-stock" className="navbar-link" onClick={() => setShowMobileMenu(false)}>
              In Stock
            </Link>
            <div onClick={() => setShowMobileMenu(false)}>Contact Us</div>
          </nav>
        )}
      </div>
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
