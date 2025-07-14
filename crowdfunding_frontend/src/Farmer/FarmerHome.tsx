import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { API_URL } from '../Utils/constants';
import FarmerProjectsAccordion from './FarmerProjectAccordion';
import TotalAmount from './TotalAmount';
import { useEffect, useState } from 'react';
import type { Project } from './FarmerProjectAccordion';
import { User } from 'lucide-react';

export default function FarmerHome() {
  const { kycData, role, loading, error } = useSelector((state: RootState) => state.kycReducer);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectLoading, setLoading] = useState(true);
  const [projectError, setError] = useState<string | null>(null);

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

      if (!response.ok) {
        // Check if it's a verification/authentication error
        if (response.status === 401 || response.status === 403) {
          // Farmer not verified - show 0 values instead of error
          setProjects([]);
          setError(null);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const projectsData = Array.isArray(data) ? data : (data.data || data.results || []);
      setProjects(projectsData);
    } catch (err: any) {
      if (err.message.includes('403') || err.message.includes('401') || 
        err.message.includes('verification') || err.message.includes('not verified')) {
        setProjects([]);
        setError(null);
      } else {
        setError(err.message || 'Failed to fetch projects');
      }
    } finally {
      setLoading(false);
    }
  };

  function filterProjectsByStatus(status: string){
    return projects.filter(p => p.status?.toLowerCase() === status.toLowerCase());
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-limeTxt mx-auto mb-4"></div>
            <p className="text-lg text-white">Loading KYC data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-100/20 backdrop-blur-sm rounded-2xl p-6 border border-red-300/30">
          <p className="text-center text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!kycData || !kycData.kyc) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-yellow-100/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-300/30">
          <p className="text-center text-yellow-400 text-lg">No KYC data found for your account</p>
        </div>
      </div>
    );
  }

  const user = kycData.kyc;
  
  const sections = [
    {
      title: 'Approved',
      count: filterProjectsByStatus('approved').length,
      status: 'approved',
      bgColor: 'text-limeTxt/80',
      textColor: 'text-blue-400',
    },
    {
      title: 'Pending',
      count: filterProjectsByStatus('pending').length,
      status: 'pending',
      bgColor: 'text-limeTxt/80',
      textColor: 'text-yellow-400',
    },
    {
      title: 'Rejected',
      count: filterProjectsByStatus('rejected').length,
      status: 'rejected',
      bgColor: 'text-limeTxt/80',
      textColor: 'text-red-400',
    },
    {
      title: 'Active',
      count: filterProjectsByStatus('approved').length,
      status: 'approved',
      bgColor: 'text-limeTxt/80',
      textColor: 'text-blue-400',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <div className="space-y-6 lg:space-y-8 xl:col-span-1">
          {/* Profile Card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/30 hover:bg-white/25 transition-all duration-300">
            <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row gap-4 sm:gap-6 items-center sm:items-start xl:items-center 2xl:items-start">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 overflow-hidden ring-4 ring-white/20">
                {user.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    className="w-full h-full object-cover"
                    alt="Profile"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-purple-600 text-2xl sm:text-4xl font-bold">
                    <User />
                  </div>
                )}
              </div>
              
              <div className="text-center sm:text-left xl:text-center 2xl:text-left flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-limeTxt mb-2 sm:mb-3 truncate">
                  {user.full_name}
                </h2>
                
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-sm sm:text-md text-limeTxt/80 truncate">
                    {user.email || 'No email provided'}
                  </p>
                  <p className="text-sm sm:text-md text-white/90">
                    <span className="font-medium">Phone:</span> 
                    <span className="ml-1 break-all">{user.phone_number}</span>
                  </p>
                  <p className="text-sm sm:text-md text-white/90">
                    <span className="font-medium">Address:</span> 
                    <span className="ml-1">{user.address}</span>
                  </p>
                  <p className="text-sm sm:text-md text-white/90">
                    <span className="font-medium">Role:</span> 
                    <span className="ml-1 capitalize">{role}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/30 hover:bg-white/25 transition-all duration-300">
            <div className="space-y-4 sm:space-y-6">
              <div className="border-b border-white/20 pb-3 sm:pb-4">
                <h3 className="text-base sm:text-lg font-medium text-limeTxt mb-1 sm:mb-2">
                  Total Projects
                </h3>
                <p className="text-xl sm:text-2xl font-bold text-white">{projects.length} project</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {
                  sections.map((section, index)=>{
                    const {title, count, bgColor, textColor} = section;
                    return(
                      <div key={index} className="bg-white/10 rounded-lg p-3 sm:p-4 text-center">
                        <h4 className={`text-xs sm:text-sm ${bgColor} mb-1`}>{title}</h4>
                        <p className={`text-lg sm:text-xl font-bold ${textColor}`}>{count}</p>
                      </div>
                    )
                  })
                }
               
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6 lg:space-y-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 h-auto border border-white/20">
            <FarmerProjectsAccordion 
              projectError={projectError} 
              projectLoading={projectLoading} 
              projects={projects}
              fetchProjects={fetchProjects}
            />
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
            <TotalAmount />
          </div>
        </div>
      </div>
    </section>
  );
}