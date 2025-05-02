import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            <span className="text-indigo-600">404</span> - Page Not Found
          </h2>
          <div className="my-8">
            <svg
              className="mx-auto h-24 w-24 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="mt-2 text-center text-sm text-gray-600">
            The page you are looking for could not be found.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link
            to="/"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Home
          </Link>

          <div className="flex justify-center space-x-4">
            <Link
              to="/login"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Login
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              to="/register"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
