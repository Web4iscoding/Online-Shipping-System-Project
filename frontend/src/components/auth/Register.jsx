/**
 * Login Component
 * Handles user authentication
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import "../../styles/Register.css";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import WarningWindow from "../windows/WarningWindow";
import { EyeIcon, EyeOffIcon } from "../../assets/icons";

const VendorRegisterForm = ({
  message,
  showWarning,
  setShowWarning,
  formData,
  handleRegister,
  handleChange,
  handlePhoneChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setConfirmError("");
    handleRegister(e);
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h1>Let's get you started</h1>
      {showWarning && (
        <WarningWindow
          message={message}
          onClose={() => setShowWarning(false)}
        />
      )}
      {confirmError && (
        <WarningWindow
          message={confirmError}
          onClose={() => setConfirmError("")}
        />
      )}
      <div className="input-field">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          onChange={handleChange}
          pattern="^[^@\s]+@[^@\s]+\.[^@\s]+$"
          title="Please enter a valid email address"
          required
        />
      </div>
      <div className="input-field">
        <label htmlFor="password">Create New Password</label>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            onChange={handleChange}
            required
            minLength={6}
            style={{ width: "100%", paddingRight: "36px" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: "absolute",
              right: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              color: "var(--primary-color-light)",
            }}
          >
            {showPassword ? <EyeOffIcon size={0.8} /> : <EyeIcon size={0.8} />}
          </button>
        </div>
      </div>
      <div className="input-field">
        <label htmlFor="confirmPassword">Confirm New Password</label>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: "100%", paddingRight: "36px" }}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            style={{
              position: "absolute",
              right: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              color: "var(--primary-color-light)",
            }}
          >
            {showConfirm ? <EyeOffIcon size={0.8} /> : <EyeIcon size={0.8} />}
          </button>
        </div>
      </div>
      <div className="name-fields">
        <div className="input-field">
          <label htmlFor="firstName">First Name</label>
          <input id="firstName" type="text" onChange={handleChange} required />
        </div>
        <div className="input-field">
          <label htmlFor="lastName">Last Name</label>
          <input id="lastName" type="text" onChange={handleChange} required />
        </div>
      </div>
      <div className="input-field">
        <label htmlFor="username">Username</label>
        <input id="username" type="text" onChange={handleChange} required />
      </div>
      <div className="input-field">
        <label htmlFor="storeName">Store Name</label>
        <input id="storeName" type="text" onChange={handleChange} required />
      </div>
      <div className="input-field">
        <label htmlFor="phoneNo">Phone Number</label>
        <PhoneInput
          defaultCountry="mo"
          onChange={handlePhoneChange}
          id="phoneNo"
          inputStyle={{ width: "100%" }}
          required
        />
      </div>
      <button type="submit" className="register-button">
        Register
      </button>
    </form>
  );
};

const CustomerRegisterForm = ({
  message,
  showWarning,
  setShowWarning,
  formData,
  handleRegister,
  handleChange,
  handlePhoneChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setConfirmError("");
    handleRegister(e);
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h1>Let's get you started</h1>
      {showWarning && (
        <WarningWindow
          message={message}
          onClose={() => setShowWarning(false)}
        />
      )}
      {confirmError && (
        <WarningWindow
          message={confirmError}
          onClose={() => setConfirmError("")}
        />
      )}
      <div className="input-field">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          onChange={handleChange}
          pattern="^[^@\s]+@[^@\s]+\.[^@\s]+$"
          title="Please enter a valid email address"
          required
        />
      </div>
      <div className="input-field">
        <label htmlFor="password">Create New Password</label>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            onChange={handleChange}
            required
            minLength={6}
            style={{ width: "100%", paddingRight: "36px" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: "absolute",
              right: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              color: "var(--primary-color-light)",
            }}
          >
            {showPassword ? <EyeOffIcon size={0.8} /> : <EyeIcon size={0.8} />}
          </button>
        </div>
      </div>
      <div className="input-field">
        <label htmlFor="confirmPassword">Confirm New Password</label>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: "100%", paddingRight: "36px" }}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            style={{
              position: "absolute",
              right: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              color: "var(--primary-color-light)",
            }}
          >
            {showConfirm ? <EyeOffIcon size={0.8} /> : <EyeIcon size={0.8} />}
          </button>
        </div>
      </div>
      <div className="name-fields">
        <div className="input-field">
          <label htmlFor="firstName">First Name</label>
          <input id="firstName" type="text" onChange={handleChange} required />
        </div>
        <div className="input-field">
          <label htmlFor="lastName">Last Name</label>
          <input id="lastName" type="text" onChange={handleChange} required />
        </div>
      </div>
      <div className="input-field">
        <label htmlFor="username">Username</label>
        <input id="username" type="text" onChange={handleChange} required />
      </div>
      <div className="input-field">
        <label htmlFor="phoneNo">Phone Number</label>
        <PhoneInput
          defaultCountry="mo"
          onChange={handlePhoneChange}
          id="phoneNo"
          inputStyle={{ width: "100%" }}
          required
        />
      </div>
      <div className="input-field">
        <label className="shipping-address-label" htmlFor="shipping-address-1">
          Shipping Address
        </label>
        <input
          id="shippingAddress1"
          type="text"
          onChange={handleChange}
          required
        />
        <input
          id="shippingAddress2"
          type="text"
          onChange={handleChange}
          required
        />
        <input
          id="shippingAddress3"
          type="text"
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" className="register-button">
        Register
      </button>
    </form>
  );
};

export const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [error, setError] = useState("");
  const { type } = useParams();
  const [showWarning, setShowWarning] = useState(false);
  const [formData, setFormData] = useState(
    type === "customer"
      ? {
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          username: "",
          phoneNo: "",
          shippingAddress1: "",
          shippingAddress2: "",
          shippingAddress3: "",
        }
      : {
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          storeName: "",
        },
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      ["phoneNo"]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    for (let item in formData) {
      if (!formData[item].trim()) {
        console.log("fds");
        console.log(formData);
        setError("Email and password are required");
        setShowWarning(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    try {
      if (type === "vendor") {
        await register(formData, true);
      } else {
        await register(formData);
      }

      navigate("/profile", { replace: true });
    } catch (err) {
      const data = JSON.parse(err.message);
      setError(
        data.username?.[0] ||
          data.email?.[0] ||
          "Register failed. Please check your credentials.",
      );
      setShowWarning((prev) => prev || true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="register-container">
      {type === "vendor" ? (
        <VendorRegisterForm
          message={error}
          showWarning={showWarning}
          setShowWarning={setShowWarning}
          formData={formData}
          handleRegister={handleRegister}
          handleChange={handleChange}
          handlePhoneChange={handlePhoneChange}
        />
      ) : (
        <CustomerRegisterForm
          message={error}
          showWarning={showWarning}
          setShowWarning={setShowWarning}
          formData={formData}
          handleRegister={handleRegister}
          handleChange={handleChange}
          handlePhoneChange={handlePhoneChange}
        />
      )}
    </div>
  );
};

export default Register;
