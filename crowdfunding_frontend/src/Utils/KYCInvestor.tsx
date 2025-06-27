import { useState } from 'react';
import image from '../assets/login_img.jpg';
import logo from '../assets/green_logo.png';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function KYCInvestor() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    idType: '',
    idNumber: '',
    idUpload: null as File | null,
    profilePicture: null as File | null,
    address: '',
    occupation: '',
    incomeSource: '',
    annualIncome: '',
    purpose: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>){
    const { name, value, files } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  function validateStep(step: number){
    const newErrors: { [key: string]: string } = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
      if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    }
    
    if (step === 2) {
      if (!formData.idType) newErrors.idType = 'ID type is required';
      if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
      if (!formData.idUpload) newErrors.idUpload = 'ID document is required';
      if (!formData.profilePicture) newErrors.profilePicture = 'Profile picture is required';
    }
    
    if (step === 3) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required';
      if (!formData.incomeSource) newErrors.incomeSource = 'Income source is required';
      if (!formData.annualIncome) newErrors.annualIncome = 'Annual income is required';
      if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
    }

    return newErrors;
  };

  function handleNext(){
    const validationErrors = validateStep(currentStep);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setCurrentStep(prev => prev + 1);
  };

  function handlePrevious(){
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  function handleSubmit(e: React.FormEvent){
    e.preventDefault();
    const validationErrors = validateStep(currentStep);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    console.log('KYC form data:', formData);
    alert('KYC form submitted successfully!');
  };

  const inputClass = 'w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 text-sm'


  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-4">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${image})`,
          filter: 'blur(0.5px) brightness(0.7)',
          transform: 'scale(1)'
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 via-teal-500/20 to-blue-600/40" />
      
      <div className="relative z-10 w-full max-w-xl px-4 mx-4">
        <div className="bg-white/30 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <img src={logo} alt="" className='h-8'/>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              Tell us more about yourself
            </h2>
            <p className="text-white/70 text-xs">
              Step {currentStep} of 3
            </p>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between mb-1">
               {
                  ['Personal Info', 'Project Details','Funding & Final'].map((item)=>{
                    return <span className="text-bgColor font-bold text-xs">{item}</span>
                  })
                }
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {currentStep === 1 && (
              <>
                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1">Full Name</label>
                  <input
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.fullName && <p className="text-xs font-bold text-red-600 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1">Phone Number</label>
                  <input
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.phoneNumber && <p className="text-xs font-bold text-red-600 mt-1">{errors.phoneNumber}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1">Date of Birth</label>
                    <input
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={inputClass}
                    />
                    {errors.dateOfBirth && <p className="text-xs font-bold text-red-600 mt-1">{errors.dateOfBirth}</p>}
                  </div>

                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1">Nationality</label>
                    <input
                      name="nationality"
                      type="text"
                      value={formData.nationality}
                      onChange={handleChange}
                      className={inputClass}
                    />
                    {errors.nationality && <p className="text-xs font-bold text-red-600 mt-1">{errors.nationality}</p>}
                  </div>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1">ID Type</label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="" className="bg-gray-800 text-white">Select ID Type</option>
                    <option value="passport" className="bg-gray-800 text-white">Passport</option>
                    <option value="national_id" className="bg-gray-800 text-white">National ID</option>
                    <option value="driver_license" className="bg-gray-800 text-white">Driver's License</option>
                  </select>
                  {errors.idType && <p className="text-xs font-bold text-red-600 mt-1">{errors.idType}</p>}
                </div>

                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1">ID Number</label>
                  <input
                    name="idNumber"
                    type="text"
                    value={formData.idNumber}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.idNumber && <p className="text-xs font-bold text-red-600 mt-1">{errors.idNumber}</p>}
                </div>

                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1">Upload ID Document</label>
                  <input
                    name="idUpload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-white/20 file:text-white hover:file:bg-white/30 file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 text-sm"
                  />
                  {errors.idUpload && <p className="text-xs font-bold text-red-600 mt-1">{errors.idUpload}</p>}
                </div>

                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1">Upload Profile Picture</label>
                  <input
                    name="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-white/20 file:text-white hover:file:bg-white/30 file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 text-sm"
                  />
                  {errors.profilePicture && <p className="text-xs font-bold text-red-600 mt-1">{errors.profilePicture}</p>}
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1">Residential Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 resize-none text-sm"
                    rows={2}
                  />
                  {errors.address && <p className="text-xs font-bold text-red-600 mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1">Occupation</label>
                  <input
                    name="occupation"
                    type="text"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 text-sm"
                  />
                  {errors.occupation && <p className="text-xs font-bold text-red-600 mt-1">{errors.occupation}</p>}
                </div>

                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1">Source of Income</label>
                  <select
                    name="incomeSource"
                    value={formData.incomeSource}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 text-sm"
                  >
                    <option value="" className="bg-gray-800 text-white">Select Source</option>
                    <option value="salary" className="bg-gray-800 text-white">Salary</option>
                    <option value="business" className="bg-gray-800 text-white">Business</option>
                    <option value="investment" className="bg-gray-800 text-white">Investment</option>
                    <option value="other" className="bg-gray-800 text-white">Other</option>
                  </select>
                  {errors.incomeSource && <p className="text-xs font-bold text-red-600 mt-1">{errors.incomeSource}</p>}
                </div>

                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1">Annual Income (USD)</label>
                  <input
                    name="annualIncome"
                    type="number"
                    value={formData.annualIncome}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 text-sm"
                  />
                  {errors.annualIncome && <p className="text-xs font-bold text-red-600 mt-1">{errors.annualIncome}</p>}
                </div>

                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1">Purpose of Account</label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 resize-none text-sm"
                    rows={2}
                  />
                  {errors.purpose && <p className="text-xs font-bold text-red-600 mt-1">{errors.purpose}</p>}
                </div>
              </>
            )}

            <div className="flex justify-between pt-4">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="bg-bgColor cursor-pointer hover:bg-white/30 backdrop-blur-sm text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                  >
                    <ArrowLeft className='text-limeTxt'/>
                  </button>
                )}
              </div>
              
              <div>
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-bgColor cursor-pointer hover:bg-white/30 backdrop-blur-sm text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                  >
                    <ArrowRight className='text-limeTxt'/>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                  >
                    Submit KYC
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}