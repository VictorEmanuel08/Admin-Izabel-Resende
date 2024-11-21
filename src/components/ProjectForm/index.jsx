import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../utils/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export function ProjectForm({ onAddProject }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = async () => {
    const urls = [];
    for (const file of files) {
      const storageRef = ref(storage, `projects/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    setUploadedFiles(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleFileUpload();
    const newProject = { title, desc, files: uploadedFiles };

    try {
      // Adiciona o novo projeto à coleção "projects" no Firestore
      await addDoc(collection(db, "projects"), newProject);
      onAddProject(newProject); // Chama a função passada por props para atualizar o estado no componente pai
      setTitle("");
      setDesc("");
      setFiles([]);
      setUploadedFiles([]);
    } catch (error) {
      console.error("Erro ao adicionar projeto: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full"
      />
      <textarea
        placeholder="Descrição"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files))}
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-green-500 text-white p-2 w-full">
        Adicionar Projeto
      </button>
    </form>
  );
}
