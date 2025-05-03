import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Set the base URL for all axios requests - use environment variable if available
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token");

        // If no token exists, just set loading to false and return
        if (!token) {
          setLoading(false);
          return;
        }

        // Configure axios for the request with better error handling
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Make authenticated request to get current user
        const response = await axios.get(`${API_URL}/auth/me`, config);

        // Check if the response has the expected data structure
        if (response.data && response.data.user) {
          setCurrentUser(response.data.user);
        } else {
          // Handle case where response doesn't contain expected data
          console.error("Invalid user data format received");
          localStorage.removeItem("token");
        }
      } catch (err) {
        // More detailed error logging
        console.error("Failed to get current user:", err.message);

        // If token is invalid or expired, remove it
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          console.log("Removing invalid token");
          localStorage.removeItem("token");
        }
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const handleLogin = async (email, password) => {
    setError(null);
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (data.token) {
        localStorage.setItem("token", data.token);
        setCurrentUser(data.user);
        return data.user;
      } else {
        throw new Error("No token received from server");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.msg ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleRegister = async (userData) => {
    setError(null);
    try {
      // Clean the user data to ensure only necessary fields are sent
      const cleanUserData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || "student",
      };

      const response = await axios.post(
        `${API_URL}/auth/register`,
        cleanUserData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (data.token) {
        localStorage.setItem("token", data.token);
        setCurrentUser(data.user);
        return data.user;
      } else {
        throw new Error("No token received from server");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.msg ||
        "Registration failed. Please try again.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  const isAdmin = () => {
    return currentUser?.role === "admin";
  };

  const isStudent = () => {
    return currentUser?.role === "student";
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isAdmin,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
