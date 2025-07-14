import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../Dashboards/InvestorDashboard';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props{
    budgetProjects: Project[],
    loading: boolean,
    error: string | null,
}

export default function BudgetCard({budgetProjects, loading, error} : Props){
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
                    Recommended projects based on your annual income
                </span>
                <span className="bg-blue-400/20 text-blue-400 text-xs sm:ml-2 px-2 py-1 rounded-full font-medium w-fit">
                    {budgetProjects.length}
                </span>
            </div>
            <div className="flex-shrink-0 ml-2">
                {showProjects ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
        </button>
        {showProjects && (
        <div className="space-y-3 sm:space-y-4">
            {loading && (
            <div className="flex flex-col sm:flex-row items-center justify-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 sm:mt-0 sm:ml-3 text-white/80 text-sm sm:text-base text-center">Loading projects...</p>
            </div>
            )}
            
            {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                <p className="text-red-200 text-sm sm:text-base break-words">{error}</p>
            </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                {budgetProjects.map((project) => (
                    <div
                        key={project.id}
                        onClick={() => navigate(`/projects/${project.id}`, { state: { project } })}                          
                        className="cursor-pointer p-4 sm:p-5 lg:px-2 lg:py-6 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white group-hover:text-blue-200 transition-colors duration-200 line-clamp-2 break-words">
                        {project.title}
                    </h3>
                    <div className="mt-2 w-full h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-blue-400"></div>
                    </div>
                ))}
            </div>
            {!loading && budgetProjects.length === 0 && (
            <div className="text-center py-8 sm:py-12">
                <div className="bg-white/10 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-white/20">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                </div>
                <p className="text-white/70 text-base sm:text-lg">No projects found within your budget.</p>
                <p className="text-white/50 text-xs sm:text-sm mt-2 px-4">Try adjusting your budget or check back later for new projects.</p>
            </div>
            )}
        </div>
        )}
    </div>
  );
};