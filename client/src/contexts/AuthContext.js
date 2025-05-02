import React, { createContext, useState, useEffect } from "react";
import { login, register, getCurrentUser } from "../api/auth";

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
          const user = await getCurrentUser();
          setCurrentUser(user);
        }
      } catch (err) {
        console.error("Failed to get current user:", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const handleLogin = async (email, password) => {
    setError(null);
    try {
      const data = await login({ email, password });
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
      const data = await register(userData);
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
