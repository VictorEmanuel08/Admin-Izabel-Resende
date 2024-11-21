import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export function ProjectList() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      const projectsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectsList);
    };

    fetchProjects();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold">Projetos</h2>
      <ul>
        {projects.map((project) => (
          <li key={project.id} className="border-b py-2">
            <h3 className="font-semibold">{project.title}</h3>
            <p>{project.desc}</p>
            {project.files.map((fileUrl, index) => (
              <a
                key={index}
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                Arquivo {index + 1}
              </a>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
