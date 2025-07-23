/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import ProjectCard from "./ProjectCard";
import Loader from "../Utils/Loader";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

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
  project_type?: string;
  location?: string;
}

type FilterType = 'all' | 'new' | 'existing';
type SortType = 'newest' | 'oldest' | 'deadline' | 'amount_high' | 'amount_low';

type Props = {
  loading: boolean;
  forbidden: boolean;
  projects: Project[];
  error: string | null;
  onProjectClick?: (project: Project) => void;
};

const PROJECTS_PER_PAGE = 12;

export default function AllProjects({ loading, forbidden, projects, error, onProjectClick }: Props) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleProjectClick = (project: Project) => {
    if (onProjectClick) {
      onProjectClick(project);
    } else {
      navigate(`/projects/${project.id}`, { state: { project, role: "investor" } });
    }
  };

  // Filter and sort projects based on selected criteria
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.brief.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.farmer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.location && project.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (activeFilter === 'new') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(project => {
        const createdDate = new Date(project.created_at);
        return createdDate >= thirtyDaysAgo;
      });
    } else if (activeFilter === 'existing') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(project => {
        const createdDate = new Date(project.created_at);
        return createdDate < thirtyDaysAgo;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'amount_high':
          return parseFloat(b.target_amount) - parseFloat(a.target_amount);
        case 'amount_low':
          return parseFloat(a.target_amount) - parseFloat(b.target_amount);
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, activeFilter, sortBy, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedProjects.length / PROJECTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
  const endIndex = startIndex + PROJECTS_PER_PAGE;
  const currentProjects = filteredAndSortedProjects.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [activeFilter, sortBy, searchTerm]);

  const getFilterCount = (filterType: FilterType) => {
    if (filterType === 'all') return projects.length;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (filterType === 'new') {
      return projects.filter(project => {
        const createdDate = new Date(project.created_at);
        return createdDate >= thirtyDaysAgo;
      }).length;
    } else {
      return projects.filter(project => {
        const createdDate = new Date(project.created_at);
        return createdDate < thirtyDaysAgo;
      }).length;
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <section className="px-4 font-Outfit md:px-10 py-8">
      <div className="mb-8">
        <h2 className="text-center text-2xl md:text-3xl text-limeTxt font-bold mb-2">
          Investment Projects
        </h2>
      </div>

      {!forbidden && !loading && projects.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-2 items-stretch">
            {/* Search Bar */}
            <div className="flex-1 min-w-0">
              <div className="relative h-full">
                <input
                  type="text"
                  placeholder="Search projects, farmers, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-full px-4 py-3 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-limeTxt focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex-shrink-0">
              <div className="bg-white rounded-lg p-1 shadow-sm border h-full flex items-center">
                {(['all', 'new', 'existing'] as FilterType[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-md cursor-pointer text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeFilter === filter
                        ? 'bg-bgColor text-limeTxt shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {filter === 'all' && 'All Projects'}
                    {filter === 'new' && 'New Ideas'}
                    {filter === 'existing' && 'Existing Projects'}
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {getFilterCount(filter)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="w-full h-full px-4 py-3 cursor-pointer text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-limeTxt focus:border-transparent appearance-none bg-no-repeat bg-right pr-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="newest">Sort by: Newest First</option>
                <option value="oldest">Sort by: Oldest First</option>
                <option value="deadline">Sort by: Deadline</option>
                <option value="amount_high">Sort by: Amount (High to Low)</option>
                <option value="amount_low">Sort by: Amount (Low to High)</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(activeFilter !== 'all' || searchTerm) && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {activeFilter !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                  {activeFilter === 'new' ? 'New Ideas' : 'Existing Projects'}
                  <button
                    onClick={() => setActiveFilter('all')}
                    className="ml-2 hover:bg-white cursor-pointer hover:text-limeTxt rounded-full p-0.5 transition-colors"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 hover:bg-blue-200 cursor-pointer rounded-full p-0.5 transition-colors"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

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

      {!forbidden && !loading && !error && projects.length > 0 && filteredAndSortedProjects.length === 0 && (
        <div className="max-w-xl mx-auto bg-gray-50 border border-gray-200 text-gray-600 p-8 rounded-lg shadow-sm text-center">
          <h3 className="text-lg font-semibold mb-2">No Projects Match Your Filters</h3>
          <p className="text-sm">Try adjusting your search criteria or clearing your filters.</p>
          <button
            onClick={() => {
              setActiveFilter('all');
              setSearchTerm('');
            }}
            className="mt-4 px-4 py-2 text-limeTxt bg-bgColor cursor-pointer rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {!forbidden && !loading && !error && filteredAndSortedProjects.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {currentProjects.map((project) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-limeTxt'
                }`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {getPageNumbers().map((page, index) => (
                  <div key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-2 text-gray-400">...</span>
                    ) : (
                      <button
                        onClick={() => setCurrentPage(page as number)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-limeTxt text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-limeTxt'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-limeTxt'
                }`}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}

          {/* Results Summary */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedProjects.length)} of {filteredAndSortedProjects.length} project
              {filteredAndSortedProjects.length !== 1 ? 's' : ''}
              {activeFilter !== 'all' && ` (${activeFilter === 'new' ? 'New Ideas' : 'Existing Projects'})`}
              {searchTerm && ` matching "${searchTerm}"`}
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </p>
          </div>
        </>
      )}
    </section>
  );
}