import { useState, useEffect } from "react";
import type { Opportunity } from "../data/opportunities";
import GrantsHeader from "../Utils/GrantsHeader";
import { GiTakeMyMoney } from "react-icons/gi";
import { GrFavorite } from "react-icons/gr";
import ScrollToTop from "react-scroll-to-top";
import { FaArrowUp } from "react-icons/fa";
import Loader from "../Utils/Loader";
import { API_URL } from "../Utils/constants";


interface Stats {
  total_opportunities: number;
  total_views: number;
  total_applicants: number;
  opportunities_by_type: Record<string, number>;
}

export default function Grants() {
  const [selected, setSelectedOpp] = useState<Opportunity | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    total_opportunities: 0,
    total_views: 0,
    total_applicants: 0,
    opportunities_by_type: {}
  });

  console.log(opportunities)

  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    count: 0,
    next: false,
    previous: false,
    total_pages: 0
  });

  const typeMapping = {
    'Grant': 'grant',
    'Hackathon': 'hackathon',
    'Funding + Mentorship': 'funding_mentorship',
    'Competition': 'competition',
    'Accelerator': 'accelerator',
    'Other': 'other'
  };

  async function fetchOpportunities(page = 1, type = ''){
    try {
      setLoading(true);
      setError(null); 
      
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20'
      });

    type TypeMappingKey = keyof typeof typeMapping;

    if (type.trim()) {
      const dbKey = typeMapping[type as TypeMappingKey] || type;
      params.append('type', dbKey);
    }

    const response = await fetch(`${API_URL}/opportunities/?${params}`);
      
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid response format');
      }
      
    setOpportunities(data.results);
    setPagination({
      count: data.count || 0,
      next: !!data.next,
      previous: !!data.previous,
      total_pages: data.total_pages || 1
    });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch opportunities');
      console.error('Fetch opportunities error:', err);
    } finally {
      setLoading(false);
    }
  };

  console.log(`Selected: ${selected}`)
  async function fetchStats(){
    try {
      const response = await fetch(`${API_URL}/opportunities/stats/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  async function fetchOpportunityDetail(id: number){
    try {
      const response = await fetch(`${API_URL}/opportunities/${id}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedOpp(data);
    } catch (err) {
      console.error('Failed to fetch opportunity details:', err);
    }
  };


  function handleTypeFilter(type: string){
    setSelectedType(type);
    setCurrentPage(1);
    fetchOpportunities(1, type);
  };


  function handleClearFilters(){
    setSelectedType('');
    setCurrentPage(1);
    fetchOpportunities(1, '');
  };

  function handlePageChange(page: number){
    setCurrentPage(page);
    fetchOpportunities(page, selectedType);
  };


  useEffect(() => {
    fetchOpportunities();
    fetchStats();
  }, []);

  const statsArray = [
    {
      title: 'Total Opportunities',
      icon: <GiTakeMyMoney size={50} className="text-white" />,
      value: stats.total_opportunities
    },
    {
      title: 'Total Views',
      icon: <GiTakeMyMoney size={50} className="text-white" />,
      value: stats.total_views
    },
    {
      title: 'Total Applicants',
      icon: <GiTakeMyMoney size={50} className="text-white"/>,
      value: stats.total_applicants
    },
    {
      title: 'Favorites',
      icon: <GrFavorite size={50} className="text-white" />,
      value: 0 
    }
  ];

  if (loading && opportunities.length === 0) {
    return (
      <section>
        <GrantsHeader />
        <Loader text="Loading..." />
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <GrantsHeader />
        <div className="px-4 py-10 md:px-8 lg:px-16 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button 
              onClick={() => fetchOpportunities()}
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <GrantsHeader />
      <div className="px-4 py-10 md:px-8 lg:px-16 bg-gray-50 min-h-screen relative font-Outfit">
        <h1 className={`text-left text-2xl sm:text-3xl md:text-4xl font-bold text-bgColor mb-8 md:mb-12 ${
          selected ? "hidden md:block" : "block"
        }`}>
          Grants & Opportunities
        </h1>

        {/* Active Filters Display */}
        {selectedType && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-gray-600 text-sm">Active filters:</span>
            <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              Type: {selectedType}
              <button 
                onClick={() => {
                  setSelectedType('');
                  setCurrentPage(1);
                  fetchOpportunities(1, '');
                }}
                className="ml-1 text-teal-600 hover:text-teal-800"
              >
                ×
              </button>
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 w-[80%] mx-auto lg:mx-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {statsArray.map((item) => {
            const {title, icon, value} = item;
            return (
              <div 
                key={title} 
                className="bg-bgColor min-w-0 transition hover:-translate-y-1 hover:shadow-xl cursor-pointer p-4 sm:p-6 lg:p-8 shadow-lg rounded-xl flex items-center justify-between"
              >
                <div className="flex flex-col min-w-0 flex-1 mr-2">
                  <p className="text-white text-xl sm:text-2xl lg:text-3xl font-bold hover:text-teal-700 cursor-pointer truncate">
                    {value}
                  </p>
                  <h3 className="font-semibold text-limeTxt text-sm sm:text-base truncate">
                    {title}
                  </h3>
                </div>
                <div className="flex-shrink-0">
                  {icon}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`${selected ? "md:col-span-1" : "md:col-span-2"} lg:col-span-2 grid gap-6 ${
            selected ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
          } lg:grid-cols-2`}>
            {opportunities.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  {selectedType ? 'No opportunities found matching your criteria.' : 'No opportunities available.'}
                </p>
                {selectedType && (
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 text-teal-600 hover:text-teal-800 underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              opportunities.map((item) => {
                const isSelected = selected?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`cursor-pointer bg-white rounded-2xl p-6 shadow-md ${
                      isSelected ? "border-2 border-limeTxt" : "border"
                    } border-gray-200 transition hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between`}
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-bgColor to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                          {item.organization.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-bgColor">{item.title}</h2>
                          <p className="text-sm text-gray-500">{item.organization}</p>
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-red-500">♡</button>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                      <span>🕒 {item.type}</span>
                      <span>📍 {item.location}</span>
                      <span>👁️ {item.views} views</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-4">{item.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags && item.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="bg-teal-200 text-bgColor py-1 px-3 rounded-full text-xs font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center border-t pt-4 mt-auto">
                      <span className="text-green-600 font-semibold text-sm">{item.amount}</span>
                      <button
                        onClick={() => {
                          setSelectedOpp(item);
                          fetchOpportunityDetail(item.id);
                        }}
                        className="bg-bgColor cursor-pointer hover:bg-teal-900 text-limeTxt py-2 px-4 rounded-md text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="col-span-full flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.previous}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-gray-600">
                Page {currentPage} of {pagination.total_pages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.next}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          {/* Right Column - Detail View or Filters */}
          {selected ? (
            <div className="md:col-span-1 lg:col-span-1">
              <div className="sticky top-20 bg-white p-6 rounded-xl shadow-md h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <button
                    onClick={() => setSelectedOpp(null)}
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-bgColor to-teal-700 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                    {selected.organization.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800">{selected.title}</h3>
                    <p className="text-sm text-gray-500">
                      {selected.organization}, {selected.location}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <p><strong>Type:</strong> {selected.type}</p>
                  <p><strong>Funding Amount:</strong> {selected.amount}</p>
                  <p><strong>Views:</strong> {selected.views}</p>
                  <p><strong>Applicants:</strong> {selected.applicants}</p>
                  <p><strong>Deadline:</strong> {selected.deadline}</p>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Full Description</h4>
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {selected.full_description || selected.description}
                  </div>
                </div>

                {selected.tags && selected.tags.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selected.tags.map((tag, index) => (
                        <span key={index} className="bg-teal-200 text-bgColor py-1 px-3 rounded-full text-xs font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <a href={selected.application_link}>
                  <button
                    className="w-full cursor-pointer bg-bgColor hover:bg-teal-900 text-limeTxt py-2 rounded-md font-semibold"
                  >
                    Apply Now
                  </button>
                </a>
              </div>
            </div>
          ) : (
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-20 rounded-xl h-fit">
                <div className="px-6 pb-4 h-full overflow-hidden">
                  <div className="bg-white p-6 shadow-md rounded-xl flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900">Opportunities Filter</h3>
                    <button 
                      onClick={handleClearFilters}
                      className="text-teal-500 text-sm hover:text-teal-700 cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>

                  {/* Type Filter */}
                  <div className="bg-white p-6 shadow-md rounded-xl mb-6">
                    <h4 className="font-medium text-gray-900 mb-4">Opportunity Type</h4>
                    
                    {/* All Types Option */}
                    <label className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="opportunityType"
                          checked={selectedType === ''}
                          onChange={() => handleTypeFilter('')}
                          className="w-4 h-4 text-teal-600 border-gray-300"
                        />
                        <span className="ml-3 text-gray-700">All Types</span>
                      </div>
                      <span className="text-gray-500 text-sm">{stats.total_opportunities} opportunities</span>
                    </label>

                    {/* Individual Type Options */}
                    {Object.entries(stats.opportunities_by_type).map(([type, count]) => {
                      return (<label key={type} className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="opportunityType"
                            checked={selectedType === type}
                            onChange={() => handleTypeFilter(type)}
                            className="w-4 h-4 text-teal-600 border-gray-300"
                          />
                          <span className="ml-3 text-gray-700">{type}</span>
                        </div>
                        <span className="text-gray-500 text-sm">{count} opportunities</span>
                      </label>
                    )})}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Detail View */}
        {selected && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto md:hidden">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
              <button
                onClick={() => setSelectedOpp(null)}
                className="flex items-center text-gray-500 hover:text-gray-700 text-sm sm:text-base"
              >
                ← Back to Opportunities
              </button>
            </div>

            <div className="px-4 py-6 sm:px-6 sm:py-8">
              <div className="flex flex-col items-center gap-4 mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                  {selected.organization.charAt(0).toUpperCase()}
                </div>
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-bgColor mb-1 sm:mb-2">
                    {selected.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500">
                    {selected.organization}, {selected.location}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
                  <div>
                    <p className="text-gray-500 mb-1">Type</p>
                    <p className="font-medium text-gray-800">{selected.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Funding Amount</p>
                    <p className="font-medium text-green-600">{selected.amount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Views</p>
                    <p className="font-medium text-gray-800">{selected.views}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Applicants</p>
                    <p className="font-medium text-gray-800">{selected.applicants}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Deadline</p>
                    <p className="font-medium text-gray-800">{selected.deadline}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <h4 className="text-lg sm:text-xl font-semibold text-bgColor mb-3 sm:mb-4">
                  Full Description
                </h4>
                <div className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {selected.full_description || selected.description}
                </div>
              </div>

              {selected.tags && selected.tags.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h4 className="text-lg sm:text-xl font-semibold text-bgColor mb-3 sm:mb-4">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.tags.map((tag, index) => (
                      <span key={index} className="bg-teal-200 text-bgColor py-2 px-3 sm:py-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="sticky bottom-0 bg-white pt-4 sm:pt-6 pb-4 sm:pb-6 border-t border-gray-200 -mx-4 sm:-mx-6 px-4 sm:px-6">
                <a href={selected.application_link}>
                  <button 
                    className="w-full cursor-pointer bg-bgColor hover:bg-teal-900 text-limeTxt py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold transition-colors"
                  >
                  Apply Now
                </button>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <ScrollToTop
        smooth
        className="scrollToTop"
        id="grants"
        component={<FaArrowUp className="animate-arrow text-limeTxt" style={{ fontSize: "20px" }} />}
      />
    </section>
  );
}