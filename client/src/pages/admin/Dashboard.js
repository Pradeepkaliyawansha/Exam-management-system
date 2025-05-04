// client/src/pages/admin/Dashboard.js

import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllExams } from "../../api/exams";
import { getExamResults } from "../../api/results";
import { AuthContext } from "../../contexts/AuthContext";

const Dashboard = () => {
  const [exams, setExams] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [examStats, setExamStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    past: 0,
  });
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all exams
        const examsData = await getAllExams();
        setExams(examsData);

        // Calculate exam statistics
        const now = new Date();
        const stats = {
          total: examsData.length,
          active: examsData.filter((exam) => exam.isActive).length,
          upcoming: examsData.filter((exam) => new Date(exam.date) > now)
            .length,
          past: examsData.filter((exam) => new Date(exam.date) <= now).length,
        };
        setExamStats(stats);

        // Get all recent results from all exams
        let allResults = [];
        for (const exam of examsData) {
          try {
            const examResults = await getExamResults(exam._id);
            allResults = [...allResults, ...examResults];
          } catch (error) {
            console.error(
              `Error fetching results for exam ${exam._id}:`,
              error
            );
          }
        }

        // Sort by submission date and get the 5 most recent
        setRecentResults(
          allResults
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .slice(0, 5)
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="text-gray-600 mt-2 md:mt-0">
          Welcome, {currentUser?.name}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-indigo-100">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">Total Exams</h2>
              <p className="text-2xl font-semibold text-gray-800">
                {examStats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-green-100">
              <svg
                className="w-6 h-6 text-green-600"
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
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">
                Active Exams
              </h2>
              <p className="text-2xl font-semibold text-gray-800">
                {examStats.active}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-blue-100">
              <svg
                className="w-6 h-6 text-blue-600"
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
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">
                Upcoming Exams
              </h2>
              <p className="text-2xl font-semibold text-gray-800">
                {examStats.upcoming}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-yellow-100">
              <svg
                className="w-6 h-6 text-yellow-600"
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
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">Past Exams</h2>
              <p className="text-2xl font-semibold text-gray-800">
                {examStats.past}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Exams */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-800">Recent Exams</h2>
            <Link
              to="/admin/exams"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Coordinator
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exams.slice(0, 5).map((exam) => {
                const examDate = new Date(exam.date);
                const now = new Date();
                let statusClass = "";
                let statusText = "";

                if (!exam.isActive) {
                  statusClass = "bg-gray-100 text-gray-800";
                  statusText = "Inactive";
                } else if (examDate > now) {
                  statusClass = "bg-blue-100 text-blue-800";
                  statusText = "Upcoming";
                } else {
                  statusClass = "bg-green-100 text-green-800";
                  statusText = "Active";
                }

                return (
                  <tr key={exam._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {exam.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(exam.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.coordinator?.name || "Not assigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/admin/exams/${exam._id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View
                      </Link>
                      <Link
                        to={`/admin/exams/${exam._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Results */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-800">
              Recent Results
            </h2>
            <button
              onClick={() => navigate("/admin/exams")}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View All Results
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {recentResults.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No results available</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Student
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Exam
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Score
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentResults.map((result) => {
                  const score = result.totalScore || 0;
                  const total =
                    result.maxPossibleScore || result.totalPossible || 1;
                  const percentage = Math.round((score / total) * 100);

                  let scoreClass = "";
                  if (percentage >= 70) {
                    scoreClass = "text-green-600";
                  } else if (percentage >= 40) {
                    scoreClass = "text-yellow-600";
                  } else {
                    scoreClass = "text-red-600";
                  }

                  return (
                    <tr key={result._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.student?.name || "Unknown Student"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {result.student?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.exam?.title || "Unknown Exam"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${scoreClass}`}>
                          {score}/{total} ({percentage}%)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(result.submittedAt || result.endTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/results/${result._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Actions - UPDATED */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/exams/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-center"
          >
            Create New Exam
          </Link>

          {/* Removed Create New Quiz button */}

          <Link
            to="/admin/exams"
            className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-md text-center"
          >
            Manage Exams
          </Link>

          {/* Fixed View All Results button */}
          <button
            onClick={() => navigate("/admin/exams")}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-center"
          >
            View Exam Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
