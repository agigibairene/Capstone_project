/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import ProjectCard from "../Utils/ProjectCard";
import { API_URL } from "../Utils/constants";
import Loader from "../Utils/Loader";


interface Project {
  id: number;
  name: string;
  title: string;
  brief: string;
  target: string;
}

export default function AllProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/projects/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
          }
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch projects");

        setProjects(data.data); 
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section id="projects">
      <h2 className="text-center text-2xl md:text-3xl text-limeTxt font-bold mb-10">~ Projects ~</h2>

      {loading && <Loader text="Loading projects"/>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="flex gap-6 flex-wrap">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            name={project.name}
            briefDescription={project.brief}
            target={project.target}
          />
        ))}
      </div>
    </section>
  );
}
