import {  useState } from "react"; 
import EditProfile from "./EditProfile";


export default function UserProfile() {
  const [selectedBtn, setSelectedBtn] = useState<string>('Edit Profile');

  return (
    <div className="min-h-screen flex items-center justify-center lg:bg-white/5 sm:bg-none">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-md border border-white/20 space-y-6">
        {/* Navigation */}
        <nav className="w-full">
          <ul className="flex justify-between font-semibold">
            {["Edit Profile", "Edit KYC"].map((name) => (
              <li key={name}>
                <button
                  onClick={() => setSelectedBtn(name)}
                  className={`px-4 py-2 cursor-pointer outline-0 border-0 rounded-lg transition duration-150 ${
                    selectedBtn === name
                      ? "bg-bgColor text-limeTxt hover:text-white" 
                      : "text-limeTxt hover:text-lime-500"
                  }`}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="w-full">
          {selectedBtn === 'Edit Profile' && <EditProfile />}
          {selectedBtn === 'Edit KYC' && (
            <div className="text-center text-white py-10 md:py-0">
              <p>KYC Editing Coming Soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
