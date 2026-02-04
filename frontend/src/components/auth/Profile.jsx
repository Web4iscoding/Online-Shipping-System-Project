/**
 * Profile Component
 * Displays current user information
 */

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import {
  ShoppingIcon,
  AccountDetailsIcon,
  BasketIcon,
  ClipboardIcon,
  SaleIcon,
  TruckCheckIcon,
  StoreEditIcon,
} from "../../assets/icons";
import { replace, useNavigate } from "react-router-dom";
import "../../styles/Profile.css";
import ts from "../../assets/image.png";
import { API_BASE } from "../../api";
import blank_pfp from "../../assets/blank_pfp.png";

const CustomerProfile = ({ user }) => {
  const navigate = useNavigate();
  return (
    <>
      <div className="profile-header">
        <img
          className="avatar"
          alt="avatar"
          src={
            user?.profileImage ? `${API_BASE}${user?.profileImage}` : blank_pfp
          }
        ></img>
        <h2>
          Hi,<br></br>
          {user?.account?.username}
        </h2>
      </div>
      <div className="profile-card-container">
        <button className="profile-card" onClick={() => navigate("/my-orders")}>
          <div className="profile-card-title">
            <ShoppingIcon size={1.3} />
            <h3>My Orders</h3>
          </div>
          <p>Manage and track your orders</p>
        </button>
        <button
          className="profile-card"
          onClick={() => navigate("/account-details")}
        >
          <div className="profile-card-title">
            <AccountDetailsIcon size={1.3} />
            <h3>Account Details</h3>
          </div>
          <p>Change your account information</p>
        </button>
      </div>
      <button className="logout" onClick={() => navigate("/logout")}>
        Logout
      </button>
    </>
  );
};

const VendorProfile = ({ user }) => {
  const navigate = useNavigate();
  return (
    <>
      <div className="profile-header">
        <img
          className="avatar"
          alt="avatar"
          src={
            user?.profileImage ? `${API_BASE}${user?.profileImage}` : blank_pfp
          }
        ></img>
        <h2>
          Hi,<br></br>
          {user?.account?.username}
        </h2>
      </div>
      <div className="profile-card-container">
        <button className="profile-card" onClick={() => navigate("/catalog")}>
          <div className="profile-card-title">
            <BasketIcon size={1.3} />
            <h3>Catalog</h3>
          </div>
          <p>Manage and edit your products</p>
        </button>
        <button className="profile-card" onClick={() => navigate("/orders")}>
          <div className="profile-card-title">
            <ClipboardIcon size={1.3} />
            <h3>Orders</h3>
          </div>
          <p>Manage and update your incoming orders</p>
        </button>
      </div>
      <div className="profile-card-container">
        <button className="profile-card" onClick={() => navigate("/discounts")}>
          <div className="profile-card-title">
            <SaleIcon size={1.3} />
            <h3>Discounts</h3>
          </div>
          <p>Set up your discounts</p>
        </button>
        <button
          className="profile-card"
          onClick={() => navigate("/shipped-orders")}
        >
          <div className="profile-card-title">
            <TruckCheckIcon size={1.3} />
            <h3>Shipped Orders</h3>
          </div>
          <p>View all shipped orders</p>
        </button>
      </div>
      <div className="profile-card-container">
        <button
          className="profile-card"
          onClick={() => navigate("/store-details")}
        >
          <div className="profile-card-title">
            <StoreEditIcon size={1.3} />
            <h3>Store Details</h3>
          </div>
          <p>Change your store information</p>
        </button>
        <button
          className="profile-card"
          style={{ visibility: "hidden" }}
        ></button>
      </div>
      <button className="logout" onClick={() => navigate("/logout")}>
        Logout
      </button>
    </>
  );
};

export const Profile = () => {
  const { user, isAuthenticated, isVendor, isCustomer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="profile-container">
      {isVendor ? (
        <VendorProfile user={user} />
      ) : isCustomer ? (
        <CustomerProfile user={user} />
      ) : (
        <div>
          <h1>lmao who is u</h1>
          <button className="logout" onClick={() => navigate("/logout")}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
export default Profile;
