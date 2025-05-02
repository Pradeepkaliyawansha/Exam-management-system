import React, { createContext, useState, useEffect, useContext } from "react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/notifications";
import { AuthContext } from "./AuthContext";

export const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (currentUser?.role === "student") {
        try {
          setLoading(true);
          const data = await getNotifications();
          setNotifications(data);
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setNotifications([]);
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchNotifications();
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const addNotification = (notification) => {
    const id = Date.now().toString();
    setNotifications([{ ...notification, id }, ...notifications]);

    // Auto-remove notification after 5 seconds if it's a success type
    if (notification.type === "success") {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
  };

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(
        notifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
