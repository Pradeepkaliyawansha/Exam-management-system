import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Configure axios defaults
axios.defaults.maxContentLength = 10 * 1024 * 1024; // 10 MB
axios.defaults.maxBodyLength = 10 * 1024 * 1024; // 10 MB
axios.defaults.timeout = 30000; // 30 seconds

// Login function
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Register function
export const register = async (userData) => {
  try {
    // Simplify data by ensuring no additional properties
    const cleanedUserData = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || "student",
    };

    const response = await axios.post(
      `${API_URL}/auth/register`,
      cleanedUserData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

// Get current user - with improved token handling
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);

    // If token is invalid, remove it from storage
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
    }

    throw error;
  }
};

// Helper function to create authenticated requests with improved error handling
export const authRequest = async (method, url, data = null) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const config = {
      method,
      url: `${API_URL}${url}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error making ${method} request to ${url}:`, error);

    // Handle token expiration or invalid token
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      // You could add a callback here to redirect to login page
    }

    throw error;
  }
};
