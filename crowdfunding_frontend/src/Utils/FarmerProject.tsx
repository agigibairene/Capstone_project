import { useState, useEffect } from 'react';
import { Plus, Minus, Eye, FileText, CheckCircle, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { API_URL } from './constants';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export interface Project {
  id: string;
  name: string;
  title: string;
  brief: string;
  description: string;
  benefits: string;
  created_at: string;
  deadline: string;
  days_remaining: number;
  email: string;
  farmer: number;
  farmer_name: string;
  image_url: string | null;
  is_farmer: boolean;
  status: 'approved' | 'pending' | 'rejected' | string;
  target_amount: string;
  watermarked_proposal: string;
}

export default function FarmerProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const navigate = useNavigate()

  const API_ENDPOINTS = {
    allProjects: `${API_URL}/projects/`,
    farmerProjects: `${API_URL}/farmer/projects/`,
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('ACCESS_TOKEN');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      let response = await fetch(API_ENDPOINTS.farmerProjects, { headers });
      if (!response.ok) {
        response = await fetch(API_ENDPOINTS.allProjects, { headers });
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const projectsData = Array.isArray(data) ? data : (data.data || data.results || []);
      setProjects(projectsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  function getStatusIcon(status: string){
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  function getStatusColor(status: string){
    switch (status?.toLowerCase()) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filterProjectsByStatus = (status: string) =>
    projects.filter(p => p.status?.toLowerCase() === status.toLowerCase());

  const sections = [
    {
      title: 'Total Projects',
      count: projects.length,
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      status: 'total',
      projects,
      showStatus: true,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900',
    },
    {
      title: 'Approved Projects',
      count: filterProjectsByStatus('approved').length,
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      status: 'approved',
      projects: filterProjectsByStatus('approved'),
      bgColor: 'bg-green-50',
      textColor: 'text-green-900',
    },
    {
      title: 'Pending Projects',
      count: filterProjectsByStatus('pending').length,
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
      status: 'pending',
      projects: filterProjectsByStatus('pending'),
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-900',
    },
    {
      title: 'Rejected Projects',
      count: filterProjectsByStatus('rejected').length,
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      status: 'rejected',
      projects: filterProjectsByStatus('rejected'),
      bgColor: 'bg-red-50',
      textColor: 'text-red-900',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-limeTxt" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error loading projects: {error}</p>
          <button
            onClick={fetchProjects}
            className="px-4 py-2 bg-bgColor text-limeTxt rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-screen rounded-2xl bg-white/20 backdrop-blur-sm border w-[28rem] border-white/30 h-auto">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {sections.map((section, index) => {
          const isExpanded = selectedIndex === index;
          return (
            <div key={section.status} className={`${section.bgColor} rounded-lg shadow-sm`}>
              <button
                onClick={() => setSelectedIndex(isExpanded ? null : index)}
                className="w-full p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  {section.icon}
                  <div className="text-left">
                    <h3 className={`font-semibold ${section.textColor}`}>{section.title}</h3>
                    <p className="text-sm text-gray-600">{section.count} projects</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(section.status)}`}>
                    {section.count}
                  </span>
                  {isExpanded ?<div className='p-2 cursor-pointer bg-bgColor rounded-full'>
                     <Minus className="w-4 h-4 text-limeTxt" />
                  </div> : <div className='p-2 bg-bgColor cursor-pointer rounded-full'><Plus className="w-5 h-5 text-limeTxt" /></div>}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t p-4 space-y-2">
                  {section.projects.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No projects found</p>
                    </div>
                  ) : (
                    section.projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                        <div className="flex items-center space-x-3 flex-1">
                          {section.showStatus && getStatusIcon(project.status)}
                          <div className="flex-1">
                            <Link to={`/projects/${project.id}`} state={{ project, role:"farmer" }} className='cursor-pointer'>
                            <h4 className="font-medium text-gray-900 text-sm">Title: {project.title}</h4>
                            </Link>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/projects/${project.id}`, { state: { project } })}                          
                          className="ml-2 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Project"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
