import { useState } from "react";
import { X } from "lucide-react";

interface PoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function Ethics({ isOpen, onClose, onAccept } : PoliciesModalProps){
  const [isAccepted, setIsAccepted] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (isAccepted) {
      onAccept();
      setIsAccepted(false); 
    }
  };

  const handleClose = () => {
    setIsAccepted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Policies & Terms</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-4 sm:space-y-6">
            <section>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-bgColor">1. User Acknowledgement & Roles</h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                Upon registration, users must specify their role as either a <strong>Farmer</strong> or an
                <strong> Investor</strong>. Each role comes with unique responsibilities and platform access.
              </p>
            </section>

            <section>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-bgColor">2. Liability Disclaimer</h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                SEEDLINQ serves as a facilitation platform only and holds no responsibility for any
                financial loss or misrepresentation in listed projects. Users invest and list projects
                at their own discretion and risk.
              </p>
            </section>

            <section>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-bgColor">3. Access Limitations</h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                Investors are prohibited from sharing, replicating, or executing any project proposals
                without explicit written consent from the proposal owners.
              </p>
            </section>

            <section>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-bgColor">4. Termination Clause</h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                Any violation of platform terms, misuse of data, or fraudulent activity may result in
                immediate account deactivation and potential legal action.
              </p>
            </section>

            <section>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-bgColor">5. Copyright Policy</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm sm:text-base">
                <li>Farmers retain full ownership of uploaded project proposals.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-bgColor">6. Privacy Policy</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm sm:text-base">
                <li>
                  <strong>Data Collected:</strong> Name, email, phone number, ID, ID number, picture, location, brief background, annual income, source of income, proposals and business plan 
                </li>
                <li>
                  <strong>Usage:</strong> For authentication, communication, data analysis, and improving
                  platform services.
                </li>
                <li>
                  <strong>Security:</strong> Data is encrypted, protected with multi-factor authentication, and
                  stored in secure environments.
                </li>
                <li>
                  <strong>Third-Party Access:</strong> No user data will be shared without explicit user consent.
                </li>
                <li>
                  <strong>Right to Delete:</strong> Users may request account and data deletion at any time,
                  in compliance with GDPR principles.
                </li>
              </ul>
            </section>

            <p className="text-xs sm:text-sm text-gray-500 text-center mt-6 sm:mt-8">Last Updated: July 2025</p>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="border-t border-gray-200 p-4 sm:p-6 flex-shrink-0">
          <div className="flex items-start sm:items-center space-x-3 mb-4">
            <input
                type="checkbox"
                id="accept-policies"
                checked={isAccepted}
                onChange={(e) => setIsAccepted(e.target.checked)}
                className="w-4 h-4 accent-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5 sm:mt-0 flex-shrink-0"
              />
              <label htmlFor="accept-policies" className="text-sm sm:text-base font-400 text-red-500 leading-tight">
              I have read and agree to the above policies and terms
            </label>
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              disabled={!isAccepted}
              className={`px-6 py-2 rounded-md font-semibold transition-all order-1 sm:order-2 ${
                isAccepted
                  ? 'bg-bgColor hover:bg-bgColor text-limeTxt cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};