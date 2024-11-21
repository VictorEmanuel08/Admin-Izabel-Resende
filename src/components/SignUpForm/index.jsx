import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../utils/firebaseConfig";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Criar o usuário no Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("Usuário criado no Authentication:", user);

      // Salvar nome do usuário no Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        createdAt: new Date(),
      });

      console.log("Usuário salvo no Firestore com sucesso.");
      setSuccess("Usuário cadastrado com sucesso!");
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Erro ao criar o usuário:", err.message);
      setError("Erro ao criar o usuário. Tente novamente.");
    }
  };

  return (
    <form
      onSubmit={handleSignUp}
      className="space-y-4 bg-white p-4 rounded shadow-md max-w-md mx-auto"
    >
      <h2 className="text-lg font-bold">Cadastre-se</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <input
        type="text"
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full"
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full"
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full"
        required
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 w-full rounded"
      >
        Cadastrar
      </button>
    </form>
  );
}
