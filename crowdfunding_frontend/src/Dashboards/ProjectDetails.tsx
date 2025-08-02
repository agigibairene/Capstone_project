import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {Download,ExternalLink,AlertCircle,ArrowLeft,Phone,FileText,Briefcase,User, MenuIcon} from 'lucide-react';
import InterestedInProject from '../Utils/InterestedInProject';

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
    watermarked_business_plan: string;
    benefits: string;
    email: string;
    phone_number: string;
  };
}

type DocumentType = 'proposal' | 'business_plan';


export default function ProjectDetails({ project: propProject}: ProjectDetailsProps) {
  const [pdfError, setPdfError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState<DocumentType>('proposal'); 
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState<boolean>(false)


  const project = propProject || location.state?.project;
  const backToDashboard = location.state?.project.is_farmer ? '/farmer' : '/investor'
  const handleBack = () => navigate(backToDashboard);

  console.log(project)

 const documents: { key: DocumentType; label: string; icon: React.ElementType }[] = [
  {
    key: 'proposal',
    label: 'Proposal',
    icon: FileText,
  },
  {
    key: 'business_plan',
    label: 'Business Plan',
    icon: Briefcase,
  },
  ];


  const getCurrentDocumentUrl = () => {
    return activeDocument === 'proposal' 
      ? project?.watermarked_proposal 
      : project?.watermarked_business_plan;
  };

  function handleDownload(){
    const documentUrl = getCurrentDocumentUrl();
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  const handleDocumentToggle = (docType: DocumentType) => {
    setActiveDocument(docType);
    setPdfError(false); 
  };

  if (!project) {
    return (
      <div className="flex flex-col font-Outfit h-screen bg-white text-white items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Project Not Found</h3>
          <p className="text-gray-400 mb-4">
            The project details could not be loaded.
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-bgColor hover:bg-emerald-900 cursor-pointer text-limeTxt rounded-lg transition-colors"
          >
            Back To Dashboard
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-screen bg-gray-400 text-white overflow-hidden">
      <div className="lg:hidden flex items-center justify-between p-4 bg-bgColor border-b border-gray-700">
        <button 
          onClick={handleBack}
          className="p-2 bg-limeTxt cursor-pointer rounded-full border-0 transition-colors outline-0"
          title="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-bgColor" />
        </button>
        <h1 className="text-lg font-semibold truncate mx-4">{project.name}</h1>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2  hover:bg-gray-700 rounded-lg transition-colors"
        >
          <MenuIcon/>
        </button>
      </div>

      <div className="hidden lg:block absolute top-4 left-4 z-20">
        <button 
          onClick={handleBack}
          className="p-2 bg-limeTxt cursor-pointer rounded-full transition-colors border-0 hover:bg-opacity-90"
          title="Go back"
        >
          <ArrowLeft className="w-8 h-8 text-bgColor" />
        </button>
      </div>

      {/* Document Toggle - business plan and  proposal*/}
      <div className="bg-bgColor border-b  border-gray-700 px-4 py-3">
        <div className="flex space-x-1 bg-gray-700 mx-auto rounded-lg p-1 max-w-md">
          {documents.map(({ key, label, icon: Icon}) => (
            <button
              key={key}
              onClick={() => handleDocumentToggle(key)}
              className={`flex items-center cursor-pointer space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
                activeDocument === key
                  ? `bg-emerald-600 text-limeTxt`
                  : ' hover:text-white hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer */}
        <div className="flex-1 bg-gray-600 overflow-hidden no-scrollbar relative">
          <div className="h-full p-2 sm:p-4 overflow-auto no-scrollbar">
            {!pdfError ? (
              <div className="h-full w-full flex justify-center items-center no-scrollbar">
                <iframe
                  key={activeDocument} 
                  src={getCurrentDocumentUrl()}
                  className="rounded-lg border border-gray-700 bg-white w-full h-full"
                  title={`Project ${activeDocument === 'proposal' ? 'Proposal' : 'Business Plan'} PDF`}
                  onError={() => setPdfError(true)}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center px-4 max-w-md">
                  <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Unable to load PDF</h3>
                  <p className="text-gray-400 mb-4 text-sm sm:text-base">
                    The {activeDocument === 'proposal' ? 'proposal' : 'business plan'} document could not be displayed in the browser.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm sm:text-base"
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
              <MenuIcon />
            </button>
          </div>

          {project.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Description</h3>
              <div className="bg-white rounded-lg p-3 text-sm">
                <p className="text-bgColor leading-relaxed break-words">{project.description}</p>
              </div>
            </div>
          )}


          {/* Farmer Info */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 text-gray-300">Farmer Details</h3>
            <div className="space-y-3 text-sm">
              
              <div className="flex items-start space-x-2">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="text-gray-400">Phone Number:</span>
                  <span className="text-white">{project.phone_number}</span>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
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

    
          
          {/* Benefits */}
          {project.benefits && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Benefits</h3>
              <div className="bg-white rounded-lg p-3 text-sm">
                <p className="text-bgColor leading-relaxed break-words">{project.benefits}</p>
              </div>
            </div>
          )}

        <button 
          onClick={() => setShowModal(true)} 
          className='py-2 bg-limeTxt px-2 mx-auto font-semibold w-full cursor-pointer mb-2 rounded-sm text-bgColor'
        >
          I am interested in this project
        </button>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              onClick={handleDownload}
              className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Download {activeDocument === 'proposal' ? 'Proposal' : 'Business Plan'}</span>
            </button>
            <button 
              onClick={() => window.open(getCurrentDocumentUrl(), '_blank')}
              className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in New Tab</span>
            </button>
          </div>
        </div>
        <InterestedInProject
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          farmerName={project.farmer_name}
          email={project.email}
          phoneNumber={project.phone_number}
          projectId={project.id}        
          />
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