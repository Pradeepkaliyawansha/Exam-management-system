// client/src/api/dashboardAPI.js
import axios from "axios";

// Create a minimal axios instance with optimized headers
const dashboardAxios = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    // Only include essential headers
  },
});

// Add a response interceptor to handle 431 errors specifically
dashboardAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 431) {
      console.warn("Request header too large - returning empty data");
      // For 431 errors, just return empty array instead of throwing
      return { data: [] };
    }
    return Promise.reject(error);
  }
);

// Optimized function to fetch available exams for dashboard
export const getAvailableExamsLite = async () => {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem("token");

    // Create minimal headers
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await dashboardAxios.get("/student/exams", { headers });
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
    // Get auth token from localStorage
    const token = localStorage.getItem("token");

    // Create minimal headers
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await dashboardAxios.get("/results/student", { headers });
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
