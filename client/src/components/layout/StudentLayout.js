import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";

const StudentLayout = () => {
  const { currentUser, loading, isStudent } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If not logged in or not a student, redirect to login
  if (!currentUser || !isStudent()) {
    return <Navigate to="/login" replace />;
  }

  const studentNavItems = [
    { label: "Dashboard", path: "/student/dashboard", icon: "dashboard" },
    { label: "Available Exams", path: "/student/exams", icon: "exam" },
    { label: "My Results", path: "/student/results", icon: "results" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={studentNavItems} role="student" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
