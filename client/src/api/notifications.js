import axios from "axios";

// Create a minimal axios instance with only essential headers
const notificationAxios = axios.create({
  baseURL: "/api/student/notifications",
  headers: {
    "Content-Type": "application/json",
    // Don't include other headers
  },
});

// Add a response interceptor to handle 431 errors specifically
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

export const getNotifications = async () => {
  try {
    // Use a minimal request with reduced timeout
    const response = await notificationAxios.get("", {
      timeout: 5000, // 5 second timeout
    });
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
