import { useState } from "react";
import { opportunities } from "../data/opportunities";

export default function Grants() {
  const [selected, setSelected] = useState(null);

  return (
    <section className="px-4 py-10 md:px-8 lg:px-16 bg-gray-50 min-h-screen">
      <h1 className="text-center text-3xl md:text-4xl font-bold text-gray-800 mb-12">
        Grants & Opportunities
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* List of Opportunities */}
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 flex-1">
          {[...opportunities, ...opportunities].map((item) => {
            const {
              id,
              title,
              organization,
              location,
              team,
              type,
              description,
              amount,
            } = item;

            return (
              <div
                key={id}
                className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      S
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {title}
                      </h2>
                      <p className="text-sm text-gray-500">{organization}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1 font-bold">
                    🕒 {type}
                  </span>
                  <span className="flex items-center gap-1">📍 {location}</span>
                  <span className="flex items-center gap-1">📅 2 days ago</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {description}
                </p>

                <div className="flex justify-between items-center border-t pt-4 mt-auto">
                  <span className="text-emerald-600 font-semibold text-sm">
                    {amount}
                  </span>
                  <button
                    onClick={() => setSelected(item)}
                    className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed View */}
        {selected && (
          <div className="w-full lg:max-w-md bg-white p-6 rounded-xl shadow-md border border-gray-200 sticky top-6 h-fit">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                S
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {selected.title}
                </h3>
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

            <p className="text-gray-700 text-sm mb-6">{selected.description}</p>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition">
              Apply Now
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
