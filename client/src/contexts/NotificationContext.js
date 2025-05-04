import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";

// Create a minimal axios instance for notifications
const notificationAxios = axios.create({
  baseURL: "/api/student/notifications",
  headers: {
    "Content-Type": "application/json",
    // Don't include other headers
  },
  timeout: 5000, // 5 second timeout
  withCredentials: false,
  maxRedirects: 0,
});

// Add a response interceptor to handle 431 errors specifically
notificationAxios.interceptors.request.use(
  (config) => {
    // Get token and only add if it exists
    const token = localStorage.getItem("token");
    if (token) {
      // Use simpler header format
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

notificationAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 431) {
      console.warn("Header size too large - returning empty notifications");
      // For 431 errors, just return empty array instead of throwing
      return { data: [] };
    }
    return Promise.reject(error);
  }
);

export const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);

  // Function to safely fetch notifications
  const fetchNotifications = async () => {
    // Only attempt to fetch if user is logged in and is a student
    if (!currentUser || currentUser.role !== "student") {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Using the improved API function that handles 431 errors
      const data = await getNotifications();

      // Always set notifications, even if it's an empty array
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error.message);
      setError("Unable to load notifications");
      // Set empty notifications on error
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    if (currentUser?.role === "student") {
      fetchNotifications();

      // Set up polling with progressively longer intervals
      // Start with 1 minute, but don't go below this
      const POLL_INTERVAL = 60000; // 1 minute

      const interval = setInterval(fetchNotifications, POLL_INTERVAL);
      return () => clearInterval(interval);
    } else {
      // Reset state when user is not a student
      setNotifications([]);
      setLoading(false);
      setError(null);
    }
  }, [currentUser]);

  const addNotification = (notification) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    setNotifications((prevNotifications) => [
      newNotification,
      ...prevNotifications,
    ]);

    // Auto-remove success notifications after 5 seconds
    if (notification.type === "success") {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error.message);
      // Still update UI even if API fails
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error.message);
      // Still update UI even if API fails
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    }
  };

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        error,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// API functions with error handling
export const getNotifications = async () => {
  try {
    // Use a minimal request with reduced timeout
    const response = await notificationAxios.get("");
    return response.data || [];
  } catch (error) {
    console.warn("Notification API error:", error.message);
    // Return empty array for any error
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await notificationAxios.put(`/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.warn("Mark notification error:", error.message);
    // Return success even on error to prevent UI issues
    return { success: true };
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await notificationAxios.put("/mark-all-read");
    return response.data;
  } catch (error) {
    console.warn("Mark all notifications error:", error.message);
    // Return success even on error to prevent UI issues
    return { success: true };
  }
};
