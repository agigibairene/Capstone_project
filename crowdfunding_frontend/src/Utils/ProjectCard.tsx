import { Calendar, DollarSign, User, Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
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
  onClick?: () => void;
}

export default function ProjectCard({ 
  id,
  title, 
  brief, 
  target_amount, 
  farmer_name,
  deadline,
  days_remaining,
  status,
  watermarked_proposal,
  onClick
}: ProjectCardProps) {
  
  const navigate = useNavigate();
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  function getStatusConfig(status: string) {
    switch (status.toLowerCase()) {
      case 'approved':
        return { color: 'bg-green-100 text-green-800', label: 'Approved' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', label: 'Rejected' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: status || 'Unknown' };
    }
  }

  const statusConfig = getStatusConfig(status);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to project details page
      navigate(`/projects/${id}`);
    }
  };

  return (
    <div className="block group cursor-pointer">
      <div className="w-80 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group-hover:scale-[1.02] border border-gray-100"
           onClick={handleCardClick}>
        
        {/* Header with status */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            {days_remaining !== undefined && days_remaining !== null && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">{days_remaining}d left</span>
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
            {title}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {brief}
          </p>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between">
            {/* Farmer avatar and info */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {getInitials(farmer_name)}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">{farmer_name}</span>
              </div>
            </div>

            {/* Target amount */}
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-600">
                ${parseFloat(target_amount).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Deadline and proposal link */}
          {(deadline || watermarked_proposal) && (
            <div className="flex items-center justify-between mt-2">
              {deadline && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    Due: {new Date(deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {watermarked_proposal && (
                <a 
                  href={watermarked_proposal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="w-3 h-3" />
                  <span>Proposal</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}