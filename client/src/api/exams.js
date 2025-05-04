import axios from "axios";

// Create axios instance with interceptor for authentication
const api = axios.create({
  baseURL: "/api",
});

// Add a request interceptor to include auth token
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

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle token expiration
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Admin API endpoints
export const createExam = async (examData) => {
  try {
    const response = await api.post("/exams", examData);
    return response.data;
  } catch (error) {
    console.error("Error creating exam:", error);
    throw error;
  }
};

export const getAllExams = async () => {
  try {
    const response = await api.get("/exams");
    return response.data;
  } catch (error) {
    console.error("Error getting all exams:", error);
    throw error;
  }
};

export const getExamById = async (examId) => {
  try {
    const response = await api.get(`/exams/${examId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting exam by ID:", error);
    throw error;
  }
};

export const updateExam = async (examId, examData) => {
  try {
    const response = await api.put(`/exams/${examId}`, examData);
    return response.data;
  } catch (error) {
    console.error("Error updating exam:", error);
    throw error;
  }
};

export const deleteExam = async (examId) => {
  try {
    const response = await api.delete(`/exams/${examId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting exam:", error);
    throw error;
  }
};

// Student API endpoints (already in use by other files)
export const getAvailableExams = async () => {
  try {
    const response = await api.get("/student/exams");
    return response.data;
  } catch (error) {
    console.error("Error getting available exams:", error);
    throw error;
  }
};

export const getActiveExams = async () => {
  try {
    const response = await api.get("/exams/active");
    return response.data;
  } catch (error) {
    console.error("Error getting active exams:", error);
    throw error;
  }
};

export const getStudentExamById = async (examId) => {
  try {
    const response = await api.get(`/student/exams/${examId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting student exam:", error);
    throw error;
  }
};

export const startExam = async (examId) => {
  try {
    const response = await api.post(`/exams/${examId}/start`);
    return response.data;
  } catch (error) {
    console.error("Error starting exam:", error);
    throw error;
  }
};

export const submitExam = async (examId, answers, additionalDetails) => {
  try {
    const response = await api.post(`/exams/${examId}/submit`, {
      answers,
      additionalDetails,
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting exam:", error);
    throw error;
  }
};
