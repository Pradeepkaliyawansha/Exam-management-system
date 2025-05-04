import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Student results endpoints
export const getStudentResults = async () => {
  try {
    const response = await api.get("/results/student");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getResultById = async (resultId) => {
  try {
    const response = await api.get(`/results/${resultId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addResultDetails = async (resultId, additionalDetails) => {
  try {
    const response = await api.post(`/student/results/${resultId}/details`, {
      additionalDetails,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const generatePDF = async (resultId) => {
  try {
    const response = await api.post(`/results/${resultId}/generate-pdf`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin results endpoints
export const getExamResults = async (examId) => {
  try {
    const response = await api.get(`/results/admin/exam/${examId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addFeedback = async (resultId, feedback) => {
  try {
    const response = await api.put(`/results/${resultId}/feedback`, {
      feedback,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
