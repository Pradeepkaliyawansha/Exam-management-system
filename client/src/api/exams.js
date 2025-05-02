import axios from "axios";

// Admin API endpoints
export const createExam = async (examData) => {
  try {
    const response = await axios.post("/api/exams", examData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllExams = async () => {
  try {
    const response = await axios.get("/api/exams");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getExamById = async (examId) => {
  try {
    const response = await axios.get(`/api/exams/${examId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateExam = async (examId, examData) => {
  try {
    const response = await axios.put(`/api/exams/${examId}`, examData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteExam = async (examId) => {
  try {
    const response = await axios.delete(`/api/exams/${examId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Student API endpoints
export const getAvailableExams = async () => {
  try {
    const response = await axios.get("/api/student/exams");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getActiveExams = async () => {
  try {
    const response = await axios.get("/api/exams/active");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStudentExamById = async (examId) => {
  try {
    const response = await axios.get(`/api/student/exams/${examId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const startExam = async (examId) => {
  try {
    const response = await axios.post(`/api/exams/${examId}/start`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitExam = async (examId, answers, additionalDetails) => {
  try {
    const response = await axios.post(`/api/exams/${examId}/submit`, {
      answers,
      additionalDetails,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
