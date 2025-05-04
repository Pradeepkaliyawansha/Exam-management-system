import axios from "axios";

// Create axios instance with interceptor for authentication
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
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
export const getQuizzesByExam = async (examId) => {
  try {
    const response = await api.get(`/admin/exams/${examId}/quizzes`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getQuizById = async (quizId) => {
  try {
    const response = await api.get(`/admin/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createQuiz = async (examId, quizData) => {
  try {
    const response = await api.post(`/admin/exams/${examId}/quizzes`, quizData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateQuiz = async (quizId, quizData) => {
  try {
    const response = await api.put(`/admin/quizzes/${quizId}`, quizData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteQuiz = async (quizId) => {
  try {
    const response = await api.delete(`/admin/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Student API endpoints
export const getStudentQuizById = async (quizId) => {
  try {
    const response = await api.get(`/student/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitQuiz = async (quizId, answers) => {
  try {
    const response = await api.post(`/student/quizzes/${quizId}/submit`, {
      answers,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
