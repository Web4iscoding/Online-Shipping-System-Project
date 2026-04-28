/**
 * Navigation Component
 * Main navigation bar with links and user menu
 */

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  API_BASE,
  notifications as notificationsAPI,
  products as productsAPI,
  brands as brandsAPI,
  categories as categoriesAPI,
  cart as cartAPI,
} from "../api";
import "../styles/Navigation.css";
import {
  BellIcon,
  SearchIcon,
  HeartIcon,
  AccountIcon,
  CartIcon,
  MenuIcon,
  CloseIcon,
  MenuDownIcon,
} from "../assets/icons";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import blank_pfp from "../assets/blank_pfp.png";
import noImage from "../assets/no_image_available.jpg";
import salesImg from "../assets/Sales.jpg";
import inStockImg from "../assets/In_Stock.jpg";
import Notifications from "./modals/Notifications";
import ModalBackdrop from "./common/ModalBackdrop";
import DarkModeToggle from "./DarkModeToggle";

export const Navigation = ({ setShowSearchModal }) => {
  const { isAuthenticated, user, logout, isVendor } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [mobileSearchResults, setMobileSearchResults] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [mobileBrandOpen, setMobileBrandOpen] = useState(false);
  const dropdownTimeout = useRef(null);
  const { pathname } = useLocation();

  const MAX_DROPDOWN_ITEMS = 7;

  // Sort: Others always last, rest alphabetical
  const sortList = (items, nameKey) => {
    return [...items].sort((a, b) => {
      if (a[nameKey]?.toLowerCase() === "others") return 1;
      if (b[nameKey]?.toLowerCase() === "others") return -1;
      return a[nameKey].localeCompare(b[nameKey]);
    });
  };

  // Fetch categories and brands once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          categoriesAPI.list(),
          brandsAPI.list(),
        ]);
        setAllCategories(sortList(catRes.results || catRes, "categoryName"));
        setAllBrands(sortList(brandRes.results || brandRes, "brandName"));
      } catch {
        // silent
      }
    };
    fetchData();
  }, []);

  // Close notification dropdown and mobile menu on route change
  useEffect(() => {
    setShowNotifications(false);
    setShowMobileMenu(false);
    setActiveDropdown(null);
    setMobileCategoryOpen(false);
    setMobileBrandOpen(false);
  }, [pathname]);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
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

  // Fetch cart item count on mount and periodically
  useEffect(() => {
    if (!isAuthenticated || isVendor) {
      setCartCount(0);
      return;
    }
    const fetchCartCount = async () => {
      try {
        const data = await cartAPI.list();
        setCartCount(data.item_count || 0);
      } catch (err) {
        // silent
      }
    };
    fetchCartCount();
    const interval = setInterval(fetchCartCount, 30000);
    window.addEventListener('cart-updated', fetchCartCount);
    return () => {
      clearInterval(interval);
      window.removeEventListener('cart-updated', fetchCartCount);
    };
  }, [isAuthenticated, isVendor]);

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
            <span
              className="navbar-dropdown-trigger"
              onMouseEnter={() => {
                clearTimeout(dropdownTimeout.current);
                setActiveDropdown(true);
              }}
              onMouseLeave={() => {
                dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 150);
              }}
            >
              Categories
            </span>
            <span
              className="navbar-dropdown-trigger"
              onMouseEnter={() => {
                clearTimeout(dropdownTimeout.current);
                setActiveDropdown(true);
              }}
              onMouseLeave={() => {
                dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 150);
              }}
            >
              Brands
            </span>
            <Link
              to="/product-list/sale"
              className="navbar-link navbar-dropdown-trigger"
              onMouseEnter={() => {
                clearTimeout(dropdownTimeout.current);
                setActiveDropdown(true);
              }}
              onMouseLeave={() => {
                dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 150);
              }}
            >
              Sales
            </Link>
            <Link
              to="/product-list/in-stock"
              className="navbar-link navbar-dropdown-trigger"
              onMouseEnter={() => {
                clearTimeout(dropdownTimeout.current);
                setActiveDropdown(true);
              }}
              onMouseLeave={() => {
                dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 150);
              }}
            >
              In Stock
            </Link>
            <Link to="/contact-us" className="navbar-link">Contact Us</Link>
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
                style={{ display: "flex", position: "relative" }}
                to={isAuthenticated ? "/cart" : "/login"}
              >
                <CartIcon size={0.8} />
                {cartCount > 0 && (
                  <span className="cart-badge">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
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
            <DarkModeToggle />
          </div>
        </div>
        {/* Mega dropdown – rendered outside navbar-links to avoid transform stacking context */}
        {activeDropdown && (
          <div
            className="navbar-mega-dropdown"
            onMouseEnter={() => {
              clearTimeout(dropdownTimeout.current);
              setActiveDropdown(true);
            }}
            onMouseLeave={() => {
              dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 150);
            }}
          >
            <div className="mega-dropdown-list">
              <h4 className="mega-dropdown-heading">Categories</h4>
              {(allCategories.length > MAX_DROPDOWN_ITEMS
                ? allCategories.slice(0, MAX_DROPDOWN_ITEMS)
                : allCategories
              ).map((cat) => (
                <Link
                  key={cat.categoryID}
                  to={`/product-list/category/${encodeURIComponent(cat.categoryName)}`}
                  className="mega-dropdown-item"
                >
                  {cat.categoryName}
                </Link>
              ))}
              {allCategories.length > MAX_DROPDOWN_ITEMS && (
                <Link to="/all-categories" className="mega-dropdown-see-all">
                  See All...
                </Link>
              )}
            </div>
            <div className="mega-dropdown-list">
              <h4 className="mega-dropdown-heading">Brands</h4>
              {(allBrands.length > MAX_DROPDOWN_ITEMS
                ? allBrands.slice(0, MAX_DROPDOWN_ITEMS)
                : allBrands
              ).map((brand) => (
                <Link
                  key={brand.brandID}
                  to={`/product-list/brand/${encodeURIComponent(brand.brandName)}`}
                  className="mega-dropdown-item"
                >
                  {brand.brandName}
                </Link>
              ))}
              {allBrands.length > MAX_DROPDOWN_ITEMS && (
                <Link to="/all-brands" className="mega-dropdown-see-all">
                  See All...
                </Link>
              )}
            </div>
            <div className="mega-dropdown-images">
              <button
                className="mega-dropdown-image-placeholder"
                onClick={() => navigate("/product-list/sale")}
                aria-label="Sale"
                style={{
                  backgroundImage: `url(${salesImg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem", textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>Sales</span>
              </button>
              <button
                className="mega-dropdown-image-placeholder"
                onClick={() => navigate("/product-list/in-stock")}
                aria-label="In Stock"
                style={{
                  backgroundImage: `url(${inStockImg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.25rem", textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>In Stock</span>
              </button>
            </div>
          </div>
        )}
      </nav>
      {/* Mobile menu drawer */}
      <div className={`mobile-menu-backdrop${showMobileMenu ? " open" : ""}`} onClick={() => setShowMobileMenu(false)} />
      <div className={`mobile-menu-drawer${showMobileMenu ? " open" : ""}`}>
        <button className="mobile-menu-close" onClick={() => setShowMobileMenu(false)}>
          <CloseIcon size={1} />
        </button>
        <div className="mobile-menu-search-wrapper">
          <SearchIcon size={1} className="mobile-menu-search-icon" />
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
        {/* <hr className="mobile-menu-divider" /> */}
        {mobileSearchQuery.trim() && mobileSearchResults.length > 0 ? (
          <div className="mobile-menu-results">
            {mobileSearchResults.slice(0, 3).map((result) => (
              <div className="mobile-search-result-card" key={result.productID}>
                <button
                  onClick={() => {
                    navigate(`/product/${result.productID}`, { state: { source: "search", searchQuery: mobileSearchQuery } });
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
                {result.price !== undefined && (
                  <p className="mobile-search-result-price">
                    ${Number(result.discounted_price ?? result.price).toFixed(2)}
                  </p>
                )}
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
              View All Results
            </button>
          </div>
        ) : (
          <nav className="mobile-menu-links">
            <Accordion
              className="mobile-menu-accordion-card"
              id="mobile-category-accordion"
              expanded={mobileCategoryOpen}
              onChange={() => setMobileCategoryOpen((prev) => !prev)}
              disableGutters
              elevation={0}
              sx={{ "&:before": { display: "none" } }}
            >
              <AccordionSummary
                expandIcon={<MenuDownIcon />}
                sx={{ padding: 0, minHeight: 0, "& .MuiAccordionSummary-content": { margin: 0 } }}
              >
                <span className="mobile-menu-accordion-label">Categories</span>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: "12px 0 0 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {(allCategories.length > MAX_DROPDOWN_ITEMS
                  ? allCategories.slice(0, MAX_DROPDOWN_ITEMS)
                  : allCategories
                ).map((cat) => (
                  <Link
                    key={cat.categoryID}
                    to={`/product-list/category/${encodeURIComponent(cat.categoryName)}`}
                    className="mobile-menu-subitem"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {cat.categoryName}
                  </Link>
                ))}
                {allCategories.length > MAX_DROPDOWN_ITEMS && (
                  <Link
                    to="/all-categories"
                    className="mobile-menu-subitem mobile-menu-see-all"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    See All...
                  </Link>
                )}
              </AccordionDetails>
            </Accordion>
            <Accordion
              className="mobile-menu-accordion-card"
              expanded={mobileBrandOpen}
              onChange={() => setMobileBrandOpen((prev) => !prev)}
              disableGutters
              elevation={0}
              sx={{ "&:before": { display: "none" } }}
            >
              <AccordionSummary
                expandIcon={<MenuDownIcon />}
                sx={{ padding: 0, minHeight: 0, "& .MuiAccordionSummary-content": { margin: 0 } }}
              >
                <span className="mobile-menu-accordion-label">Brands</span>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: "12px 0 0 16px", display: "flex", flexDirection: "column", gap: "12px", margin: "0 0 10px 0" }}>
                {(allBrands.length > MAX_DROPDOWN_ITEMS
                  ? allBrands.slice(0, MAX_DROPDOWN_ITEMS)
                  : allBrands
                ).map((brand) => (
                  <Link
                    key={brand.brandID}
                    to={`/product-list/brand/${encodeURIComponent(brand.brandName)}`}
                    className="mobile-menu-subitem"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {brand.brandName}
                  </Link>
                ))}
                {allBrands.length > MAX_DROPDOWN_ITEMS && (
                  <Link
                    to="/all-brands"
                    className="mobile-menu-subitem mobile-menu-see-all"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    See All...
                  </Link>
                )}
              </AccordionDetails>
            </Accordion>
            <Link to="/product-list/sale" className="mobile-menu-plain-link" onClick={() => setShowMobileMenu(false)}>
              Sales
            </Link>
            <Link to="/product-list/in-stock" className="mobile-menu-plain-link" onClick={() => setShowMobileMenu(false)}>
              In Stock
            </Link>
            <Link to="/contact-us" className="mobile-menu-plain-link" onClick={() => setShowMobileMenu(false)}>
              Contact Us
            </Link>
            <div className="mobile-menu-bottom">
              <DarkModeToggle />
            </div>
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
