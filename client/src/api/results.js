import axios from "axios";

// Student results endpoints
export const getStudentResults = async () => {
  try {
    const response = await axios.get("/api/results/student");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getResultById = async (resultId) => {
  try {
    const response = await axios.get(`/api/results/${resultId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addResultDetails = async (resultId, additionalDetails) => {
  try {
    const response = await axios.post(
      `/api/student/results/${resultId}/details`,
      {
        additionalDetails,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const generatePDF = async (resultId) => {
  try {
    const response = await axios.post(`/api/results/${resultId}/generate-pdf`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin results endpoints
export const getExamResults = async (examId) => {
  try {
    const response = await axios.get(`/api/results/admin/exam/${examId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addFeedback = async (resultId, feedback) => {
  try {
    const response = await axios.put(`/api/results/${resultId}/feedback`, {
      feedback,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
