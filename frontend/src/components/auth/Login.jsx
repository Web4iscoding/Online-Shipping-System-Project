/**
 * Login Component
 * Handles user authentication
 */

import { useState, useEffect } from "react";
import { useNavigate, Link, replace } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import WarningWindow from "../windows/WarningWindow";
import { EyeIcon, EyeOffIcon } from "../../assets/icons";
import "../../styles/Login.css";

export const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Email and password are required");
      setShowWarning(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate("/", { replace: true });
    } catch (err) {
      const data = JSON.parse(err.message);
      setError(
        data.username?.[0] || data.email?.[0] || "Incorrect email or password.",
      );
      setShowWarning((prev) => prev || true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>Welcome</h1>
        {showWarning && (
          <WarningWindow
            message={error}
            onClose={() => setShowWarning(false)}
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
            value={formData.email}
          />
        </div>
        <div className="input-field">
          <label htmlFor="password">Password</label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              onChange={handleChange}
              required
              value={formData.password}
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
        <button type="submit">Login</button>
        <div>
          Don't have an account?{" "}
          <Link className="register-link" to="/register-selection">
            Register now
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
