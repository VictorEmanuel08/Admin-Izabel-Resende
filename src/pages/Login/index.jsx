import React, { useState } from "react";
import { LoginForm } from "../../components/LoginForm";
import { Navigate } from "react-router-dom";

export function Login() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true); // Marca o usuário como autenticado
    <Navigate to="/dashboard" replace />;
  };
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <LoginForm onLogin={handleLogin} />
      {isAuthenticated && <p>Bem-vindo, você está logado!</p>}
    </div>
  );
}
