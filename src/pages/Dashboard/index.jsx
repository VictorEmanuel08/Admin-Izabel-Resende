import React, { useState } from "react";
import { ProjectForm } from "../../components/ProjectForm";

export function Dashboard() {
  const [projects, setProjects] = useState([]);

  const addProject = (project) => {
    setProjects([...projects, project]);
  };

  console.log(projects);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Meus Projetos</h1>
      <ProjectForm onAddProject={addProject} />
      <ul className="mt-4 space-y-2">
        {projects.map((proj, index) => (
          <li key={index} className="border p-2 rounded">
            <h2 className="font-bold">{proj.title}</h2>
            <p>{proj.desc}</p>
            <ul>
              {proj.files.map((file, idx) => (
                <li key={idx}>
                  <a href={file} target="_blank" rel="noreferrer">
                    Arquivo {idx + 1}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
