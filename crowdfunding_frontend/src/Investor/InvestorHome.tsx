import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { API_URL } from "../Utils/constants";
import BudgetCard from "./BudgetCard";
import CloserDeadlines from "./CloserDeadline";
import { useEffect, useState } from "react";
import type { Project } from "../Farmer/FarmerProjectAccordion";
import { User } from "lucide-react";

export default function InvestorHome(){
    const { kycData, role, loading, error } = useSelector((state: RootState) => state.kycReducer);
    const [budgetProjects, setBudgetProjects] = useState<Project[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setLoading] = useState<boolean>(true);
    const [projectErrs, setError] = useState<string | null>(null);

    
    const fetchProjects = async () =>{
        setLoading(true);
        setError(null);
        try{
            const token = localStorage.getItem('ACCESS_TOKEN');
            const response = await fetch(`${API_URL}/projects/recommended/`,{
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (response.ok && data.success){
                setBudgetProjects(data.projects_within_budget);
                setProjects(data.projects_due_soon);
            }
        }
        catch(e){
            if (e instanceof Error) {
                setError(e.message || 'An error occurred while fetching projects.');
            } else {
                setError('An unknown error occurred while fetching projects.');
            }
        }
        finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        fetchProjects()
    }, [])

    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                <div className="flex items-center justify-center min-h-48 sm:min-h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-limeTxt mx-auto mb-3 sm:mb-4"></div>
                        <p className="text-sm sm:text-base md:text-lg text-white">Loading KYC data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                <div className="bg-red-100/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-red-300/30">
                    <p className="text-center text-red-400 text-sm sm:text-base md:text-lg">{error}</p>
                </div>
            </div>
        );
    }

    if (!kycData || !kycData.kyc) {
        return (
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                <div className="bg-yellow-100/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-yellow-300/30">
                    <p className="text-center text-yellow-400 text-sm sm:text-base md:text-lg">No KYC data found for your account</p>
                </div>
            </div>
        );
    }

    const user = kycData.kyc;


    const stats = [
        {
            title: 'Urgent Projects',
            count: projects.length,
            bgColor: 'text-limeTxt/80',
            textColor: 'text-red-400',
        },
        {
            title: 'Recommended',
            count: budgetProjects.length,
            bgColor: 'text-limeTxt/80',
            textColor: 'text-blue-400'
        }
    ];

    return(
        <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                
                <div className="lg:col-span-4 xl:col-span-1 space-y-4 sm:space-y-6 lg:space-y-8">
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/30 hover:bg-white/25 transition-all duration-300">
                        <div className="flex flex-col xs:flex-row sm:flex-col md:flex-row lg:flex-col xl:flex-col 2xl:flex-row gap-3 sm:gap-4 md:gap-6 items-center xs:items-start sm:items-center md:items-start lg:items-center xl:items-center 2xl:items-start">
                            
                            {/* Profile Picture */}
                            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex-shrink-0 w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 overflow-hidden ring-2 sm:ring-4 ring-white/20">
                                {user.profile_picture ? (
                                    <img
                                        src={user.profile_picture}
                                        className="w-full h-full object-cover"
                                        alt="Profile"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-purple-600 text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                                        <User />
                                    </div>
                                )}
                            </div>
                    
                            {/* Profile Info */}
                            <div className="text-center xs:text-left sm:text-center md:text-left lg:text-center xl:text-center 2xl:text-left flex-1 min-w-0 w-full xs:w-auto">
                                <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold text-limeTxt mb-1 sm:mb-2 md:mb-3 truncate">
                                    {user.full_name}
                                </h2>
                    
                                <div className="space-y-1 xs:space-y-1.5 sm:space-y-2">
                                    <p className="text-xs  md:text-base text-limeTxt/80 truncate">
                                        {user.email || 'No email provided'}
                                    </p>
                                    <p className="text-xs  md:text-base text-white/90">
                                        <span className="font-medium">Phone:</span>
                                        <span className="ml-1 break-all">{user.phone_number}</span>
                                    </p>
                                    <p className="text-xs sm:text-base text-white/90">
                                        <span className="font-medium">Address:</span>
                                        <span className="ml-1">{user.address}</span>
                                    </p>
                                    <p className="text-xs  sm:text-base text-white/90">
                                        <span className="font-medium">Role:</span>
                                        <span className="ml-1 capitalize">{role}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/30 hover:bg-white/25 transition-all duration-300">
                        <div className="space-y-3 sm:space-y-4 md:space-y-6">
                            <div className="border-b border-white/10 pb-2 sm:pb-3 md:pb-4">
                                <h3 className="text-sm sm:text-base md:text-lg font-medium text-limeTxt mb-1 sm:mb-2">
                                    Investment Overview
                                </h3>
                               
                            </div>
                            
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                {stats.map((stat, index) => {
                                    const { title, bgColor, textColor, count } = stat;
                                    return (
                                        <div key={index} className="bg-white/10 rounded-lg p-2 sm:p-3 md:p-4 text-center">
                                            <h4 className={`text-xs sm:text-sm ${bgColor} mb-1`}>{title}</h4>
                                            <p className={`text-sm sm:text-lg md:text-xl font-bold ${textColor}`}>{count}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content - Projects */}
                <div className="lg:col-span-8 xl:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
                    <CloserDeadlines projects={projects} loading={projectsLoading} error={projectErrs} />
                    <BudgetCard budgetProjects={budgetProjects} loading={projectsLoading} error={projectErrs}/>
                </div>
            </div>
        </section>
    )
}