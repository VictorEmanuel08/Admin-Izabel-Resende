import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../utils/firebaseConfig";

export function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Suponha que a autenticação tenha sido bem-sucedida
      await signInWithEmailAndPassword(auth, email, password);

      // Salvar o token no localStorage
      localStorage.setItem("authToken", "seu-token-de-autenticacao");

      // Redireciona para o dashboard
      onLogin(); // Se necessário, altere isso para acionar algo no componente pai.
      window.location.href = "/dashboard"; // Usar isso para forçar o redirecionamento
    } catch (err) {
      console.error(err); // Loga o erro completo
      setError("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" className="bg-blue-500 text-white p-2 w-full">
        Entrar
      </button>
    </form>
  );
}
