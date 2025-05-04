import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getQuizzesByExam, deleteQuiz } from "../../api/quizzes";
import { getExamById } from "../../api/exams";

const QuizManagement = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [examData, quizData] = await Promise.all([
          getExamById(examId),
          getQuizzesByExam(examId),
        ]);
        setExam(examData);
        setQuizzes(quizData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load exam and quiz data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId]);

  const handleDeleteQuiz = async (quizId) => {
    try {
      await deleteQuiz(quizId);
      setQuizzes(quizzes.filter((quiz) => quiz._id !== quizId));
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting quiz:", error);
      setError("Failed to delete quiz. Please try again later.");
    }
  };

  const calculateQuizTotal = (quiz) => {
    return quiz.questions.reduce(
      (total, question) => total + question.marks,
      0
    );
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Quiz Management
          </h2>
          {exam && (
            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg
                  className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 016 4.193V3.75zm6.5 0v.325a41.622 41.622 0 00-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25zM10 10a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1V11a1 1 0 00-1-1H10z"
                    clipRule="evenodd"
                  />
                  <path d="M3 15.055v-.684c.126.053.255.1.39.142 2.092.642 4.313.987 6.61.987 2.297 0 4.518-.345 6.61-.987.135-.041.264-.089.39-.142v.684c0 1.347-.985 2.53-2.363 2.686a41.454 41.454 0 01-9.274 0C3.985 17.585 3 16.402 3 15.055z" />
                </svg>
                Exam: {exam.title}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg
                  className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                </svg>
                {quizzes.length} Quizzes
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            to={`/admin/exams/${examId}/quizzes/create`}
            className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <svg
              className="-ml-0.5 mr-1.5 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add Quiz
          </Link>
        </div>
      </div>

      {/* Quiz List */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-5 sm:p-6">
          {quizzes.length === 0 ? (
            <div className="text-center py-6">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No quizzes
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new quiz for this exam.
              </p>
              <div className="mt-6">
                <Link
                  to={`/admin/exams/${examId}/quizzes/create`}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  <svg
                    className="-ml-0.5 mr-1.5 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  Add Quiz
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {quizzes.map((quiz) => (
                <div key={quiz._id} className="py-6 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {quiz.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {quiz.description}
                          </p>
                        </div>
                        <div className="ml-6 flex-shrink-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Total Marks:</span>{" "}
                            {calculateQuizTotal(quiz)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center">
                        <div className="flex items-center text-sm text-gray-500">
                          <svg
                            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Time Limit: {quiz.timeLimit} minutes
                        </div>
                        <div className="ml-6 flex items-center text-sm text-gray-500">
                          <svg
                            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zm4 9a3.5 3.5 0 113.5-3.5v.75h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-.75A.75.75 0 018 8.75V8zm0 0V7.25h1.5v.75h-1.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Questions: {quiz.questions.length}
                        </div>
                        <div className="ml-6 flex items-center text-sm text-gray-500">
                          <svg
                            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Created:{" "}
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 flex space-x-3">
                      <Link
                        to={`/admin/quizzes/${quiz._id}/edit`}
                        className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(quiz._id)}
                        className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delete Quiz
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete this quiz? This action cannot be
                undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteQuiz(confirmDelete)}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManagement;
