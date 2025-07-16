import { useState} from 'react';
import { FileText, Download, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { NDAsections } from '../data/data';
import ESignature from './Esignature';



export default function NDA(){
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    date: new Date().toISOString().split('T')[0]
  });
  const { kycData } = useSelector((state: RootState)=>state.kycReducer);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);





  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsCompleted(true);
    setIsSubmitting(false);
  };

  const isFormValid = formData.fullName && formData.email;

  

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">NDA Signed Successfully!</h2>
          <p className="text-gray-600 mb-6">Your signed NDA has been processed and saved. You can now access all features of our platform.</p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download Signed NDA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen   flex items-center justify-center p-4">
      <div className="bg-white/10 rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r bg-bgColor text-white p-6">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold text-limeTxt">Non-Disclosure and Intellectual Property Right Agreement</h1>
              <p className="text-blue-100">Please review and sign the agreement below</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className=" p-4">
          <div className="flex items-center justify-between text-sm">
            {
                ["Read Agreement", "Personal Information", "Electronic Signature"].map((item, index)=>(
                    <span key={item} className={`flex items-center gap-2 font-semibold ${step >= (index+1) ? 'text-white' : 'text-gray-300'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= (index+1) ? 'text-limeTxt bg-bgColor' : 'bg-gray-500'}`}>{index+1}</div>
                        {item}
                    </span>
                ))
            }
          </div>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-limeTxt">Agreement Terms</h2>
              <div className="bg-gray-50 rounded-lg p-6 h-auto  no-scrollbar">
                <div className="prose text-sm md:text-base text-gray-700 space-y-4">
                    <h3 className="font-bold text-lg text-bgColor">NON-DISCLOSURE AGREEMENT</h3>
                    <p>
                        This Non-Disclosure Agreement is entered into on {formData.date} by and between <b className='text-bgColor'>Agriconnect</b>, an agricultural non-governmental 
                        platform, and the undersigned individual <b className='text-bgColor'>{kycData.kyc.full_name}</b>.
                    </p>
                    <p>
                        You, the undersigned user <b className='text-bgColor'>{kycData.kyc.full_name}</b>, whether an Investor or any other authorized user who accesses, receives, views, or otherwise interacts with confidential and proprietary information available on the Platform.
                    </p>

                    {NDAsections.map((section, i) => (
                        <div key={i} className='mb-10'>
                            <h4 className="font-bold text-base md:text-xl mb-2 text-bgColor uppercase">{section.title}</h4>

                            {Array.isArray(section.content) ? (
                            <p>
                                {section.content.map((item, index) => (
                                <span key={index} className="block mb-2">
                                    <span className="font-bold text-bgColor mr-2">{item.split(' ')[0]}</span> {item.substring(item.indexOf(' ') + 1)}
                                </span>
                                ))}
                            </p>
                            ) : typeof section.content === 'string' ? (
                            <p>{section.content}</p>
                            ) : (
                            <div className='my-2'>{section.content}</div>
                            )}

                            {section.subSections?.map((sub, idx) => (
                            <div className='' key={idx}>
                                <h5 className="font-bold my-2 text-gray-900">{sub.title}</h5>
                                <p>{sub.content}</p>
                            </div>
                            ))}
                        </div>
                    ))}
                </div>

              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-600 font-semibold">Please read the entire agreement carefully before proceeding.</p>
              </div>
              <button 
                onClick={() => setStep(2)}
                className="w-full bg-bgColor hover:bg-green-900 cursor-pointer hover:text-white text-limeTxt font-medium py-3 px-4 rounded-lg uppercase"
              >
                I have read and understood the agreement
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-limeTxt">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-limeTxt mb-2">Full Legal Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-3 py-2 border outline-0 text-white font-medium border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your full legal name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-limeTxt mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border text-white font-medium border-gray-300 outline-0 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-limeTxt mb-2">Company/Organization</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full px-3 py-2 text-white font-medium border border-gray-300 rounded-lg outline-0 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your company name (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-limeTxt mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border text-white font-medium border-gray-300 outline-0 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border flex gap-2 items-center hover:text-white border-bgColor cursor-pointer text-limeTxt rounded-lg hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft />
                  Back
                </button>
                <button 
                  onClick={() => setStep(3)}
                  disabled={!formData.fullName || !formData.email}
                  className="flex-1 bg-bgColor hover:bg-green-900 hover:text-white disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-red-600 text-limeTxt cursor-pointer font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Continue to Sign NDA
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-limeTxt">Electronic Signature</h2>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <label className="block text-sm font-medium text-white mb-3">
                  Please sign below using your mouse or touch device *
                </label>
                <ESignature />
                
              </div>

              <div className=" rounded-lg p-4">
                <h3 className="font-medium text-limeTxt underline text-lg mb-2">Summary</h3>
                <div className="text-base md:text-lg text-gray-600 space-y-1">
                  <p className='text-limeTxt'><strong className='text-white'>Name:</strong> {formData.fullName}</p>
                  <p className='text-limeTxt'><strong className='text-white'>Email:</strong> {formData.email}</p>
                  <p className='text-limeTxt'><strong className='text-white'>Date:</strong> {formData.date}</p>
                  <p className='text-limeTxt'><strong className='text-white'>IP Address:</strong> 192.168.1.1 (for verification)</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  By signing below, you acknowledge that you have read, understood, and agree to be bound by the terms of this NDA.
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 flex gap-2 items-center py-2 border cursor-pointer border-gray-300 text-limeTxt hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft />
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                  className="flex-1 bg-bgColor hover:bg-green-900 cursor-pointer hover:text-white disabled:bg-gray-300 text-limeTxt font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    'Sign NDA Agreement'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

