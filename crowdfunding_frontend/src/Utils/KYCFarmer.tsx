import { useState } from 'react';
import image from '../assets/login_img.jpg';
import logo from '../assets/green_logo.png';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function KYCFarmer() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: '',
    background: '',
    projectTitle: '',
    projectDescription: '',
    estimatedBudget: '',
    fundingNeeded: '',
    location: '',
    projectDocument: null as File | null,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, files } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function validateStep(step: number) {
    const newErrors: { [key: string]: string } = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
      if (!formData.role.trim()) newErrors.role = 'Role is required';
    }
    
    if (step === 2) {
      if (!formData.background.trim()) newErrors.background = 'Background info is required';
      if (!formData.projectTitle.trim()) newErrors.projectTitle = 'Project title is required';
      if (!formData.projectDescription.trim()) newErrors.projectDescription = 'Description is required';
    }
    
    if (step === 3) {
      if (!formData.estimatedBudget.trim()) newErrors.estimatedBudget = 'Budget is required';
      if (!formData.fundingNeeded.trim()) newErrors.fundingNeeded = 'Funding needed is required';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
    }

    return newErrors;
  }

  function handleNext() {
    const validationErrors = validateStep(currentStep);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setCurrentStep(prev => prev + 1);
  }

  function handlePrevious() {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateStep(currentStep);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    console.log('Investment seeker data:', formData);
    alert('Form submitted successfully!');
  }

  const inputClass = 'w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 text-sm'

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-4">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${image})`,
          filter: 'blur(0.5px) brightness(0.9)',
          transform: 'scale(1.1)'
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
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-white/80 text-xs font-medium mb-1">Full Name</label>
                  <input
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.fullName && <p className="text-xs text-red-600 font-bold mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.email && <p className="text-xs font-bold text-red-600 mt-1">{errors.email}</p>}
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

                <div className="md:col-span-2">
                  <label className="block text-white/80 text-xs font-medium mb-1">Your Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 text-sm"
                  >
                    <option value="" className="bg-gray-800 text-white">Select Role</option>
                    <option value="Student" className="bg-gray-800 text-white">Student</option>
                    <option value="Farmer" className="bg-gray-800 text-white">Farmer</option>
                    <option value="Entrepreneur" className="bg-gray-800 text-white">Entrepreneur</option>
                    <option value="Other" className="bg-gray-800 text-white">Other</option>
                  </select>
                  {errors.role && <p className="text-xs font-bold text-red-600 mt-1">{errors.role}</p>}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1">Brief Background</label>
                  <textarea
                    name="background"
                    value={formData.background}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 text-sm"
                    rows={2}
                  />
                  {errors.background && <p className="text-xs font-bold text-red-600 mt-1">{errors.background}</p>}
                </div>

                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1">Project Title</label>
                  <input
                    name="projectTitle"
                    type="text"
                    value={formData.projectTitle}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.projectTitle && <p className="text-xs font-bold text-red-600 mt-1">{errors.projectTitle}</p>}
                </div>

                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1">Project Description</label>
                  <textarea
                    name="projectDescription"
                    value={formData.projectDescription}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 resize-none text-sm"
                    rows={3}
                  />
                  {errors.projectDescription && <p className="text-xs font-bold text-red-600 mt-1">{errors.projectDescription}</p>}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1">Estimated Budget (GHS)</label>
                  <input
                    name="estimatedBudget"
                    type="number"
                    value={formData.estimatedBudget}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.estimatedBudget && <p className="text-xs font-bold text-red-600 mt-1">{errors.estimatedBudget}</p>}
                </div>

                <div>
                  <label className="block text-white/80 text-xs font-medium mb-1">Funding Needed (GHS)</label>
                  <input
                    name="fundingNeeded"
                    type="number"
                    value={formData.fundingNeeded}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.fundingNeeded && <p className="text-xs font-bold text-red-600 mt-1">{errors.fundingNeeded}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/80 text-xs font-medium mb-1">Project Location</label>
                  <input
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.location && <p className="text-xs font-bold text-red-600 mt-1">{errors.location}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/80 text-xs font-medium mb-1">Upload Document (PDF)</label>
                  <input
                    name="projectDocument"
                    type="file"
                    accept=".pdf"
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="bg-bgColor cursor-pointer backdrop-blur-sm hover:bg-white/30 font-medium py-2 px-4 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
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
                    className="bg-bgColor cursor-pointer hover:bg-white/30 backdrop-blur-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                  >
                    <ArrowRight className='text-limeTxt'/>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                  >
                    Submit
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