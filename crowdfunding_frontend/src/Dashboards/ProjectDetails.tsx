import { useState } from 'react';
import {
  Download,
  Calendar,
  MapPin,
  ExternalLink,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface ProjectDetailsProps {
  project?: {
    id: string;
    name: string;
    title: string;
    brief: string;
    description: string;
    target_amount: string;
    farmer_name: string;
    deadline: string;
    days_remaining: number;
    status: string;
    created_at: string;
    watermarked_proposal: string;
    benefits: string;
    email: string;
  };
  role: string
}

export default function ProjectDetails({ project: propProject, role }: ProjectDetailsProps) {
  const [pdfError, setPdfError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const project = propProject || location.state?.project;
  const backToDashboard = location.state?.from || (role === 'investor' ? '/investor' : '/farmer');
  const handleBack = () => navigate(backToDashboard);



  function handleDownload(){
    if (project?.watermarked_proposal) {
      window.open(project.watermarked_proposal, '_blank');
    }
  };

  if (!project) {
    return (
      <div className="flex flex-col h-screen bg-gray-400 text-white items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Project Not Found</h3>
          <p className="text-gray-400 mb-4">
            The project details could not be loaded.
          </p>
          <button
            onClick={() =>navigate(role === 'investor'?'/investor': '/farmer')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-400 text-white overflow-hidden">
      <div className="lg:hidden flex items-center justify-between p-4 bg-bgColor border-b border-gray-700">
        <button 
          onClick={handleBack}
          className="p-2 bg-limeTxt cursor-pointer rounded-full transition-colors border border-gray-700"
          title="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-bgColor" />
        </button>
        <h1 className="text-lg font-semibold truncate mx-4">{project.name}</h1>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <div className="w-4 h-0.5 bg-white mb-1"></div>
            <div className="w-4 h-0.5 bg-white mb-1"></div>
            <div className="w-4 h-0.5 bg-white"></div>
          </div>
        </button>
      </div>

      {/* Desktop Back Button */}
      <div className="hidden lg:block absolute top-4 left-4 z-20">
        <button 
          onClick={handleBack}
          className="p-2 bg-limeTxt cursor-pointer rounded-full transition-colors border border-gray-700 hover:bg-opacity-90"
          title="Go back"
        >
          <ArrowLeft className="w-8 h-8 text-bgColor" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer */}
        <div className="flex-1 bg-gray-600 overflow-hidden relative">
          <div className="h-full p-2 sm:p-4 overflow-auto no-scrollbar">
            {!pdfError ? (
              <div className="h-full w-full flex justify-center items-center">
                <iframe
                  src={project.watermarked_proposal}
                  className="rounded-lg border border-gray-700 bg-white w-full h-full"
                  title="Project Proposal PDF"
                  onError={() => setPdfError(true)}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center px-4 max-w-md">
                  <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Unable to load PDF</h3>
                  <p className="text-gray-400 mb-4 text-sm sm:text-base">
                    The PDF document could not be displayed in the browser.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Download PDF Instead
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          fixed lg:relative top-0 right-0 h-full w-full sm:w-96 lg:w-80 xl:w-96
          bg-bgColor border-l border-gray-700 p-4 overflow-y-auto
          transition-transform duration-300 ease-in-out z-30
          lg:flex-shrink-0
        `}>
          {/* Mobile Close Button */}
          <div className="lg:hidden flex justify-end mb-4">
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center relative">
                <div className="w-4 h-0.5 bg-white rotate-45 absolute" />
                <div className="w-4 h-0.5 bg-white -rotate-45 absolute" />
              </div>
            </button>
          </div>

          {/* Project Details */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 text-gray-300">Project Details</h3>
            <div className="bg-white rounded-lg p-3 text-sm">
              <div className="text-bgColor font-medium mb-1 break-words">{project.farmer_name}</div>
              <div className="text-gray-400 mb-2 break-words">{project.title}</div>
              <div className="flex flex-col gap-2">
                <span className="text-emerald-400 font-medium text-lg">
                  ${parseFloat(project.target_amount).toLocaleString()}
                </span>
                <span className={`px-2 py-1 rounded text-xs self-start ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            </div>
          </div>

          {/* Document Info */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 text-gray-300">Document Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="text-gray-400">Deadline:</span>
                  <span className="text-white">{new Date(project.deadline).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="text-gray-400">Farmer:</span>
                  <span className="text-white break-words">{project.farmer_name}</span>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="text-gray-400">Days Left:</span>
                  <span className="text-orange-400 font-medium">{project.days_remaining} days</span>
                </div>
              </div>
              {project.email && (
                <div className="flex items-start space-x-2">
                  <ExternalLink className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white break-words">{project.email}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Description</h3>
              <div className="bg-white rounded-lg p-3 text-sm">
                <p className="text-bgColor leading-relaxed break-words">{project.description}</p>
              </div>
            </div>
          )}

          {/* Benefits */}
          {project.benefits && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Benefits</h3>
              <div className="bg-white rounded-lg p-3 text-sm">
                <p className="text-bgColor leading-relaxed break-words">{project.benefits}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              onClick={handleDownload}
              className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button 
              onClick={() => window.open(project.watermarked_proposal, '_blank')}
              className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in New Tab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}