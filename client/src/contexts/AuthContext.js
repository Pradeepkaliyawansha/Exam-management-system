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
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        // Log token for debugging
        console.log("Checking token validity:", token.substring(0, 10) + "...");

        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.user) {
          setCurrentUser(response.data.user);
          console.log(
            "User authenticated:",
            response.data.user.email,
            response.data.user.role
          );
        } else {
          console.error("Invalid user data format received");
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Failed to get current user:", err.message);
        if (err.response && err.response.status === 401) {
          console.log("Token invalid, removing token");
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
