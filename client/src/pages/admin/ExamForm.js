import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ExamForm = ({
  exam,
  onSubmit,
  buttonText = "Save",
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    duration: 60,
    specialRequirements: "",
    maxStudents: 30,
    coordinator: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (exam) {
      // Format date for the date input
      const examDate = new Date(exam.date);
      const formattedDate = examDate.toISOString().slice(0, 16);

      setFormData({
        title: exam.title || "",
        description: exam.description || "",
        date: formattedDate || "",
        duration: exam.duration || 60,
        specialRequirements: exam.specialRequirements || "",
        maxStudents: exam.maxStudents || 30,
        coordinator: exam.coordinator?._id || exam.coordinator || "",
        isActive: exam.isActive !== undefined ? exam.isActive : true,
      });
    }
  }, [exam]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
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

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const examDate = new Date(formData.date);
      if (examDate < new Date()) {
        newErrors.date = "Exam date cannot be in the past";
      }
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = "Duration must be greater than 0";
    }

    if (!formData.maxStudents || formData.maxStudents <= 0) {
      newErrors.maxStudents = "Max students must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Exam Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Basic information about the exam.
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
                  rows="4"
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
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date and Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  id="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700"
                >
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  id="duration"
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md ${
                    errors.duration ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="maxStudents"
                  className="block text-sm font-medium text-gray-700"
                >
                  Maximum Students <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="maxStudents"
                  id="maxStudents"
                  min="1"
                  value={formData.maxStudents}
                  onChange={handleChange}
                  className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md ${
                    errors.maxStudents ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.maxStudents && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.maxStudents}
                  </p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="coordinator"
                  className="block text-sm font-medium text-gray-700"
                >
                  Coordinator
                </label>
                <input
                  type="text"
                  name="coordinator"
                  id="coordinator"
                  value={formData.coordinator}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Coordinator ID"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the ID of the coordinator (admin user).
                </p>
              </div>

              <div className="col-span-6">
                <label
                  htmlFor="specialRequirements"
                  className="block text-sm font-medium text-gray-700"
                >
                  Special Requirements
                </label>
                <textarea
                  name="specialRequirements"
                  id="specialRequirements"
                  rows="3"
                  value={formData.specialRequirements}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Any special requirements or instructions for the exam"
                />
              </div>

              <div className="col-span-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="isActive"
                      className="font-medium text-gray-700"
                    >
                      Active
                    </label>
                    <p className="text-gray-500">
                      Make this exam visible and available to students.
                    </p>
                  </div>
                </div>
              </div>
            </div>
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

export default ExamForm;
