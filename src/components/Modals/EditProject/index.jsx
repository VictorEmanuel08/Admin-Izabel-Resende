// Importa hooks do React e funcionalidades do Firebase
import { useState, useEffect } from "react"; // Hooks para gerenciar estado e efeitos colaterais
import {
  ref, // Cria referências a objetos no Firebase Storage
  uploadBytes, // Faz upload de arquivos para o Firebase Storage
  getDownloadURL, // Obtém a URL de download de um arquivo no Firebase Storage
  deleteObject, // Deleta um arquivo do Firebase Storage
  listAll, // Lista todos os arquivos em um diretório do Firebase Storage
} from "firebase/storage";

// Importa a configuração do Firebase e funcionalidades do Firestore
import { db, storage } from "../../../utils/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore"; // Gerencia documentos no Firestore

// Importa ícones de uma biblioteca externa
import { IoClose } from "react-icons/io5"; // Ícone de fechar
import { FaSpinner } from "react-icons/fa"; // Ícone de carregamento (spinner)

// Componente funcional para editar projetos
export function EditProject({ project, closeModal, refreshProjects }) {
  // Gerenciamento de estado para título, descrição, arquivos e estado de carregamento
  const [title, setTitle] = useState(project.title || ""); // Título do projeto
  const [desc, setDesc] = useState(project.desc || ""); // Descrição do projeto
  const [files, setFiles] = useState([]); // Arquivos anexados
  const [loading, setLoading] = useState(false); // Indicador de carregamento

  // Efeito colateral para inicializar os arquivos do projeto
  useEffect(() => {
    if (project.files && project.files.length > 0) {
      // Mapeia as URLs dos arquivos para um formato utilizável no componente
      setFiles(project.files.map((url) => ({ url, file: null })));
    }
  }, [project]); // Executa sempre que o projeto muda

  // Normaliza o título removendo caracteres especiais e substituindo por "_"
  const normalizeTitle = (title) => title.trim().replace(/[^a-zA-Z0-9]/g, "_");

  // Move os arquivos de uma pasta para outra no Firebase Storage ao renomear o projeto
  const migrateStorageFolder = async (oldTitle, newTitle) => {
    const oldPath = `projects/${normalizeTitle(oldTitle)}/`; // Caminho antigo
    const newPath = `projects/${normalizeTitle(newTitle)}/`; // Novo caminho

    const oldFolderRef = ref(storage, oldPath); // Referência à pasta antiga
    const fileRefs = await listAll(oldFolderRef); // Lista todos os arquivos na pasta

    const newUrls = []; // Lista para armazenar as URLs dos arquivos na nova pasta
    for (const item of fileRefs.items) {
      // Obtém o arquivo atual e faz upload para o novo caminho
      const fileUrl = await getDownloadURL(item); // URL do arquivo atual
      const fileName = item.name;

      const newFileRef = ref(storage, `${newPath}${fileName}`); // Nova referência
      const response = await fetch(fileUrl); // Busca o arquivo via URL
      const fileBlob = await response.blob(); // Converte para Blob
      await uploadBytes(newFileRef, fileBlob); // Faz upload para o novo caminho

      const newUrl = await getDownloadURL(newFileRef); // Obtém a nova URL
      newUrls.push(newUrl); // Adiciona à lista
    }

    // Deleta os arquivos antigos
    for (const item of fileRefs.items) {
      await deleteObject(item);
    }

    return newUrls; // Retorna as novas URLs
  };

  // Faz upload dos arquivos adicionados ou preserva os arquivos existentes
  const handleFileUpload = async () => {
    const normalizedTitle = normalizeTitle(title); // Normaliza o título
    const uploadedUrls = []; // URLs dos arquivos após upload

    for (const { file, url } of files) {
      if (file) {
        // Upload de novos arquivos
        const storageRef = ref(
          storage,
          `projects/${normalizedTitle}/${file.name}`
        );
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        uploadedUrls.push(downloadUrl);
      } else {
        // Preserva URLs existentes
        uploadedUrls.push(url);
      }
    }

    return uploadedUrls; // Retorna as URLs dos arquivos
  };

  // Envia o formulário de edição
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Ativa o estado de carregamento

    try {
      let uploadedFiles;
      if (project.title !== title) {
        // Renomeia a pasta se o título foi alterado
        uploadedFiles = await migrateStorageFolder(project.title, title);
      } else {
        // Apenas faz upload de arquivos
        uploadedFiles = await handleFileUpload();
      }

      const updatedProject = { title, desc, files: uploadedFiles };

      // Atualiza o documento do projeto no Firestore
      const projectRef = doc(db, "projects", project.id);
      await updateDoc(projectRef, updatedProject);

      // Atualiza a lista de projetos e fecha o modal
      refreshProjects();
      closeModal();
    } catch (error) {
      console.error("Erro ao editar projeto: ", error);
    } finally {
      setLoading(false); // Desativa o estado de carregamento
    }
  };

  // Lida com a seleção de novos arquivos
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).map((file) => ({
      file,
      url: null,
    }));
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  // Deleta um arquivo específico da lista de arquivos
  const handleDeleteFile = (index) => {
    const fileToDelete = files[index];
    if (fileToDelete.url) {
      const fileRef = ref(storage, fileToDelete.url);
      deleteObject(fileRef).catch((error) => {
        console.error("Erro ao deletar arquivo do Firebase:", error);
      });
    }
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Lida com o arrastar e soltar de arquivos
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
      file,
      url: null,
    }));
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  // Verifica se o formulário pode ser enviado
  const finishForm = title.length > 0 && desc.length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-between items-center h-full bg-white"
    >
      {/* Header */}
      <div className="flex justify-center items-center w-full mb-4">
        <p className="text-xl font-semibold flex-1 text-center">
          Edite Seu Projeto
        </p>
        <p onClick={closeModal} className="cursor-pointer hover:text-red-600">
          <IoClose size={24} />
        </p>
      </div>

      {/* Inputs */}
      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border border-gray-300 p-3 w-full mb-4 rounded-lg"
      />
      <textarea
        placeholder="Descrição"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="border border-gray-300 p-3 w-full mb-4 rounded-lg"
      />

      {/* File Upload */}
      <div className="w-full mb-4">
        <label htmlFor="file-upload" className="block text-sm font-medium mb-2">
          Selecione arquivos
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <div
          className="border border-gray-300 p-3 w-full mb-2 rounded-lg cursor-pointer flex items-center justify-center bg-gray-50"
          onClick={() => document.getElementById("file-upload").click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <span className="text-gray-600">
            Clique ou arraste os arquivos aqui
          </span>
        </div>

        {/* Preview Files */}
        {files.length > 0 && (
          <div className="flex overflow-x-auto space-x-4 py-2">
            {files.map(({ file, url }, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={file ? URL.createObjectURL(file) : url}
                  alt={file ? file.name : "Preview"}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteFile(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 text-xs"
                >
                  <IoClose size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !finishForm}
        className={`bg-blue-500 text-white py-2 px-4 rounded-lg w-full flex justify-center items-center ${
          loading || !finishForm ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? <FaSpinner className="animate-spin" /> : "Salvar Projeto"}
      </button>
    </form>
  );
}
