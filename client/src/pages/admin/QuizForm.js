import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const QuizForm = ({
  quiz,
  examId,
  onSubmit,
  buttonText = "Save Quiz",
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    questions: [
      {
        question: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
        marks: 1,
      },
    ],
    timeLimit: 5,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || "",
        description: quiz.description || "",
        questions: quiz.questions || [
          {
            question: "",
            options: [
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
            ],
            marks: 1,
          },
        ],
        timeLimit: quiz.timeLimit || 5,
      });
    }
  }, [quiz]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleQuestionChange = (e, index) => {
    const { name, value } = e.target;
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [name]: value,
    };

    setFormData({
      ...formData,
      questions: updatedQuestions,
    });

    // Clear error for this question
    if (errors[`question_${index}`]) {
      setErrors({
        ...errors,
        [`question_${index}`]: null,
      });
    }
  };

  const handleOptionChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      text: value,
    };

    setFormData({
      ...formData,
      questions: updatedQuestions,
    });

    // Clear error for this option
    if (errors[`question_${questionIndex}_option_${optionIndex}`]) {
      setErrors({
        ...errors,
        [`question_${questionIndex}_option_${optionIndex}`]: null,
      });
    }
  };

  const handleCorrectOptionChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...formData.questions];

    // Set all options to not correct first
    updatedQuestions[questionIndex].options = updatedQuestions[
      questionIndex
    ].options.map((option) => ({
      ...option,
      isCorrect: false,
    }));

    // Set the selected option as correct
    updatedQuestions[questionIndex].options[optionIndex].isCorrect = true;

    setFormData({
      ...formData,
      questions: updatedQuestions,
    });

    // Clear error for this question
    if (errors[`question_${questionIndex}_correctOption`]) {
      setErrors({
        ...errors,
        [`question_${questionIndex}_correctOption`]: null,
      });
    }
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: "",
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
          marks: 1,
        },
      ],
    });
  };

  const handleRemoveQuestion = (index) => {
    if (formData.questions.length > 1) {
      const updatedQuestions = [...formData.questions];
      updatedQuestions.splice(index, 1);

      setFormData({
        ...formData,
        questions: updatedQuestions,
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.timeLimit || formData.timeLimit <= 0) {
      newErrors.timeLimit = "Time limit must be greater than 0";
    }

    // Validate questions
    formData.questions.forEach((question, questionIndex) => {
      if (!question.question.trim()) {
        newErrors[`question_${questionIndex}`] = "Question text is required";
      }

      // Validate options
      let hasCorrectOption = false;
      question.options.forEach((option, optionIndex) => {
        if (!option.text.trim()) {
          newErrors[`question_${questionIndex}_option_${optionIndex}`] =
            "Option text is required";
        }

        if (option.isCorrect) {
          hasCorrectOption = true;
        }
      });

      if (!hasCorrectOption) {
        newErrors[`question_${questionIndex}_correctOption`] =
          "Please select a correct option";
      }

      if (!question.marks || question.marks <= 0) {
        newErrors[`question_${questionIndex}_marks`] =
          "Marks must be greater than 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      const submitData = {
        ...formData,
        examId,
      };

      onSubmit(submitData);
    } else {
      // Scroll to the first error
      const firstErrorId = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Quiz Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Basic information about the quiz.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="col-span-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="timeLimit"
                  className="block text-sm font-medium text-gray-700"
                >
                  Time Limit (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="timeLimit"
                  id="timeLimit"
                  min="1"
                  value={formData.timeLimit}
                  onChange={handleChange}
                  className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md ${
                    errors.timeLimit ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.timeLimit && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.timeLimit}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Quiz Questions
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add questions with multiple-choice options.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Question
              </button>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            {formData.questions.map((question, questionIndex) => (
              <div
                key={questionIndex}
                className="mb-8 p-4 border border-gray-200 rounded-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">
                    Question {questionIndex + 1}
                  </h4>
                  {formData.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(questionIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor={`question_${questionIndex}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Question Text <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="question"
                    id={`question_${questionIndex}`}
                    value={question.question}
                    onChange={(e) => handleQuestionChange(e, questionIndex)}
                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md ${
                      errors[`question_${questionIndex}`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`question_${questionIndex}`] && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors[`question_${questionIndex}`]}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options <span className="text-red-500">*</span>
                  </label>

                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center mb-2">
                      <div className="mr-2">
                        <input
                          type="radio"
                          id={`question_${questionIndex}_option_${optionIndex}_correct`}
                          name={`question_${questionIndex}_correct`}
                          checked={option.isCorrect}
                          onChange={() =>
                            handleCorrectOptionChange(
                              questionIndex,
                              optionIndex
                            )
                          }
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                        />
                      </div>
                      <input
                        type="text"
                        id={`question_${questionIndex}_option_${optionIndex}`}
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option.text}
                        onChange={(e) =>
                          handleOptionChange(e, questionIndex, optionIndex)
                        }
                        className={`flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md ${
                          errors[
                            `question_${questionIndex}_option_${optionIndex}`
                          ]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                  ))}

                  {errors[`question_${questionIndex}_correctOption`] && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors[`question_${questionIndex}_correctOption`]}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Select the radio button next to the correct option.
                  </p>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor={`question_${questionIndex}_marks`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="marks"
                    id={`question_${questionIndex}_marks`}
                    value={question.marks}
                    onChange={(e) => handleQuestionChange(e, questionIndex)}
                    min="1"
                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md ${
                      errors[`question_${questionIndex}_marks`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`question_${questionIndex}_marks`] && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors[`question_${questionIndex}_marks`]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
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
              Saving...
            </>
          ) : (
            buttonText
          )}
        </button>
      </div>
    </form>
  );
};

export default QuizForm;
