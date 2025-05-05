import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const QuizForm = ({
  quiz,
  onSubmit,
  buttonText = "Save",
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeLimit: 10, // Default to 10 minutes
    questions: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || "",
        description: quiz.description || "",
        timeLimit: quiz.timeLimit || 10,
        questions: quiz.questions || [],
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

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      questions: newQuestions,
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex].text = value;
    setFormData({
      ...formData,
      questions: newQuestions,
    });
  };

  const addQuestion = () => {
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

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      questions: newQuestions,
    });
  };

  const setCorrectAnswer = (questionIndex, optionIndex) => {
    const newQuestions = [...formData.questions];
    // Update all options to be incorrect
    newQuestions[questionIndex].options.forEach((option) => {
      option.isCorrect = false;
    });
    // Set the selected option as correct
    newQuestions[questionIndex].options[optionIndex].isCorrect = true;
    setFormData({
      ...formData,
      questions: newQuestions,
    });
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

    if (formData.questions.length === 0) {
      newErrors.questions = "At least one question is required";
    }

    // Validate each question
    formData.questions.forEach((question, qIndex) => {
      // Check if question text is empty
      if (!question.question.trim()) {
        newErrors[`question-${qIndex}`] = "Question text is required";
      }

      // Check if all options have text
      let hasEmptyOption = false;
      question.options.forEach((option, oIndex) => {
        if (!option.text.trim()) {
          newErrors[`question-${qIndex}-option-${oIndex}`] =
            "Option text is required";
          hasEmptyOption = true;
        }
      });

      // Check if exactly one option is selected as correct
      const correctAnswers = question.options.filter(
        (option) => option.isCorrect
      );
      if (correctAnswers.length === 0) {
        newErrors[`question-${qIndex}-correct`] = "Select a correct answer";
      } else if (correctAnswers.length > 1) {
        newErrors[`question-${qIndex}-correct`] =
          "Only one correct answer allowed";
      }

      // Check marks value
      if (!question.marks || question.marks <= 0) {
        newErrors[`question-${qIndex}-marks`] = "Marks must be greater than 0";
      }
    });

    setErrors(newErrors);

    console.log("Validation errors:", newErrors); // Debug log
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      // Ensure data is properly formatted before sending
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        timeLimit: Number(formData.timeLimit), // Ensure it's a number
        questions: formData.questions.map((question) => ({
          question: question.question.trim(),
          options: question.options.map((option) => ({
            text: option.text.trim(),
            isCorrect: Boolean(option.isCorrect), // Ensure it's a boolean
          })),
          marks: Number(question.marks), // Ensure it's a number
        })),
      };

      console.log("Submitting quiz data:", submitData); // Debug log
      onSubmit(submitData);
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

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Questions
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add and manage quiz questions.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            {errors.questions && (
              <p className="mb-4 text-sm text-red-500">{errors.questions}</p>
            )}

            {formData.questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="mb-8 p-4 border border-gray-200 rounded-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-medium">Question {qIndex + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Question <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={question.question}
                    onChange={(e) =>
                      handleQuestionChange(qIndex, "question", e.target.value)
                    }
                    rows="2"
                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md ${
                      errors[`question-${qIndex}`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`question-${qIndex}`] && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors[`question-${qIndex}`]}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options <span className="text-red-500">*</span>
                  </label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="mb-2 flex items-center">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={option.isCorrect}
                        onChange={() => setCorrectAnswer(qIndex, oIndex)}
                        className="mr-2"
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) =>
                          handleOptionChange(qIndex, oIndex, e.target.value)
                        }
                        className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md ${
                          errors[`question-${qIndex}-option-${oIndex}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                  {errors[`question-${qIndex}-correct`] && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors[`question-${qIndex}-correct`]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Marks
                  </label>
                  <input
                    type="number"
                    value={question.marks}
                    onChange={(e) =>
                      handleQuestionChange(
                        qIndex,
                        "marks",
                        parseInt(e.target.value)
                      )
                    }
                    min="1"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-24 shadow-sm sm:text-sm rounded-md border-gray-300"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
