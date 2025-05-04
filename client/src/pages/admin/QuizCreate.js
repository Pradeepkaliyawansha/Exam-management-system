import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createQuiz } from "../../api/quizzes";
import QuizForm from "./QuizForm";

const QuizCreate = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateQuiz = async (formData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      await createQuiz(examId, formData);
      navigate(`/admin/exams/${examId}/quizzes`);
    } catch (error) {
      console.error("Error creating quiz:", error);
      setError(
        error.response?.data?.msg ||
          error.response?.data?.message ||
          "Failed to create quiz. Please try again later."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Create New Quiz</h1>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <QuizForm
        onSubmit={handleCreateQuiz}
        buttonText="Create Quiz"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default QuizCreate;
