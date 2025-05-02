import React from "react";

const QuizQuestion = ({ quiz, selectedOption, onAnswerChange }) => {
  const handleOptionSelect = (optionIndex) => {
    onAnswerChange(optionIndex);
  };

  if (!quiz) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No question available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">{quiz.title}</h2>
        <p className="mt-2 text-base text-gray-700">{quiz.question}</p>
      </div>

      <div className="space-y-3">
        {quiz.options.map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionSelect(index)}
            className={`
              flex items-start p-4 rounded-lg cursor-pointer transition-colors
              ${
                selectedOption === index
                  ? "bg-indigo-50 border-2 border-indigo-500"
                  : "bg-white border-2 border-gray-200 hover:bg-gray-50"
              }
            `}
          >
            <div className="flex-shrink-0">
              <div
                className={`
                flex items-center justify-center w-6 h-6 rounded-full border-2
                ${
                  selectedOption === index
                    ? "border-indigo-500 bg-indigo-500 text-white"
                    : "border-gray-300"
                }
              `}
              >
                {selectedOption === index && (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                )}
              </div>
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-gray-700 cursor-pointer">
                {option.text}
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizQuestion;
