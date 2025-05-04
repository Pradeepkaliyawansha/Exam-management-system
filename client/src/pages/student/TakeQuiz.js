import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentQuizById, submitQuiz } from "../../api/quizzes";
import Timer from "./Timer";

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const data = await getStudentQuizById(quizId);
        setQuiz(data);
        // Initialize answers array with null values
        setAnswers(new Array(data.questions.length).fill(null));
      } catch (error) {
        console.error("Error fetching quiz:", error);
        setError("Failed to load quiz. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleTimeExpired = () => {
    setTimeExpired(true);
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Format answers for submission
      const formattedAnswers = answers.map((answer, index) => ({
        questionIndex: index,
        selectedOptionIndex: answer,
      }));

      await submitQuiz(quizId, formattedAnswers);
      navigate("/student/results");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setError("Failed to submit quiz. Please try again.");
      setIsSubmitting(false);
    }
  };

  const getAnsweredCount = () => {
    return answers.filter((answer) => answer !== null).length;
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

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
            <p className="text-gray-600 mt-1">{quiz.description}</p>
          </div>

          {/* Timer */}
          <div className="mt-4 md:mt-0">
            <Timer
              duration={quiz.timeLimit}
              onTimeExpired={handleTimeExpired}
              disabled={timeExpired || isSubmitting}
            />
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>
              {getAnsweredCount()} of {quiz.questions.length} questions answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full"
              style={{
                width: `${(getAnsweredCount() / quiz.questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Question {questionIndex + 1}
            </h3>
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">
              {question.question}
            </p>

            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-colors
                    ${
                      answers[questionIndex] === optionIndex
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-200 hover:bg-gray-50"
                    }
                    ${
                      timeExpired || isSubmitting
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }
                  `}
                >
                  <div className="flex items-center">
                    <div
                      className={`
                        w-4 h-4 rounded-full border-2 mr-3
                        ${
                          answers[questionIndex] === optionIndex
                            ? "border-indigo-500 bg-indigo-500"
                            : "border-gray-300"
                        }
                      `}
                    >
                      {answers[questionIndex] === optionIndex && (
                        <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />
                      )}
                    </div>
                    <span className="text-gray-700">{option.text}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 text-sm text-gray-500">
              Points: {question.marks}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-end">
          {timeExpired ? (
            <p className="text-red-600 font-medium">
              Time has expired. Your quiz has been submitted.
            </p>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                "Submit Quiz"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
