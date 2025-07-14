import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Project } from '../Farmer/FarmerProjectAccordion';

interface Props{
  projects: Project[],
  loading: boolean,
  error: string | null,
}


export default function CloserDeadlines({projects, loading, error} : Props){
  const [showProjects, setShowProjects] = useState<boolean>(true);
  const navigate = useNavigate();


  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/30">
      <button
        onClick={() => setShowProjects(prev => !prev)}
        className="mb-4 sm:mb-6 px-2 sm:px-4 lg:px-6 flex justify-between cursor-pointer items-start md:items-center py-2 sm:py-3 bg-none w-full text-limeTxt text-sm sm:text-base lg:text-lg font-medium transform hover:scale-105 transition-transform duration-200"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <span className="text-left">
            Projects due in the next 5 days
          </span>
          <span className="bg-red-400/20 text-red-400 text-xs sm:ml-2 px-2 py-1 rounded-full font-medium w-fit">
            {projects.length}
          </span>
        </div>
        <div className="flex-shrink-0 ml-2">
          {showProjects ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {showProjects && (
        <>
          {loading && (
            <div className="flex flex-col sm:flex-row items-center justify-center py-6 sm:py-8">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 sm:mt-0 sm:ml-3 text-white/80 text-sm sm:text-base text-center">Loading projects...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 sm:p-4 backdrop-blur-sm mb-4">
              <p className="text-red-200 text-sm sm:text-base break-words">{error}</p>
            </div>
          )}

          <div className="flex gap-3 sm:gap-4 flex-col">
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`, { state: { project } })}                          
                className="cursor-pointer p-3 sm:p-4 lg:p-5 bg-white/30 hover:bg-white/20 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 border border-white/20 hover:border-white/40"
              >
                <h3 className="text-sm sm:text-base lg:text-lg font-medium text-white break-words line-clamp-2 hover:text-blue-200 transition-colors duration-200">
                  {project.title}
                </h3>
              </div>
            ))}
          </div>

          {!loading && projects.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="bg-white/10 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-white/20">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-white/70 text-base sm:text-lg">No projects with deadline in the next 5 days found.</p>
              <p className="text-white/50 text-xs sm:text-sm mt-2 px-4">Check back later for upcoming deadlines.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};