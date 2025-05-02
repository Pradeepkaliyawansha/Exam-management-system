import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
