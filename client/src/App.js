import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

// Layouts
import AdminLayout from "./components/layout/AdminLayout";
import StudentLayout from "./components/layout/StudentLayout";

// Auth Pages
import Login from "./pages/auth/Login";
// import Logout from "./pages/auth/Logout";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import ExamManagement from "./pages/admin/ExamManagement";
import ExamCreate from "./pages/admin/ExamCreate";
import ExamEdit from "./pages/admin/ExamEdit";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import ExamList from "./pages/student/ExamList";
import ExamDetail from "./pages/student/ExamDetail";
import TakeExam from "./pages/student/TakeExam";
import ResultDetail from "./pages/student/ResultDetails";

// Home Page
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            {/* <Route path="/logout" element={<Logout />} /> */}

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route
                path=""
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="exams" element={<ExamManagement />} />
              <Route path="exams/create" element={<ExamCreate />} />
              <Route path="exams/:examId" element={<AdminDashboard />} />
              <Route path="exams/:examId/edit" element={<ExamEdit />} />
              <Route
                path="exams/:examId/quizzes"
                element={<ExamManagement />}
              />
              <Route
                path="exams/:examId/quizzes/create"
                element={<ExamCreate />}
              />
              <Route path="quizzes/:quizId/edit" element={<ExamEdit />} />
              {/* <Route path="results" element={<AdminResults />} /> */}
              <Route path="results/:resultId" element={<ResultDetail />} />
            </Route>

            {/* Student Routes */}
            <Route path="/student" element={<StudentLayout />}>
              <Route
                path=""
                element={<Navigate to="/student/dashboard" replace />}
              />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="exams" element={<ExamList />} />
              <Route path="exams/:examId" element={<ExamDetail />} />
              <Route path="take-exam/:examId" element={<TakeExam />} />
              <Route path="results/:resultId" element={<ResultDetail />} />
            </Route>

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
