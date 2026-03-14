import { useNavigate, useLocation } from "react-router-dom";
import { LeftArrowIcon } from "../../assets/icons";
import { cart as cartAPI } from "../../api";
import "../../styles/Checkout.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import { auth as authAPI, orders as ordersAPI } from "../../api";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const selectedProductIds = location.state?.selectedProductIds || null;
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    shippingAddress1: "",
    shippingAddress2: "",
    shippingAddress3: "",
  });

  useEffect(() => {
    async function fetchUser() {
      const userData = await authAPI.getMe();
      setFormData((prev) => ({
        ...prev,
        firstName: userData?.firstName || "",
        lastName: userData?.lastName || "",
        shippingAddress1: userData?.shippingAddress1 || "",
        shippingAddress2: userData?.shippingAddress2 || "",
        shippingAddress3: userData?.shippingAddress3 || "",
      }));
    }
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    const response = await ordersAPI.create(
      formData.firstName,
      formData.lastName,
      user.phoneNo,
      formData.shippingAddress1,
      formData.shippingAddress2,
      formData.shippingAddress3,
      selectedProductIds,
    );
    console.log(response);

    // If multiple orders were created (items from different vendors)
    if (response.orders && response.orders.length > 0) {
      navigate("/purchase-complete");
    }
  };

  return (
    <div className="checkout-container">
      <button id="checkout-revert-button" onClick={() => navigate("/cart")}>
        <LeftArrowIcon />
        <p>Your Cart</p>
      </button>
      <h2>Secure Checkout</h2>
      <form onSubmit={handleCheckout} className="checkout-form">
        {/* <p className="checkout-form-title">Shipping Details</p> */}
        <div className="name-fields">
          <div className="input-field">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-field">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>{" "}
        <div className="input-field">
          <label
            className="shipping-address-label"
            htmlFor="shipping-address-1"
          >
            Shipping Address
          </label>
          <input
            id="shippingAddress1"
            type="text"
            value={formData.shippingAddress1}
            onChange={handleChange}
            required
          />
          <input
            id="shippingAddress2"
            type="text"
            value={formData.shippingAddress2}
            onChange={handleChange}
            required
          />
          <input
            id="shippingAddress3"
            type="text"
            value={formData.shippingAddress3}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" id="checkout-button">
          Continue
        </button>
      </form>
    </div>
  );
};

export default Checkout;
