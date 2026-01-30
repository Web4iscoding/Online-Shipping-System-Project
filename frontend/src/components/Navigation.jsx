/**
 * Navigation Component
 * Main navigation bar with links and user menu
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../styles/Navigation.css';
import { BellIcon, SearchIcon, HeartIcon, AccountIcon, CartIcon } from '../assets/icons';

export const Navigation = () => {
  const { isAuthenticated, user, logout, isVendor } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
        <div className="navbar-container">
            <div className='site-logo'>SenseLondon</div>
            <div className='navbar-links'>
                <div>Categories</div>
                <div>Brands</div>
                <div>Sales</div>
                <div>In Stock</div>
                <div>Contact Us</div>
            </div>
            <div className="navbar-user-menu">
                <BellIcon size={.8} />
                <SearchIcon size={.8} />
                <HeartIcon size={.8} />
                <AccountIcon size={.8} />
                <CartIcon size={.8} />
            </div> 


        </div>
    </nav>
  );
};

export default Navigation;
