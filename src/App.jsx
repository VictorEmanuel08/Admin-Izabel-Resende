import { useState, useEffect } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { Login } from "./pages/Login";
import { SignUpPage } from "./pages/SignUpPage";
import { ProjectList } from "./pages/ProjectList";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./utils/firebaseConfig"; // Certifique-se de importar o auth

export function App() {
  const [authStatus, setAuthStatus] = useState(false);
  const [loading, setLoading] = useState(true); // Estado de carregamento

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthStatus(!!user); // Atualiza o estado de autenticação
      setLoading(false); // Define o carregamento como falso quando a autenticação for verificada
    });

    return () => unsubscribe();
  }, []); // O efeito é executado uma vez na montagem

  if (loading) {
    return <div>Carregando...</div>; // Exibe uma mensagem de carregamento enquanto a autenticação está sendo verificada
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={authStatus ? <Navigate to="/projects" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={
            authStatus ? <Navigate to="/projects" replace /> : <SignUpPage />
          }
        />
        <Route
          path="/projects"
          element={
            authStatus ? <ProjectList /> : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
