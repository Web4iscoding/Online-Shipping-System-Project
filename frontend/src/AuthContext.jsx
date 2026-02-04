/**
 * Authentication Context
 * Manages authentication state, user info, and token across the app
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { auth as authApi } from "./api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [userType, setUserType] = useState(
    localStorage.getItem("userType") || null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const userData = await authApi.getMe();
          const formattedUserData = {
            ...userData,
            account: userData.user,
          };
          delete formattedUserData.user;
          console.log(formattedUserData);
          setUser(formattedUserData);
          setUserType(userData["user_type"]);
          const item = localStorage.setItem("userType", userData["user_type"]);
        } catch (err) {
          console.error("Failed to load user:", err);
          // Token might be invalid, clear it
          localStorage.removeItem("token");
          localStorage.removeItem("userType");
          setToken(null);
          setUserType(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const register = useCallback(async (data, isVendor = false) => {
    try {
      setError(null);
      let response;
      if (isVendor) {
        response = await authApi.registerVendor(
          data.username,
          data.email,
          data.password,
          data.firstName,
          data.lastName,
          data.storeName,
          data.phoneNo,
        );
      } else {
        response = await authApi.registerCustomer(
          data.username,
          data.email,
          data.password,
          data.firstName,
          data.lastName,
          data.phoneNo,
          data.shippingAddress1,
          data.shippingAddress2,
          data.shippingAddress3,
        );
      }

      // Store token and user info
      localStorage.setItem("token", response.token);
      localStorage.setItem("userType", response["userType"]);
      setToken(response.token);
      setUser(response.user);
      setUserType(response["userType"]);

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await authApi.login(email, password);

      // Store token and user info
      localStorage.setItem("token", response.token);
      localStorage.setItem("userType", response["userType"]);
      setToken(response.token);
      setUser(response.user);
      setUserType(response["userType"]);

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear state and storage regardless of API call result
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      setToken(null);
      setUser(null);
      setUserType(null);
      setError(null);
    }
  }, []);

  const isAuthenticated = !!token;
  const isVendor = userType === "vendor";
  const isCustomer = userType === "customer";

  const value = {
    // State
    user,
    token,
    userType,
    loading,
    error,
    isAuthenticated,
    isVendor,
    isCustomer,

    // Methods
    register,
    login,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 * @returns {object} - Auth context value with user, token, methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
