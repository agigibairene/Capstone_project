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
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      setForbidden(false);

      try {
        const res = await fetch(`${API_URL}/projects/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN") || ""}`
          }
        });

        const data = await res.json();

        if (res.status === 403) {
          setForbidden(true);
          throw new Error(data.message || "Access denied");
        }

        if (!res.ok) throw new Error(data.message || "Failed to fetch projects");

        setProjects(data);
      } catch (err: any) {
        if (!forbidden) {
          setError(err.message || "An error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section id="projects" className="px-4 md:px-10 py-8">
      <h2 className="text-center text-2xl md:text-3xl text-limeTxt font-bold mb-10">~ Projects ~</h2>

      {loading && <Loader text="Loading projects..." />}

      {forbidden && (
        <div className="max-w-xl mx-auto bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
          <p>You are not verified, hence you can't view projects.</p>
        </div>
      )}

      {error && !forbidden && (
        <p className="text-center text-red-500">{error}</p>
      )}

      {!forbidden && !loading && (
        <div className="flex gap-6 flex-wrap justify-center">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              name={project.name}
              briefDescription={project.brief}
              target={project.target}
            />
          ))}
        </div>
      )}
    </section>
  );
}
