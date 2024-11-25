import { useState } from "react"; // Hook do React para gerenciar estados
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Funções do Firebase para manipulação de arquivos
import { db, storage } from "../../../utils/firebaseConfig"; // Importa configuração do Firebase
import { collection, addDoc } from "firebase/firestore"; // Funções para manipular o Firestore (banco de dados)
import { IoClose } from "react-icons/io5"; // Ícone de fechar
import { FaSpinner } from "react-icons/fa"; // Ícone de carregamento (spinner)
import Swal from "sweetalert2";
import "../../../index.css";

export function CreateProject({ closeModal, refreshProjects }) {
  // Definindo estados para título, descrição, arquivos, carregamento e progresso de upload
  const [title, setTitle] = useState(""); // Armazena o título do projeto
  const [desc, setDesc] = useState(""); // Armazena a descrição do projeto
  const [files, setFiles] = useState([]); // Armazena os arquivos que serão enviados
  const [loading, setLoading] = useState(false); // Controla o estado de carregamento
  const [uploadProgress, setUploadProgress] = useState({}); // Progresso de upload de arquivos

  // Configuração do Toast
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    iconColor: "white",
    customClass: {
      popup: "colored-toast",
    },
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  // Função para normalizar o título (remover caracteres especiais)
  const normalizeTitle = (title) => {
    return title.trim().replace(/[^a-zA-Z0-9]/g, "_"); // Substitui caracteres não alfanuméricos por '_'
  };

  // Função responsável por fazer o upload dos arquivos para o Firebase Storage
  const handleFileUpload = async () => {
    if (!title) {
      throw new Error("O título deve ser preenchido antes de fazer o upload."); // Verifica se o título está preenchido
    }

    const normalizedTitle = normalizeTitle(title); // Normaliza o título
    const urls = []; // Armazena as URLs dos arquivos após upload

    // Itera sobre os arquivos selecionados e faz o upload de cada um
    for (const file of files) {
      const storageRef = ref(
        storage,
        `projects/${normalizedTitle}/${file.name}` // Define o caminho para armazenar o arquivo no Firebase Storage
      );

      // Faz o upload do arquivo e atualiza o progresso
      await uploadBytes(storageRef, file, {
        onStateChanged: (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100; // Calcula o progresso do upload
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: progress, // Atualiza o progresso de upload para cada arquivo
          }));
        },
      });

      const url = await getDownloadURL(storageRef); // Obtém a URL pública do arquivo
      urls.push(url); // Armazena a URL do arquivo
    }

    return urls; // Retorna as URLs dos arquivos
  };

  // Função chamada ao submeter o formulário
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário

    setLoading(true); // Ativa o carregamento
    try {
      Toast.fire({
        icon: "success",
        title: "Projeto adicionado com sucesso",
      });
      // Aguarda 2 segundos antes de executar as próximas ações
      const uploadedFiles = await handleFileUpload(); // Realiza o upload dos arquivos
      const newProject = { title, desc, files: uploadedFiles }; // Cria o objeto do novo projeto

      // Adiciona o projeto no Firestore
      await addDoc(collection(db, "projects"), newProject);

      // Reseta os estados para o próximo projeto
      setTitle("");
      setDesc("");
      setFiles([]);
      setUploadProgress({}); // Reseta o progresso de upload

      refreshProjects(); // Atualiza a lista de projetos
      closeModal(); // Fecha o modal após adicionar o projeto
    } catch (error) {
      console.error("Erro ao adicionar projeto: ", error); // Exibe erro caso falhe
      Toast.fire({
        icon: "error",
        title: "Erro ao adicionar projeto",
      });
    } finally {
      setLoading(false); // Desativa o carregamento
    }
  };

  // Função para lidar com a alteração de arquivos
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files); // Converte os arquivos selecionados em array
    setFiles((prevFiles) => [...prevFiles, ...newFiles]); // Adiciona os novos arquivos ao estado
  };

  // Função para lidar com o evento de arrastar arquivos sobre a área de upload
  const handleDragOver = (e) => {
    e.preventDefault(); // Previne o comportamento padrão
    e.stopPropagation(); // Evita que o evento se propague
  };

  // Função para lidar com o evento de soltar arquivos na área de upload
  const handleDrop = (e) => {
    e.preventDefault(); // Previne o comportamento padrão
    e.stopPropagation(); // Evita que o evento se propague
    const newFiles = Array.from(e.dataTransfer.files); // Obtém os arquivos arrastados
    setFiles((prevFiles) => [...prevFiles, ...newFiles]); // Adiciona os arquivos ao estado
  };

  // Verifica se o formulário está pronto para ser submetido
  const finishForm = title.length > 0 && desc.length && files.length > 0;

  return (
    <form
      onSubmit={handleSubmit} // Submete o formulário
      className="flex flex-col justify-between items-center h-full bg-white"
    >
      {/* Cabeçalho do modal com título e botão de fechar */}
      <div className="flex justify-center items-center w-full mb-4">
        <p className="text-xl font-semibold flex-1 text-center">Novo Projeto</p>
        <p
          onClick={closeModal} // Chama a função de fechar o modal
          className="cursor-pointer hover:text-red-600 transition duration-300 ease-in-out"
        >
          <IoClose size={24} />
        </p>
      </div>

      {/* Campo de entrada para o título do projeto */}
      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => {
          const newTitle = e.target.value;
          if (newTitle.trimStart() === newTitle) {
            setTitle(e.target.value); // Atualiza o título
          }
        }}
        className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
      />

      {/* Campo de entrada para a descrição do projeto */}
      <input
        placeholder="Descrição"
        value={desc}
        onChange={(e) => {
          const newDesc = e.target.value;
          if (newDesc.trimStart() === newDesc) {
            setDesc(newDesc); // Atualiza a descrição
          }
        }}
        className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
      />

      {/* Área de upload de arquivos */}
      <div className="w-full mb-4">
        <label
          htmlFor="file-upload"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Selecione arquivos
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileChange} // Chama a função quando arquivos são selecionados
          className="hidden"
        />
        <div
          className="border border-gray-300 p-3 w-full mb-2 rounded-lg cursor-pointer flex items-center justify-center bg-gray-50"
          onClick={() => document.getElementById("file-upload").click()} // Simula o clique no input de arquivo
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <span className="text-gray-600">
            Clique ou arraste os arquivos aqui
          </span>
        </div>
        {files.length > 0 && (
          <div
            className="flex overflow-x-auto space-x-4 py-2"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {/* Exibe os arquivos selecionados */}
            {files.map((file, index) => (
              <div
                key={index}
                className="relative flex-shrink-0"
                style={{ scrollSnapAlign: "start" }}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                {uploadProgress[file.name] && (
                  <div className="absolute top-0 right-0 w-full h-full bg-opacity-50 bg-gray-800 flex items-center justify-center">
                    <span className="text-black">
                      {Math.round(uploadProgress[file.name])}%
                    </span>
                  </div>
                )}
                {/* Botão para remover um arquivo */}
                <button
                  type="button"
                  onClick={() => {
                    const newFiles = files.filter((_, i) => i !== index);
                    setFiles(newFiles); // Remove o arquivo do estado
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 text-xs"
                >
                  <IoClose size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botão de submissão do formulário */}
      <button
        type="submit"
        disabled={loading || !finishForm} // Desabilita se estiver carregando ou formulário incompleto
        className={`bg-blue-500 text-white py-2 px-4 rounded-lg w-full flex justify-center items-center ${
          loading || !finishForm ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? <FaSpinner className="animate-spin" /> : "Adicionar Projeto"}
      </button>
    </form>
  );
}
