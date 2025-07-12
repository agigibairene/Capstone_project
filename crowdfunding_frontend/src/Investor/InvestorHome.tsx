import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import type { RootState } from "../redux/store";
import { API_URL } from "../Utils/constants";

// Types for project data
interface Project {
  id: number;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  funding_raised: number;
  target_amount: number;
  image?: string;
  category: string;
  location: string;
}

export default function InvestorHome(){
    const { kycData, role, loading, error } = useSelector((state: RootState) => state.kycReducer);
    const [deadlineProjects, setDeadlineProjects] = useState<Project[]>([]);
    const [budgetProjects, setBudgetProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [deadlineExpanded, setDeadlineExpanded] = useState(false);
    const [budgetExpanded, setBudgetExpanded] = useState(false);

    // Fetch projects with closer deadlines
    const fetchDeadlineProjects = async () => {
        try {
            setProjectsLoading(true);
            const response = await fetch(`${API_URL}/projects/deadline`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setDeadlineProjects(data.projects || []);
            }
        } catch (error) {
            console.error('Error fetching deadline projects:', error);
        } finally {
            setProjectsLoading(false);
        }
    };

    const fetchBudgetProjects = async () => {
        try {
            setProjectsLoading(true);
            const response = await fetch(`${API_URL}/projects/budget`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setBudgetProjects(data.projects || []);
            }
        } catch (error) {
            console.error('Error fetching budget projects:', error);
        } finally {
            setProjectsLoading(false);
        }
    };

    useEffect(() => {
        if (kycData && kycData.kyc) {
            fetchDeadlineProjects();
            fetchBudgetProjects();
        }
    }, [kycData]);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate days until deadline
    const getDaysUntilDeadline = (deadline: string) => {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Calculate funding percentage
    const getFundingPercentage = (raised: number, target: number) => {
        return Math.round((raised / target) * 100);
    };

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

    const stats = [
        {
            title: 'Urgent Projects',
            count: deadlineProjects.length,
            bgColor: 'text-limeTxt/80',
            textColor: 'text-red-400',
        },
        {
            title: 'Budget Projects',
            count: budgetProjects.length,
            bgColor: 'text-limeTxt/80',
            textColor: 'text-green-400',
        },
        {
            title: 'Total Available',
            count: deadlineProjects.length + budgetProjects.length,
            bgColor: 'text-limeTxt/80',
            textColor: 'text-blue-400',
        },
        {
            title: 'Opportunities',
            count: Math.max(deadlineProjects.length, budgetProjects.length),
            bgColor: 'text-limeTxt/80',
            textColor: 'text-purple-400',
        },
    ];

    return(
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                <div className="space-y-6 lg:space-y-8 xl:col-span-1">
                    {/* Profile Card */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/30 hover:bg-white/25 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row gap-4 sm:gap-6 items-center sm:items-start xl:items-center 2xl:items-start">
                            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 overflow-hidden ring-4 ring-white/20">
                                {user.profile_picture ? (
                                    <img
                                        src={`${API_URL}${user.profile_picture}`}
                                        className="w-full h-full object-cover"
                                        alt="Profile"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-purple-600 text-2xl sm:text-4xl font-bold">
                                        {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
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
                                    Investment Overview
                                </h3>
                                <p className="text-xl sm:text-2xl font-bold text-white">
                                    {deadlineProjects.length + budgetProjects.length} opportunities
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                {stats.map((stat, index) => {
                                    const { title, count, bgColor, textColor } = stat;
                                    return (
                                        <div key={index} className="bg-white/10 rounded-lg p-3 sm:p-4 text-center">
                                            <h4 className={`text-xs sm:text-sm ${bgColor} mb-1`}>{title}</h4>
                                            <p className={`text-lg sm:text-xl font-bold ${textColor}`}>{count}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-2 space-y-6 lg:space-y-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg sm:text-xl font-semibold text-limeTxt flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Urgent Deadlines
                                <span className="bg-red-400/20 text-red-400 text-xs px-2 py-1 rounded-full font-medium">
                                    {deadlineProjects.length}
                                </span>
                            </h3>
                            <button
                                onClick={() => setDeadlineExpanded(!deadlineExpanded)}
                                className="text-limeTxt hover:text-white transition-colors"
                            >
                                <svg className={`w-5 h-5 transform transition-transform ${deadlineExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        {projectsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-limeTxt"></div>
                            </div>
                        ) : (
                            <div className={`space-y-3 transition-all duration-300 ${deadlineExpanded ? 'max-h-none' : 'max-h-96 overflow-hidden'}`}>
                                {deadlineProjects.slice(0, deadlineExpanded ? deadlineProjects.length : 4).map((project) => (
                                    <div key={project.id} className="bg-black/20 rounded-xl p-4 border border-white/10">
                                        <div className="flex items-start gap-3">
                                            {project.image && (
                                                <img
                                                    src={`${API_URL}${project.image}`}
                                                    alt={project.title}
                                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-white text-sm truncate">{project.title}</h4>
                                                <p className="text-xs text-white/70 mt-1 line-clamp-2">{project.description}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-red-400 font-medium">
                                                        {getDaysUntilDeadline(project.deadline) > 0 
                                                            ? `${getDaysUntilDeadline(project.deadline)} days left`
                                                            : 'Deadline passed'
                                                        }
                                                    </span>
                                                    <span className="text-xs text-limeTxt">
                                                        {formatCurrency(project.target_amount)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {deadlineProjects.length === 0 && (
                                    <p className="text-center text-white/60 py-8">No urgent deadline projects found</p>
                                )}
                                {deadlineProjects.length > 4 && !deadlineExpanded && (
                                    <div className="text-center pt-2">
                                        <button
                                            onClick={() => setDeadlineExpanded(true)}
                                            className="text-limeTxt hover:text-white text-sm font-medium transition-colors"
                                        >
                                            Show {deadlineProjects.length - 4} more projects
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Projects Within Budget */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg sm:text-xl font-semibold text-limeTxt flex items-center gap-2">
                                <svg className="w-5 cursor-pointer h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                Within Budget
                                <span className="bg-green-400/20 text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                                    {budgetProjects.length}
                                </span>
                            </h3>
                            <button
                                onClick={() => setBudgetExpanded(!budgetExpanded)}
                                className="text-limeTxt cursor-pointer hover:text-white transition-colors"
                            >
                                <svg className={`w-5 h-5 transform transition-transform ${budgetExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        {projectsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-limeTxt"></div>
                            </div>
                        ) : (
                            <div className={`space-y-3 transition-all duration-300 ${budgetExpanded ? 'max-h-none' : 'max-h-96 overflow-hidden'}`}>
                                {budgetProjects.slice(0, budgetExpanded ? budgetProjects.length : 4).map((project) => (
                                    <div key={project.id} className="bg-black/20 rounded-xl p-4 border border-white/10">
                                        <div className="flex items-start gap-3">
                                            {project.image && (
                                                <img
                                                    src={`${API_URL}${project.image}`}
                                                    alt={project.title}
                                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-white text-sm truncate">{project.title}</h4>
                                                <p className="text-xs text-white/70 mt-1 line-clamp-2">{project.description}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-green-400 font-medium">
                                                        {getFundingPercentage(project.funding_raised, project.target_amount)}% funded
                                                    </span>
                                                    <span className="text-xs text-limeTxt">
                                                        {formatCurrency(project.target_amount)}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
                                                    <div 
                                                        className="bg-green-400 h-1.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${Math.min(getFundingPercentage(project.funding_raised, project.target_amount), 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {budgetProjects.length === 0 && (
                                    <p className="text-center text-white/60 py-8">No projects within budget found</p>
                                )}
                                {budgetProjects.length > 4 && !budgetExpanded && (
                                    <div className="text-center pt-2">
                                        <button
                                            onClick={() => setBudgetExpanded(true)}
                                            className="text-limeTxt hover:text-white text-sm font-medium transition-colors"
                                        >
                                            Show {budgetProjects.length - 4} more projects
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}