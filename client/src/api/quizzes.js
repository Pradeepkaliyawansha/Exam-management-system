import axios from "axios";

// Admin API endpoints
export const getQuizzesByExam = async (examId) => {
  try {
    const response = await axios.get(`/api/admin/exams/${examId}/quizzes`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getQuizById = async (quizId) => {
  try {
    const response = await axios.get(`/api/admin/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createQuiz = async (examId, quizData) => {
  try {
    const response = await axios.post(
      `/api/admin/exams/${examId}/quizzes`,
      quizData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateQuiz = async (quizId, quizData) => {
  try {
    const response = await axios.put(`/api/admin/quizzes/${quizId}`, quizData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteQuiz = async (quizId) => {
  try {
    const response = await axios.delete(`/api/admin/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Student API endpoints
export const getStudentQuizById = async (quizId) => {
  try {
    const response = await axios.get(`/api/student/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitQuiz = async (quizId, answers) => {
  try {
    const response = await axios.post(`/api/student/quizzes/${quizId}/submit`, {
      answers,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
