import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../utils/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa6";
import Swal from "sweetalert2";
import '../../index.css';

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Controla o estado de carregamento
  const finishForm = email.length > 0 && password.length > 0;

    // Configuração do Toast
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      iconColor: 'white',
      customClass: {
        popup: 'colored-toast',
      },
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Autentica o usuário
      await signInWithEmailAndPassword(auth, email, password);
      // Após autenticação bem-sucedida, navega para a lista de projetos
      navigate("/projects");
      Toast.fire({
        icon: "success",
        title: "Bem-vindo!",
      });
    } catch (err) {
      console.error("Erro ao autenticar:", err);
      setError("Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false); // Desativa o carregamento
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-6 w-full max-w-md mx-auto space-y-6"
    >
      <h2 className="text-2xl font-poppins font-semibold text-center text-gray-800">
        Login
      </h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading || !finishForm}
        className={`bg-blue-500 text-white py-3 px-4 rounded-lg w-full flex justify-center items-center text-center font-medium hover:bg-blue-600 transition duration-300 cursor-pointer ${
          loading || (!finishForm && "opacity-50 cursor-not-allowed")
        }`}
      >
        {loading ? <FaSpinner className="animate-spin" /> : "Entrar"}
      </button>
      <p className="text-center text-gray-600 text-sm">
        Esqueceu sua senha?{" "}
        <a
          href="/reset-password"
          className="text-blue-500 hover:text-blue-600 transition"
        >
          Clique aqui
        </a>
      </p>
    </form>
  );
}
