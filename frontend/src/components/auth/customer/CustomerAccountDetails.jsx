import "../../../styles/CustomerAccountDetails.css";
import { LeftArrowIcon } from "../../../assets/icons/";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../AuthContext";

const CustomerAccountDetails = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [customerData, setCustomerData] = useState(user);

  return (
    <div className="customer-account-details-container">
        <button id="orders-revert-button" onClick={() => navigate("/profile")}>
        <LeftArrowIcon />
        <p>Your Account</p>
      </button>
      <div>
        <div className="customer-account-details-header">
          <h2>Account Details</h2>
          <p>Manage your account details and preferences.</p>
        </div>
        <div>
          <h3>Personal Information</h3>
          <p>{user.firstName} {user.lastName}</p>
          <button>Edit</button>
        </div>
      </div>
    </div>
    );
    };

export default CustomerAccountDetails;