/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { X, Phone, Mail } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const API_URL  = import.meta.env.VITE_API_URL;


type InterestProps = {
  isOpen: boolean;
  onClose: () => void;
  farmerName: string;
  email: string;
  phoneNumber: string;
  projectId: string;
};

export default function InterestedInProject({isOpen,onClose,farmerName,email,phoneNumber,projectId}: InterestProps) {
  if (!isOpen) return null;

  console.log(projectId)

  const token = localStorage.getItem('ACCESS_TOKEN');

  const handleSelection = async (method: "phone" | "email") => {
    try {
      await fetch(`${API_URL}/projects/${projectId}/investors_interest/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ method }),
      });


      toast.success(
        <div className="flex items-center space-x-3">
          <div>
            <p className="font-semibold">Thank you!</p>
            <p className="text-sm">You can now contact {farmerName} via {method === "phone" ? "phone call" : "email"}.</p>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClose: () => {
            setTimeout(() => onClose(), 100);
          }
        }
      );
    } catch (error: any) {
      toast.error(error.message ||"Failed to confirm interest. Please try again.");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all scale-100 animate-in">
          <div className="relative bg-gradient-to-r from-bgColor to-emerald-800 text-white p-6 rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all duration-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="pr-12">
              <h2 className="text-xl font-bold mb-2">Connect with Farmer</h2>
              <p className="text-limeTxt font-medium">{farmerName}</p>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-600 text-center mb-4">
                Choose how you'd like to reach out to the farmer:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="text-gray-800 font-medium break-all">{email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                    <p className="text-gray-800 font-medium">{phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSelection("phone")}
                className="w-full flex items-center justify-center space-x-3 bg-blue-400 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
              >
                <Phone className="w-5 h-5" />
                <span>Call Now</span>
              </button>
              
              <button
                onClick={() => handleSelection("email")}
                className="w-full flex items-center justify-center space-x-3 bg-bgColor hover:bg-emerald-800 text-limeTxt px-6 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
              >
                <Mail className="w-5 h-5" />
                <span>Send Email</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 text-gray-500 hover:text-gray-700 py-2 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="z-[9999]"
      />
    </>
  );
}
