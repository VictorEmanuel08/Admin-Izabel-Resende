import { useEffect, useState } from "react";
import { db, auth, storage } from "../../utils/firebaseConfig";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Project } from "../../components/Project";
import { ref, deleteObject, listAll } from "firebase/storage";
import Modal from "react-modal";
import { CreateProject } from "../../components/Modals/CreateProject";
import Swal from "sweetalert2";
import "../../index.css";

export function ProjectList() {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Configuração do Modal
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      width: "40%",
      height: "75%",
      borderRadius: "0.5rem",
    },
  };

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

  // Funções de Modal
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // Normalização do título do projeto
  const normalizeTitle = (title) => title.trim().replace(/[^a-zA-Z0-9]/g, "_");

  // Busca de projetos
  const fetchProjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "projects"));
      const projectsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectsList);
    } catch (error) {
      console.error("Erro ao buscar projetos: ", error);
    }
  };

  // Atualiza a lista de projetos
  const refreshProjects = async () => {
    setLoading(true);
    await fetchProjects();
    setLoading(false);
  };

  // Deletar projeto
  const handleDelete = async (id, projectTitle) => {
    try {
      Toast.fire({
        icon: "error",
        title: "Projeto excluído com sucesso",
      });
      await deleteDoc(doc(db, "projects", id));
      setProjects((prev) => prev.filter((project) => project.id !== id));

      const normalizedTitle = normalizeTitle(projectTitle);
      const folderRef = ref(storage, `projects/${normalizedTitle}`);

      const listResult = await listAll(folderRef);
      for (const item of listResult.items) {
        await deleteObject(item);
      }
    } catch (error) {
      console.error("Erro ao excluir projeto: ", error);
      Toast.fire({
        icon: "error",
        title: "Erro ao excluir projeto",
      });
    }
  };

  // Confirmação antes de deletar
  const showConfirmationToDelete = (id, projectTitle) => {
    Swal.fire({
      title: "Excluir projeto",
      text: "Você tem certeza que deseja excluir este projeto?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim",
      cancelButtonText: "Não",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(id, projectTitle);
      }
    });
  };

  // Confirmação antes de deletar
  const showConfirmationToLogout = () => {
    Swal.fire({
      title: "Sair",
      text: "Você tem certeza que deseja sasir?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim",
      cancelButtonText: "Não",
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogout();
      }
    });
  };

  // Logout do usuário
  const handleLogout = async () => {
    try {
      Toast.fire({
        icon: "error",
        title: "Saindo...",
      });

      // Aguarda 2 segundos antes de executar as próximas ações
      setTimeout(async () => {
        await signOut(auth);
        localStorage.removeItem("authToken");
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Erro ao deslogar: ", error);
    }
  };

  // Verifica autenticação do usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Busca projetos ao carregar
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-granito-pitaia p-6">
      <div className="flex justify-between mb-6">
        <button
          onClick={openModal}
          className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out"
        >
          Adicionar Novo Projeto
        </button>
        <button
          onClick={showConfirmationToLogout}
          className="bg-red-600 text-white px-6 py-2 rounded-full shadow-lg hover:bg-red-700 transition duration-300 ease-in-out"
        >
          Sair
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Lista de Projetos
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project) => (
          <Project
            key={project.id}
            project={project}
            onDelete={() => showConfirmationToDelete(project.id, project.title)}
            refreshProjects={refreshProjects}
          />
        ))}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Adicionar Projeto"
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
      >
        <CreateProject
          closeModal={closeModal}
          refreshProjects={refreshProjects}
        />
      </Modal>
    </div>
  );
}
