import { useState } from "react";
import { opportunities } from "../data/opportunities";
import type { Opportunity } from "../data/opportunities";
import GrantsHeader from "../Utils/GrantsHeader";
import { GiTakeMyMoney } from "react-icons/gi";
import { GrFavorite } from "react-icons/gr";


export default function Grants() {
  const [selected, setSelectedOpp] = useState<Opportunity | null>(null);

  const jobCounts = {
    fullTime: 321,
    freelance: 574,
    partTime: 192,
    under1: 321,
    oneToTwo: 665,
    twoToSix: 192,
    overSix: 192
  };



  const arr= [
    {
      title: 'Grants',
      icon: <GiTakeMyMoney size={50} className="text-limeTxt" />,
      value: 531
    },
    {
      title: 'Hackthons',
      icon: <GiTakeMyMoney size={50} className="text-limeTxt" />,
      value: 531
    },
    {
      title: 'Conferences',
      icon: <GiTakeMyMoney size={50} className="text-limeTxt"/>,
      value: 531
    },
    {
      title: 'Favorites',
      icon: <GrFavorite size={50} className="text-limeTxt" />,
      value: 0
    }
  ]


  return (
   <section>
    <GrantsHeader />
     <div className="px-4 py-10 md:px-8 lg:px-16 bg-gray-50 min-h-screen relative font-Outfit">
      <h1 className={`text-left text-3xl md:text-4xl font-bold text-bgColor mb-12 ${
        selected ? "hidden md:block" : "block"
      }`}>
        Grants & Opportunities
      </h1>

      <div className="flex gap-6 mb-8">
        {
          arr.map((item)=>{
            const {title, icon, value} = item;
            return <div key={title} className="bg-white w-[15rem] p-8 shadow-md rounded-xl flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <p className="text-teal-500 text-3xl font-bold hover:text-teal-700 cursor-pointer">{value}</p>
                <h3 className="font-semibold text-bgColor">{title}</h3>
              </div>
              {icon}
             </div>
          })
        }
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={`${selected ? "md:col-span-1" : "md:col-span-2"} lg:col-span-2 grid gap-6 ${
          selected ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
        } lg:grid-cols-2`}>
          {[...opportunities, ...opportunities].map((item, index) => {
            const isSelected = selected === item;

            return (
              <div
                key={index}
                className={`cursor-pointer bg-white rounded-2xl p-6 shadow-md ${
                  isSelected ? "border-2 border-limeTxt" : "border"
                } border-gray-200 transition hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-5">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      S
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
                  <span>📅 2 days ago</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-4">{item.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {["Nature", "Funding", "Agriculture"].map(tag => (
                    <span key={tag} className="bg-teal-200 text-bgColor py-1 px-3 rounded-full text-xs font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t pt-4 mt-auto">
                  <span className="text-green-600 font-semibold text-sm">{item.amount}</span>
                  <button
                    onClick={() => setSelectedOpp(item)}
                    className="bg-teal-700 cursor-pointer hover:bg-teal-900 text-white py-2 px-4 rounded-md text-sm font-medium"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column - Fixed Filter or Detail View */}
        {selected ? (
          <div className="md:col-span-1 lg:col-span-1">
            <div className="sticky top-20 bg-white p-6 rounded-xl shadow-md h-fit">
              <div className="flex justify-between items-start mb-4">
                <button
                  onClick={() => setSelectedOpp(null)}
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                  S
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
              </div>

              <p className="text-gray-700 text-sm mb-6">{selected.fullDescription}</p>

              <button className="w-full cursor-pointer bg-teal-700 hover:bg-teal-900 text-white py-2 rounded-md font-semibold">
                Apply Now
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20 rounded-xl h-fit">
              <div className="px-6 pb-4 h-full overflow-hidden">
                <div className="bg-white p-6 shadow-md rounded-xl flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Opportunities Filter</h3>
                  <button className="text-teal-500 text-sm hover:text-teal-700 cursor-pointer">Clear all</button>
                </div>

                {/* Opportunties Filter */}
                <div className="bg-white p-6 shadow-md rounded-xl mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">Opportunities Type</h4>
                  {['Grants', 'Loans & Funds', 'Hackathons'].map((key) => (
                    <label key={key} className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      </div>
                      <span className="text-gray-500 text-sm">{jobCounts[key as keyof typeof jobCounts]} Opportunities</span>
                    </label>
                  ))}
                </div>

                {/*  Filter */}
                <div className="bg-white p-6 shadow-md rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-4">Other filters</h4>
                  {['Location', 'Amount', 'twoToSix', 'overSix'].map((key) => (
                    <label key={key} className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
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
        )}
      </div>

      {/* Mobile Detail View */}
      {selected && (
        <div className="fixed inset-0 bg-white z-50 p-6 overflow-y-auto md:hidden">
          <button
            onClick={() => setSelectedOpp(null)}
            className="text-gray-500 hover:text-gray-700 mb-4"
          >
            ← Back
          </button>

          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
              S
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-bgColor">{selected.title}</h3>
              <p className="text-sm text-gray-500">
                {selected.organization}, {selected.location}
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            <p><strong>Type:</strong> {selected.type}</p>
            <p><strong>Funding Amount:</strong> {selected.amount}</p>
          </div>

          <p className="text-gray-700 text-sm mb-6">{selected.fullDescription}</p>

          <button className="w-full cursor-pointer bg-teal-700 hover:bg-teal-700 text-white py-2 rounded-md font-semibold">
            Apply Now
          </button>
        </div>
      )}
    </div>
   </section>
  );
}