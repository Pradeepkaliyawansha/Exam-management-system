import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const { notifications, loading, error, unreadCount } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Only display a limited number of notifications to avoid large UI renders
  const displayedNotifications = notifications.slice(0, 5);

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Exam Management System
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {currentUser?.role === "student" && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-1 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  <span className="sr-only">View notifications</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && !error && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <div className="px-4 py-2 text-sm text-gray-700 font-semibold border-b flex justify-between items-center">
                        <span>Notifications</span>
                        {loading && (
                          <div className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {error ? (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            Unable to load notifications at this time.
                          </div>
                        ) : displayedNotifications.length === 0 ? (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            No notifications
                          </div>
                        ) : (
                          displayedNotifications.map((notification) => (
                            <div
                              key={notification._id || notification.id}
                              className={`px-4 py-2 text-sm ${
                                notification.isRead
                                  ? "text-gray-500"
                                  : "text-gray-900 font-semibold bg-blue-50"
                              }`}
                            >
                              <p>{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.createdAt
                                  ? new Date(
                                      notification.createdAt
                                    ).toLocaleString()
                                  : "Just now"}
                              </p>
                            </div>
                          ))
                        )}
                        {notifications.length > 5 && (
                          <div className="px-4 py-2 text-center">
                            <button
                              className="text-sm text-indigo-600 hover:text-indigo-800"
                              onClick={() => {
                                // Close dropdown and navigate to full notification page if available
                                setShowNotifications(false);
                                // You can add navigation here if you have a dedicated notifications page
                              }}
                            >
                              View all notifications
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex text-sm rounded-full focus:outline-none"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </div>
              </button>

              {showProfileDropdown && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-2 text-sm text-gray-700">
                      <p className="font-medium">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {currentUser?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
