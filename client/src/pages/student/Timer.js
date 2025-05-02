import React, { useState, useEffect } from "react";

const Timer = ({ duration, onTimeExpired }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds
  const [isWarning, setIsWarning] = useState(false);
  const [isDanger, setIsDanger] = useState(false);

  useEffect(() => {
    // Set up timer
    if (timeLeft <= 0) {
      onTimeExpired();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          onTimeExpired();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Clean up on unmount
    return () => clearInterval(timerId);
  }, [timeLeft, onTimeExpired]);

  // Set warning states
  useEffect(() => {
    // Warning when less than 25% time left
    setIsWarning(
      timeLeft < duration * 60 * 0.25 && timeLeft > duration * 60 * 0.1
    );
    // Danger when less than 10% time left
    setIsDanger(timeLeft <= duration * 60 * 0.1);
  }, [timeLeft, duration]);

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className={`
      flex items-center space-x-2 py-2 px-4 rounded-lg
      ${isDanger ? "bg-red-100" : isWarning ? "bg-yellow-100" : "bg-indigo-100"}
    `}
    >
      <svg
        className={`w-6 h-6 ${
          isDanger
            ? "text-red-600"
            : isWarning
            ? "text-yellow-600"
            : "text-indigo-600"
        }`}
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

      <div className="text-center">
        <div
          className={`text-xl font-bold ${
            isDanger
              ? "text-red-600"
              : isWarning
              ? "text-yellow-600"
              : "text-indigo-600"
          }`}
        >
          {formatTime(timeLeft)}
        </div>
        <div className="text-xs text-gray-600">Time Remaining</div>
      </div>
    </div>
  );
};

export default Timer;
