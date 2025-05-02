import axios from "axios";

const API_URL = "/api/student/notifications";

export const getNotifications = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.put(`${API_URL}/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.put(`${API_URL}/mark-all-read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
