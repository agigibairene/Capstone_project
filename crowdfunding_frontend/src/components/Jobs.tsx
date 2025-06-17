import { useState } from 'react';
import { Search, MapPin, DollarSign, Heart, MoreHorizontal } from 'lucide-react';

export default function JobSearchApp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');

  const [filters, setFilters] = useState({
    jobType: {
      fullTime: true,
      freelance: false,
      partTime: false
    },
    experience: {
      under1: true,
      oneToTwo: true,
      twoToSix: false,
      overSix: false
    }
  });

  const jobs = [
    {
      id: 1,
      title: 'Senior UI/UX Designer',
      company: 'Meta',
      location: 'San Francisco',
      salary: '$600-1.2k',
      period: 'Month',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed. Nulla facilisis porta in.',
      logo: '🟦',
      isSaved: false
    },
    {
      id: 2,
      title: 'Junior UI/UX Designer',
      company: 'Google',
      location: 'New York',
      salary: '$100-3k',
      period: 'Month',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed. Nulla facilisis porta in.',
      logo: '🔵',
      isSaved: false
    },
    {
      id: 3,
      title: 'Front end Developer',
      company: 'Slack',
      location: 'Remote',
      salary: '$800-1.2k',
      period: 'Month',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed. Nulla facilisis porta in.',
      logo: '🟨',
      isSaved: false
    },
    {
      id: 4,
      title: '3D Illustration',
      company: 'Telegram',
      location: 'San Francisco',
      salary: '$400-1.1k',
      period: 'Month',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed. Nulla facilisis porta in.',
      logo: '🔵',
      isSaved: false
    },
    {
      id: 5,
      title: 'Back end Developer',
      company: 'YouTube',
      location: 'Remote',
      salary: '$600-1.2k',
      period: 'Month',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed. Nulla facilisis porta in.',
      logo: '🔴',
      isSaved: false
    },
    {
      id: 6,
      title: 'Senior UI/UX Designer',
      company: 'Discord',
      location: 'New York',
      salary: '$800-1.5k',
      period: 'Month',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed. Nulla facilisis porta in.',
      logo: '🟣',
      isSaved: false
    }
  ];

  const jobCounts = {
    fullTime: 321,
    freelance: 574,
    partTime: 192,
    under1: 321,
    oneToTwo: 665,
    twoToSix: 192,
    overSix: 192
  };

  const handleFilterChange = (category: string, filter: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [filter]: !prev[category][filter]
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Find Job</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg font-medium">Search</button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900">History</button>
            <div className="w-10 h-10 bg-orange-400 rounded-full"></div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Let's find your dream job</h2>
          <p className="text-gray-500 mb-8">540,000 available job vacancies here</p>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Job Title, Company, or Anything"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 min-w-[200px] relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 min-w-[200px] relative">
              <DollarSign className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Salary Range"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-4 py-2 text-blue-600 hover:text-blue-700">
              Reset
            </button>
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Search
            </button>
          </div>
        </div>

        {/* Fixed Layout */}
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-250px)]">
          {/* Job Listings (Scrollable) */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                        {job.logo}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-gray-500 text-sm">{job.company} • {job.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-red-500">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{job.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">{job.salary}</span>
                      <span className="text-gray-500">/ {job.period}</span>
                    </div>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                      Apply Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters (Fixed) */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm h-full overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Job Filter</h3>
                <button className="text-blue-600 text-sm hover:text-blue-700">Clear all</button>
              </div>

              {/* Job Type Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-4">Job Type</h4>
                {['fullTime', 'freelance', 'partTime'].map((key) => (
                  <label key={key} className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.jobType[key as keyof typeof filters.jobType]}
                        onChange={() => handleFilterChange('jobType', key)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                    <span className="text-gray-500 text-sm">{jobCounts[key as keyof typeof jobCounts]} Jobs</span>
                  </label>
                ))}
              </div>

              {/* Experience Filter */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Experience</h4>
                {['under1', 'oneToTwo', 'twoToSix', 'overSix'].map((key) => (
                  <label key={key} className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.experience[key as keyof typeof filters.experience]}
                        onChange={() => handleFilterChange('experience', key)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                    <span className="text-gray-500 text-sm">{jobCounts[key as keyof typeof jobCounts]} Jobs</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
