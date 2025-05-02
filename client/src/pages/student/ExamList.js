import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAvailableExams } from "../../api/exams";

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'upcoming', 'past'

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const data = await getAvailableExams();
        setExams(data);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

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

  // Filter exams based on date
  const filterExams = () => {
    const now = new Date();

    if (filter === "upcoming") {
      return exams.filter((exam) => new Date(exam.date) > now);
    } else if (filter === "past") {
      return exams.filter((exam) => new Date(exam.date) <= now);
    }

    return exams;
  };

  // Get exam status
  const getExamStatus = (exam) => {
    const now = new Date();
    const examDate = new Date(exam.date);

    if (exam.taken) {
      return {
        status: "completed",
        label: "Completed",
        color: "bg-gray-100 text-gray-800",
      };
    } else if (examDate > now) {
      return {
        status: "upcoming",
        label: "Upcoming",
        color: "bg-blue-100 text-blue-800",
      };
    } else {
      return {
        status: "available",
        label: "Available Now",
        color: "bg-green-100 text-green-800",
      };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredExams = filterExams();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Available Exams
        </h1>

        <div className="flex space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === "upcoming"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === "past"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {filteredExams.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">
            No exams found for the selected filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const examStatus = getExamStatus(exam);

            return (
              <div
                key={exam._id}
                className="bg-white rounded-lg shadow overflow-hidden flex flex-col"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      {exam.title}
                    </h2>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${examStatus.color}`}
                    >
                      {examStatus.label}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {exam.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
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
                      {formatDate(exam.date)}
                    </div>

                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
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
                      Duration: {exam.duration} minutes
                    </div>

                    {exam.coordinator && (
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Coordinator: {exam.coordinator.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 mt-auto">
                  {exam.taken ? (
                    <Link
                      to={`/student/results/${exam.resultId}`}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      View Results
                    </Link>
                  ) : examStatus.status === "available" ? (
                    <Link
                      to={`/student/exams/${exam._id}`}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      Start Exam
                    </Link>
                  ) : (
                    <Link
                      to={`/student/exams/${exam._id}`}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExamList;
