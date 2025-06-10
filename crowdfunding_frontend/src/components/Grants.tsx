import React, { useState } from 'react';

const jobs = [
  {
    id: 1,
    company: 'Google Inc.',
    title: 'UX Designer, Google Pay',
    location: 'Shanghai China',
    views: 240,
    time: 'Today',
    team: 'Product and Design',
    salary: '$120k / year',
    type: 'Full-time',
  },
  {
    id: 2,
    company: 'Facebook',
    title: 'Product Manager – Operating Systems',
    location: 'Menlo Park, CA',
    views: 130,
    time: '3 days ago',
    team: 'Product and Design',
    salary: '$100k / year',
    type: 'Full-time',
  },
  {
    id: 3,
    company: 'Twitter',
    title: 'Senior Product Designer, Customer Journey',
    location: 'San Francisco',
    views: 440,
    time: '1 week ago',
    team: 'Product and Design',
    salary: '$100k / year',
    type: 'Full-time',
  },
];

const JobBoard = () => {
  const [selectedJob, setSelectedJob] = useState(jobs[0]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/5 bg-white shadow p-6">
        <h2 className="text-blue-600 font-bold text-xl mb-6">HuntJobs</h2>
        <ul className="space-y-4 text-gray-600">
          <li className="font-medium text-blue-500">Find Work</li>
          <li>My Jobs</li>
          <li>My Activity</li>
          <li>Messages</li>
          <li>Reports</li>
        </ul>
        <div className="mt-10">
          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/40?img=2"
              alt="profile"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-sm font-semibold">Alexis Wolen</p>
              <p className="text-xs text-gray-500">UX Designer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-2/5 p-6 space-y-4">
        {/* Search and Filters */}
        <div>
          <input
            className="w-full p-3 rounded-lg border border-gray-300"
            placeholder="Search by Category, Company or..."
          />
          <div className="flex space-x-2 mt-3">
            {['UX Designer', 'UI Designer', 'Product Designer'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
            <button className="text-sm text-blue-600 ml-auto">Clear filters</button>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className={`border rounded-lg p-4 cursor-pointer shadow-sm ${
                selectedJob.id === job.id ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="text-md font-bold">{job.company}</h3>
                  <p className="text-sm text-gray-600">{job.title}</p>
                </div>
                <img
                  src={`https://logo.clearbit.com/${job.company.toLowerCase().split(' ')[0]}.com`}
                  alt={`${job.company} logo`}
                  className="w-10 h-10"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <p>{job.time} • {job.type}</p>
                <p>{job.views} views</p>
                <p>{job.salary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Job Detail Preview */}
      <div className="w-2/5 bg-white p-6 border-l">
        <div className="flex items-center gap-3">
          <img
            src={`https://logo.clearbit.com/${selectedJob.company.toLowerCase().split(' ')[0]}.com`}
            alt="company"
            className="w-12 h-12"
          />
          <div>
            <h3 className="text-lg font-semibold">{selectedJob.title}</h3>
            <p className="text-sm text-gray-500">
              {selectedJob.company}, {selectedJob.location}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold text-gray-900">Minimum qualifications:</h4>
            <ul className="list-disc list-inside">
              <li>Bachelor’s degree in Design or equivalent</li>
              <li>2+ years as a UX or Interaction Designer</li>
              <li>Experience in presenting and advocating</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Preferred qualifications:</h4>
            <ul className="list-disc list-inside">
              <li>Strong collaboration and presentation skills</li>
              <li>Excellent communication and teamwork</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">About the Job:</h4>
            <p>
              At {selectedJob.company}, we follow a simple but vital premise: “Focus on the user and all else will follow.”
            </p>
          </div>
        </div>
        <button className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default JobBoard;
