// client/src/api/studentDashboard.js
import axios from "axios";

// Create a minimal axios instance with optimized headers
const dashboardAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    // Only include essential headers
  },
  withCredentials: false, // Don't send cookies unnecessarily
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  maxRedirects: 0,
});

// Add a response interceptor to handle 431 errors specifically
dashboardAxios.interceptors.request.use(
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

dashboardAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 431) {
      console.warn("Header size too large - returning empty data");
      // For 431 errors, just return empty array instead of throwing
      return { data: [] };
    }
    return Promise.reject(error);
  }
);

// Optimized function to fetch available exams for dashboard
export const getAvailableExamsLite = async () => {
  try {
    const response = await dashboardAxios.get("/student/exams");
    return response.data || [];
  } catch (error) {
    console.warn("Error fetching exams:", error.message);
    // Return empty array for any error
    return [];
  }
};

// Optimized function to fetch student results for dashboard
export const getStudentResultsLite = async () => {
  try {
    const response = await dashboardAxios.get("/results/student");
    return response.data || [];
  } catch (error) {
    console.warn("Error fetching results:", error.message);
    // Return empty array for any error
    return [];
  }
};

// Export other necessary API functions
export default {
  getAvailableExamsLite,
  getStudentResultsLite,
};
