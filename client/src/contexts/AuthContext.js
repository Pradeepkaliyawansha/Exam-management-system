import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Set the base URL for all axios requests
const API_URL = "http://localhost:5000/api";

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
        if (token) {
          // Configure axios for the request
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };

          // Make authenticated request to get current user
          const response = await axios.get(`${API_URL}/auth/me`, config);

          if (response.data && response.data.user) {
            setCurrentUser(response.data.user);
          } else {
            // Handle case where response doesn't contain expected data
            console.error("Invalid user data received");
            localStorage.removeItem("token");
          }
        }
      } catch (err) {
        console.error("Failed to get current user:", err);
        localStorage.removeItem("token"); // Clear invalid token
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
      localStorage.setItem("token", data.token);
      setCurrentUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || "Login failed");
      throw err;
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
      localStorage.setItem("token", data.token);
      setCurrentUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || "Registration failed");
      throw err;
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
