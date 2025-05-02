import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { submitExam } from "../../api/exams";
import Timer from "../../pages/student/Timer";
import QuizQuestion from "../../pages/student/QuizQuestions";

const TakeExam = () => {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [exam, setExam] = useState(location.state?.exam || null);
  const [result, setResult] = useState(location.state?.result || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeExpired, setTimeExpired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [additionalDetails, setAdditionalDetails] = useState({});

  // Redirect if no exam data is found
  useEffect(() => {
    if (!exam && !location.state) {
      navigate(`/student/exams/${examId}`);
    }
  }, [exam, examId, location.state, navigate]);

  // Initialize answers
  useEffect(() => {
    if (exam && exam.quizzes && answers.length === 0) {
      setAnswers(
        Array(exam.quizzes.length).fill({ selectedOption: null, quizId: null })
      );
    }
  }, [exam, answers.length]);

  // Handle answer change
  const handleAnswerChange = (selectedOption, quizId) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      selectedOption,
      quizId,
    };
    setAnswers(newAnswers);
  };

  // Handle time expiry
  const handleTimeExpired = () => {
    setTimeExpired(true);
    handleSubmitExam();
  };

  // Handle navigation to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Handle navigation to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.quizzes.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Handle detail input change
  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setAdditionalDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle submit exam
  const handleSubmitExam = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Filter out answers with no selection
      const validAnswers = answers.filter(
        (answer) => answer.selectedOption !== null && answer.quizId !== null
      );

      if (validAnswers.length === 0) {
        setError("Please answer at least one question before submitting.");
        setIsSubmitting(false);
        return;
      }

      const response = await submitExam(
        examId,
        validAnswers,
        additionalDetails
      );

      // Navigate to results page
      navigate(`/student/results/${response._id || result._id}`);
    } catch (error) {
      console.error("Error submitting exam:", error);
      setError(
        error.response?.data?.msg || "Failed to submit exam. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  if (!exam) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const currentQuiz = exam.quizzes[currentQuestionIndex];
  const totalQuestions = exam.quizzes.length;
  const progressPercentage =
    ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Count answered questions
  const answeredCount = answers.filter(
    (answer) => answer.selectedOption !== null
  ).length;

  return (
    <div className="space-y-6">
      {/* Exam Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{exam.title}</h1>
            <p className="text-gray-600 mt-1">{exam.description}</p>
          </div>

          {/* Timer */}
          <div className="mt-4 md:mt-0">
            <Timer duration={exam.duration} onTimeExpired={handleTimeExpired} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span>{answeredCount} answered</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quiz Question */}
      {currentQuiz && (
        <div className="bg-white rounded-lg shadow p-6">
          <QuizQuestion
            quiz={currentQuiz}
            selectedOption={answers[currentQuestionIndex]?.selectedOption}
            onAnswerChange={(selectedOption) =>
              handleAnswerChange(selectedOption, currentQuiz._id)
            }
          />
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              currentQuestionIndex === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Previous
          </button>

          {currentQuestionIndex < totalQuestions - 1 ? (
            <button
              onClick={handleNextQuestion}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => {
                // Show the additional details section
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "smooth",
                });
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
            >
              Finish Exam
            </button>
          )}
        </div>

        {/* Question navigation dots */}
        <div className="mt-6 flex flex-wrap gap-2">
          {exam.quizzes.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                ${
                  index === currentQuestionIndex
                    ? "bg-indigo-600 text-white"
                    : answers[index]?.selectedOption !== null
                    ? "bg-green-100 text-green-800 border border-green-500"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }
              `}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Additional Details Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Additional Details
        </h2>
        <p className="text-gray-600 mb-4">
          Please provide the following information before submitting your exam.
        </p>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="studentId"
              className="block text-sm font-medium text-gray-700"
            >
              Student ID
            </label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={additionalDetails.studentId || ""}
              onChange={handleDetailChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your student ID"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={additionalDetails.location || ""}
              onChange={handleDetailChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your location"
            />
          </div>

          <div>
            <label
              htmlFor="comments"
              className="block text-sm font-medium text-gray-700"
            >
              Comments
            </label>
            <textarea
              id="comments"
              name="comments"
              rows="3"
              value={additionalDetails.comments || ""}
              onChange={handleDetailChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Any comments or feedback about the exam"
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
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

          {timeExpired && (
            <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Time has expired. Please submit your exam now.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              You have answered {answeredCount} out of {totalQuestions}{" "}
              questions.
            </span>

            <button
              onClick={handleSubmitExam}
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Exam"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
