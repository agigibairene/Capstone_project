import { useState } from "react";
import { opportunities } from "../data/opportunities";
import type { Opportunity } from "../data/opportunities";

export default function Grants() {
  const [selected, setSelectedOpp] = useState<Opportunity | null>(null);

  return (
    <section className="px-4 py-10 md:px-8 lg:px-16 bg-gray-50 min-h-screen relative">
      <h1 className={`text-center text-3xl md:text-4xl font-bold text-gray-800 mb-12 ${
        selected ? "hidden md:block" : "block"
      }`}>
        Grants & Opportunities
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div
          className={`grid gap-8 w-full ${
            !selected
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" // No selection: mobile 1 col, medium 2 cols, large 3 cols
              : "grid-cols-1 md:grid-cols-1 lg:grid-cols-2" // Selection: mobile 1 col, medium 1 col, large 2 cols
          } ${selected ? "md:w-1/2 lg:w-2/3" : ""}`} // Adjust width when selected
        >

          {[...opportunities, ...opportunities, ...opportunities].map((item, index) => {
            const {
              title,
              organization,
              location,
              type,
              description,
              amount,
            } = item;

            const isSelected = selected === item;

            return (
              <div
                key={index}
                className={`cursor-pointer bg-white rounded-2xl p-6 shadow-md ${
                  isSelected ? "border-2 border-limeTxt" : "border"
                } border-gray-200 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-5">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      S
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                      <p className="text-sm text-gray-500">{organization}</p>
                    </div>
                  </div>
                  <button
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Add to favorites"
                  >
                    ♡
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1 font-bold">🕒 {type}</span>
                  <span className="flex items-center gap-1">📍 {location}</span>
                  <span className="flex items-center gap-1">📅 2 days ago</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-4">{description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {["Nature", "Funding", "Agriculture"].map((tag) => (
                    <span
                      key={tag}
                      className={`${
                        tag === "Full-time"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-teal-200 text-bgColor"
                      } py-1 px-3 rounded-full text-xs font-medium`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t pt-4 mt-auto">
                  <span className="text-green-600 font-semibold text-sm">{amount}</span>
                  <button
                    onClick={() => setSelectedOpp(item)}
                    className="bg-btn cursor-pointer hover:bg-bgColor text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Section - Side panel for medium and large screens */}
        {selected && (
          <div className="hidden md:flex flex-col w-1/2 lg:w-1/3 bg-white p-6 rounded-xl shadow-md sticky top-6 h-fit self-start">
            <div className="flex justify-between items-start mb-4">
              <button
                onClick={() => setSelectedOpp(null)}
                className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
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
              <p>
                <strong>Team:</strong> {selected.team || "N/A"}
              </p>
              <p>
                <strong>Type:</strong> {selected.type}
              </p>
              <p>
                <strong>Funding Amount:</strong> {selected.amount}
              </p>
            </div>

            <p className="text-gray-700 text-sm mb-6">{selected.fullDescription}</p>

            <button className="w-full bg-btn hover:bg-bgColor text-white py-2 rounded-md font-semibold transition">
              Apply Now
            </button>
          </div>
        )}
      </div>

      {/* Mobile Fullscreen Detail View */}
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
              <h3 className="text-xl font-semibold text-gray-800">{selected.title}</h3>
              <p className="text-sm text-gray-500">
                {selected.organization}, {selected.location}
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            <p>
              <strong>Team:</strong> {selected.team || "N/A"}
            </p>
            <p>
              <strong>Type:</strong> {selected.type}
            </p>
            <p>
              <strong>Funding Amount:</strong> {selected.amount}
            </p>
          </div>

          <p className="text-gray-700 text-sm mb-6">{selected.fullDescription}</p>

          <button className="w-full bg-btn hover:bg-bgColor text-white py-2 rounded-md font-semibold transition">
            Apply Now
          </button>
        </div>
      )}
    </section>
  );
}