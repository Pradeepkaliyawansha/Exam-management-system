import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentExamById, startExam } from "../../api/exams";

const ExamDetail = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [examTaken, setExamTaken] = useState(false);
  const [resultId, setResultId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        setLoading(true);
        const data = await getStudentExamById(examId);
        setExam(data.exam);
        setQuizzes(data.quizzes || []);
        setExamTaken(data.taken || false);
        setResultId(data.resultId || null);
      } catch (error) {
        console.error("Error fetching exam details:", error);
        setError("Failed to load exam details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetails();
  }, [examId]);

  const handleStartExam = async () => {
    try {
      setLoading(true);
      const data = await startExam(examId);
      navigate(`/student/take-exam/${examId}`, {
        state: {
          exam: data.exam,
          result: data.result,
        },
      });
    } catch (error) {
      console.error("Error starting exam:", error);
      setError(
        error.response?.data?.msg ||
          "Failed to start exam. Please try again later."
      );
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if exam is available to take
  const isExamAvailable = () => {
    if (!exam) return false;
    if (examTaken) return false;

    const now = new Date();
    const examDate = new Date(exam.date);
    return examDate <= now && exam.isActive;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!exam) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
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
            <p className="text-sm text-yellow-700">Exam not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Exam Header */}
        <div className="px-6 py-4 bg-indigo-700 text-white">
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <div className="flex items-center mt-2">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatDate(exam.date)}</span>
            <span className="mx-2">•</span>
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{exam.duration} minutes</span>
          </div>
        </div>

        {/* Exam Details */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Description
            </h2>
            <p className="text-gray-600">{exam.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Exam Details
              </h2>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 mr-2 text-indigo-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    <strong>Duration:</strong> {exam.duration} minutes
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 mr-2 text-indigo-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    <strong>Number of Quizzes:</strong> {quizzes.length}
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 mr-2 text-indigo-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    <strong>Max Students:</strong> {exam.maxStudents}
                  </span>
                </li>
                {exam.coordinator && (
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 mr-2 text-indigo-600 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      <strong>Coordinator:</strong> {exam.coordinator.name}
                    </span>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Special Requirements
              </h2>
              {exam.specialRequirements ? (
                <p className="text-gray-600">{exam.specialRequirements}</p>
              ) : (
                <p className="text-gray-500 italic">
                  No special requirements for this exam.
                </p>
              )}
            </div>
          </div>

          {/* Status Card */}
          <div
            className={`p-4 rounded-lg ${
              examTaken
                ? "bg-gray-100"
                : isExamAvailable()
                ? "bg-green-100"
                : "bg-yellow-100"
            }`}
          >
            <div className="flex items-start">
              <div
                className={`rounded-full p-2 ${
                  examTaken
                    ? "bg-gray-200"
                    : isExamAvailable()
                    ? "bg-green-200"
                    : "bg-yellow-200"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    examTaken
                      ? "text-gray-600"
                      : isExamAvailable()
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {examTaken ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  ) : isExamAvailable() ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>
              </div>
              <div className="ml-4">
                <h3
                  className={`text-lg font-semibold ${
                    examTaken
                      ? "text-gray-800"
                      : isExamAvailable()
                      ? "text-green-800"
                      : "text-yellow-800"
                  }`}
                >
                  {examTaken
                    ? "Exam Completed"
                    : isExamAvailable()
                    ? "Exam Available"
                    : "Exam Not Available Yet"}
                </h3>
                <p
                  className={`text-sm ${
                    examTaken
                      ? "text-gray-600"
                      : isExamAvailable()
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {examTaken
                    ? "You have already completed this exam. You can view your results."
                    : isExamAvailable()
                    ? "You can start this exam now. Make sure you have enough time to complete it."
                    : `This exam will be available on ${formatDate(
                        exam.date
                      )}.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back
          </button>

          {examTaken ? (
            <button
              onClick={() => navigate(`/student/results/${resultId}`)}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View Results
            </button>
          ) : isExamAvailable() ? (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Start Exam
            </button>
          ) : null}
        </div>
      </div>

      {/* Confirm Start Exam Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Start Exam Confirmation
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                You are about to start the exam. Once started, the timer will
                begin and you will need to complete all quizzes within{" "}
                {exam.duration} minutes.
              </p>
              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Make sure you have a stable internet connection and enough
                      time to complete the exam.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
              <button
                type="button"
                onClick={handleStartExam}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Start Exam
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamDetail;
