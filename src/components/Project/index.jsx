import { FiEdit } from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";
import Modal from "react-modal";
import { useState } from "react";
import { EditProject } from "../Modals/EditProject";

// eslint-disable-next-line react/prop-types
export function Project({ project, onDelete, refreshProjects }) {
  const [modalIsOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

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

  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-lg hover:shadow-xl transition duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800">
            {/* eslint-disable-next-line react/prop-types */}
            {project.title}
          </h2>
          {/* eslint-disable-next-line react/prop-types */}
          <p className="text-gray-600">{project.desc}</p>
        </div>
        <div className="flex justify-end">
          <img
            // eslint-disable-next-line react/prop-types
            src={project.files[0]}
            alt="project-thumbnail"
            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
          />
        </div>
      </div>
      <div className="flex space-x-4 mt-4">
        <button
          onClick={openModal}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition duration-300"
        >
          <FiEdit size={18} />
          <span>Editar</span>
        </button>
        <button
          // eslint-disable-next-line react/prop-types
          onClick={() => onDelete(project.id)}
          className="flex items-center space-x-2 text-red-600 hover:text-red-800 transition duration-300"
        >
          <FaRegTrashAlt size={18} />
          <span>Excluir</span>
        </button>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Adicionar Projeto"
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
      >
        <EditProject
          project={project}
          closeModal={closeModal}
          refreshProjects={refreshProjects}
        />
      </Modal>
    </div>
  );
}
