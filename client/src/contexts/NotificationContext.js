import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/notifications";

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
