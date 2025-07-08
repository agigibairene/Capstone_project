/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import ProjectCard from "../Utils/ProjectCard";
import Loader from "../Utils/Loader";

// Updated Project interface to match your API response
interface Project {
  id: string;
  title: string;
  brief: string;
  target_amount: string;
  farmer_name: string;
  deadline?: string;
  days_remaining?: number;
  status: string;
  created_at: string;
  watermarked_proposal?: string;
  name?: string;
  description?: string;
  benefits?: string;
  email?: string;
  farmer?: number;
  image_url?: string | null;
  is_farmer?: boolean;
}

type Props = {
  loading: boolean
  forbidden: boolean,
  projects: Project[],
  error: string | null,
  onProjectClick?: (project: Project) => void; // Add callback for project selection
}

export default function AllProjects({loading, forbidden, projects, error, onProjectClick}: Props) {
  const navigate = useNavigate();

  const handleProjectClick = (project: Project) => {
    if (onProjectClick) {
      onProjectClick(project);
    } else {
      // Default behavior - navigate to project details
      navigate(`/projects/${project.id}`, { state: { project } });
    }
  };

  return (
    <section className="px-4 font-Outfit md:px-10 py-8">
      <div className="mb-8">
        <h2 className="text-center text-2xl md:text-3xl text-limeTxt font-bold mb-2">Investment Projects</h2>
      </div>

      {loading && <Loader text="Loading projects..." />}

      {forbidden && (
        <div className="max-w-xl mx-auto bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-yellow-800 text-xs font-bold">!</span>
            </div>
            <h3 className="text-lg font-semibold">Access Denied</h3>
          </div>
          <p className="text-sm">You need to complete your KYC verification to view and invest in projects.</p>
        </div>
      )}

      {error && !forbidden && (
        <div className="max-w-xl mx-auto bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Error Loading Projects</h3>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!forbidden && !loading && !error && projects.length === 0 && (
        <div className="max-w-xl mx-auto bg-gray-50 border border-gray-200 text-gray-600 p-8 rounded-lg shadow-sm text-center">
          <h3 className="text-lg font-semibold mb-2">No Projects Available</h3>
          <p className="text-sm">There are currently no investment projects available. Check back later!</p>
        </div>
      )}

      {!forbidden && !loading && !error && projects.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                brief={project.brief}
                target_amount={project.target_amount}
                farmer_name={project.farmer_name}
                deadline={project.deadline}
                days_remaining={project.days_remaining}
                status={project.status}
                created_at={project.created_at}
                watermarked_proposal={project.watermarked_proposal}
                onClick={() => handleProjectClick(project)}
              />
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              Showing {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
        </>
      )}
    </section>
  );
}