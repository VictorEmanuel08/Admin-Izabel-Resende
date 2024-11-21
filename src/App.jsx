import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { SignUpPage } from "./pages/SignUpPage";
import { ProjectList } from "./pages/ProjectList";

function App() {
  const [authStatus, setAuthStatus] = useState(false);

  useEffect(() => {
    // Verifique o localStorage e defina o estado
    setAuthStatus(!!localStorage.getItem("authToken"));
  }, []); // Só será executado na montagem do componente

  const isAuthenticated = () => authStatus;

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota para o Login */}
        <Route
          path="/login"
          element={
            isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        {/* Rota para o Cadastro */}
        <Route
          path="/signup"
          element={
            isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <SignUpPage />
            )
          }
        />

        {/* Rota para o Dashboard */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated() ? <Dashboard /> : <Navigate to="/login" replace />
          }
        />
        {/* Rota para o Projects */}
        <Route
          path="/projects"
          element={
            isAuthenticated() ? (
              <ProjectList />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Redirecionamento padrão */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
