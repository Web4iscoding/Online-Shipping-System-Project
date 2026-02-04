/**
 * Login Component
 * Handles user authentication
 */

import { useState, useEffect } from "react";
import { useNavigate, Link, replace } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import WarningWindow from "../windows/WarningWindow";
import "../../styles/Login.css";

export const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Email and password are required");
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
          <input
            id="password"
            type="password"
            onChange={handleChange}
            required
            value={formData.password}
            minLength={6}
          />
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
