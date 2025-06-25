import { Link } from "react-router-dom";

interface ProjectInterface {
  name: string;
  briefDescription: string;
  target: string
}

export default function ProjectCard({ name, briefDescription, target }: ProjectInterface) {
  return (
    <Link to="/" className="block group">
      <div className="w-80 h-56 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-105 flex flex-col">
        {/* Image Container */}
        <div className="relative w-full overflow-hidden flex-shrink-0">
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-bgColor truncate group-hover:text-limeTxt transition-colors">
                {name}
              </h3>
            </div>
            <p>{target}</p>
          </div>
          
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {briefDescription}
          </p>
        </div>
      </div>
    </Link>
  );
}