import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getResultById, generatePDF } from "../../api/results";

const ResultDetail = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await getResultById(resultId);
        setResult(data);
      } catch (error) {
        console.error("Error fetching result:", error);
        setError("Failed to load result details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  const handleGeneratePDF = async () => {
    try {
      setGeneratingPDF(true);
      setError(null); // Clear any previous errors

      console.log("Generating PDF for result:", resultId);
      const response = await generatePDF(resultId);

      console.log("PDF generation response:", response);

      // Open PDF in new tab
      if (response && response.pdfUrl) {
        const pdfUrl = process.env.REACT_APP_API_URL
          ? `${process.env.REACT_APP_API_URL}${response.pdfUrl}`
          : `http://localhost:5000${response.pdfUrl}`;

        window.open(pdfUrl, "_blank");

        // Update result state with PDF URL
        setResult((prevResult) => ({
          ...prevResult,
          pdfGenerated: true,
          pdfUrl: response.pdfUrl,
        }));
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);

      // Extract error message
      const errorMessage =
        error.response?.data?.msg ||
        error.message ||
        "Failed to generate PDF certificate. Please try again later.";

      setError(errorMessage);
    } finally {
      setGeneratingPDF(false);
    }
  };
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate percentage
  const calculatePercentage = (score, total) => {
    if (!total) return 0;
    return Math.round((score / total) * 100);
  };

  // Calculate result status
  const getResultStatus = (percentage) => {
    if (percentage >= 80) {
      return {
        label: "Excellent",
        color: "bg-green-100 text-green-800",
        description:
          "Congratulations! You have demonstrated an excellent understanding of the material.",
      };
    } else if (percentage >= 60) {
      return {
        label: "Good",
        color: "bg-blue-100 text-blue-800",
        description:
          "Well done! You have demonstrated a good understanding of the material.",
      };
    } else if (percentage >= 40) {
      return {
        label: "Satisfactory",
        color: "bg-yellow-100 text-yellow-800",
        description:
          "You have demonstrated a satisfactory understanding of the material.",
      };
    } else {
      return {
        label: "Needs Improvement",
        color: "bg-red-100 text-red-800",
        description:
          "You might need to revisit the material and improve your understanding.",
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

  if (!result) {
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
            <p className="text-sm text-yellow-700">Result not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const percentage = calculatePercentage(
    result.totalScore,
    result.maxPossibleScore || result.totalPossible
  );
  const status = getResultStatus(percentage);
  const examStartTime = result.startTime ? new Date(result.startTime) : null;
  const examEndTime = result.endTime ? new Date(result.endTime) : null;

  // Calculate duration in minutes
  const durationInMinutes =
    examStartTime && examEndTime
      ? Math.round((examEndTime - examStartTime) / (1000 * 60))
      : "N/A";

  return (
    <div className="space-y-6">
      {/* Result Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-indigo-700 text-white">
          <h1 className="text-2xl font-bold">
            {result.exam?.title || "Exam Result"}
          </h1>
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
            <span>{formatDate(examStartTime)}</span>
          </div>
        </div>

        {/* Result Summary */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  Result Summary
                </h2>
                <p className="text-gray-600">{result.exam?.description}</p>
              </div>

              <div
                className={`mt-4 md:mt-0 px-4 py-2 rounded-lg ${status.color}`}
              >
                <span className="font-semibold">{status.label}</span>
              </div>
            </div>

            {/* Score Details */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-indigo-700">
                      {percentage}%
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Score</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {result.totalScore} /{" "}
                      {result.maxPossibleScore || result.totalPossible}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-8">
                  <div>
                    <p className="text-sm text-gray-500">Time Spent</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {durationInMinutes} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {formatDate(examStartTime).split(",")[0]}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Message */}
            <div
              className={`p-4 rounded-lg ${status.color.replace(
                "800",
                "100"
              )} border-l-4 ${status.color.replace("100 text-", "border-")}`}
            >
              <p className="text-sm">{status.description}</p>
            </div>
          </div>

          {/* Answers Section */}
          {result.answers && result.answers.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Your Answers
              </h2>
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        #
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Question
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Your Answer
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Correct
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {result.answers.map((answer, index) => (
                      <tr
                        key={index}
                        className={
                          answer.isCorrect ? "bg-green-50" : "bg-red-50"
                        }
                      >
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {answer.quiz?.title || `Question ${index + 1}`}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          Option {answer.selectedOption + 1}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {answer.isCorrect ? (
                            <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                              Correct
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                              Incorrect
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Feedback Section */}
          {result.feedback && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Instructor Feedback
              </h2>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-gray-700 whitespace-pre-line">
                  {result.feedback}
                </p>
              </div>
            </div>
          )}

          {/* Additional Details */}
          {result.additionalDetails &&
            Object.keys(result.additionalDetails).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Additional Details
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    {Object.entries(result.additionalDetails).map(
                      ([key, value]) => (
                        <div key={key} className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            {key}
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {value}
                          </dd>
                        </div>
                      )
                    )}
                  </dl>
                </div>
              </div>
            )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back
          </button>

          {result.pdfGenerated && result.pdfUrl ? (
            <a
              href={result.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View Certificate
            </a>
          ) : (
            <button
              onClick={handleGeneratePDF}
              disabled={generatingPDF}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center"
            >
              {generatingPDF ? (
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
                  Generating...
                </>
              ) : (
                "Generate Certificate"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDetail;
