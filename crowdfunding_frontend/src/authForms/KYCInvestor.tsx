import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { AppDispatch, RootState } from '../redux/store';
import { investorKYC } from '../redux/KycSlice';
import KYC from './KYC';
import logo from '../assets/green_logo.png';
import image from '../assets/login_img.jpg';
import Loader from '../Utils/Loader';

interface IDCard{
  "Passport": string,
  "National ID": string,
  "Diver's License": string,
}

const selectID: IDCard = {
  Passport: 'passport',
  "National ID": 'national_id',
  "Diver's License": 'driver_license'
}


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
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.kycReducer);

  function truncateFilename(file: File, maxLength: number = 95): File{
    if (file.name.length <= maxLength) return file;
    
    const extension = file.name.split('.').pop() || '';
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
    const maxNameLength = maxLength - extension.length - 1; 
    const truncatedName = nameWithoutExt.substring(0, maxNameLength);
    
    console.log(`Truncating filename: ${file.name} -> ${truncatedName}.${extension}`);
    
    const newFile = new File([file], `${truncatedName}.${extension}`, {
      type: file.type,
      lastModified: file.lastModified,
    });
    
    return newFile;
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>){
    const { name, value, files } = e.target as HTMLInputElement;
    
    if (files && files[0]) {
      const truncatedFile = truncateFilename(files[0]);
      setFormData(prev => ({
        ...prev,
        [name]: truncatedFile,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  function validateStep(step: number){
    const newErrors: { [key: string]: string } = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      } else {
        // Check if user is 18 years or older
        const today = new Date();
        const birthDate = new Date(formData.dateOfBirth);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // Adjust age if birthday hasn't occurred this year
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
          ? age - 1 
          : age;
        
        if (actualAge < 18) {
          newErrors.dateOfBirth = 'You must be 18 years or older to proceed';
        }
      }
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
    setCurrentStep(prev => prev + 1);
  };

  function handlePrevious(){
    setCurrentStep(prev => prev - 1);
  };

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault();
    const validationErrors = validateStep(currentStep);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('full_name', formData.fullName);
      formDataToSend.append('date_of_birth', formData.dateOfBirth);
      formDataToSend.append('nationality', formData.nationality);
      formDataToSend.append('id_type', formData.idType);
      formDataToSend.append('id_number', formData.idNumber);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('occupation', formData.occupation);
      formDataToSend.append('income_source', formData.incomeSource);
      formDataToSend.append('annual_income', formData.annualIncome);
      formDataToSend.append('purpose', formData.purpose);
      formDataToSend.append('phone_number', formData.phoneNumber);
      
      if (formData.idUpload) {
        const truncatedIdFile = truncateFilename(formData.idUpload);
        formDataToSend.append('id_document', truncatedIdFile);
      }
      if (formData.profilePicture) {
        const truncatedProfileFile = truncateFilename(formData.profilePicture);
        formDataToSend.append('profile_picture', truncatedProfileFile);
      }

      console.log('Submitting KYC with files:', {
        idDocument: formData.idUpload?.name,
        profilePicture: formData.profilePicture?.name
      });

      await dispatch(investorKYC(formDataToSend)).unwrap();
    } catch (err) {
      console.error('KYC submission failed:', err);
    }
  };

  const inputClass = 'w-full px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm shadow-sm';
  const selectClass = 'w-full px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm shadow-sm';
  const fileInputClass = 'w-full px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg text-gray-900 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm shadow-sm';

  return (
    <>
      {loading && <Loader text='Submitting'/>}
      <KYC>
        <div className="min-h-screen font-Outfit flex items-center justify-center relative overflow-hidden py-4">
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
            <div className="bg-white/40 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/30">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-3">
                  <img src={logo} alt="" className='h-8'/>
                </div>
                <h2 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
                  Investor KYC Verification
                </h2>
                <p className="text-white/90 text-xs font-medium drop-shadow">
                  Step {currentStep} of 3
                </p>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  {['Personal Info', 'Identification', 'Financial Details'].map((item, index) => (
                    <span key={index} className="text-white text-base drop-shadow">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="w-full bg-white/30 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  />
                </div>
              </div>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {currentStep === 1 && (
                  <>
                    <div>
                      <input
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder='Full Name'
                      />
                      {errors.fullName && <p className="text-xs font-bold text-red-600 mt-1 drop-shadow">{errors.fullName}</p>}
                    </div>

                    <div>
                      <input
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder='Phone Number'
                      />
                      {errors.phoneNumber && <p className="text-xs font-bold text-red-600 mt-1 drop-shadow">{errors.phoneNumber}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-semibold text-xs mb-1 drop-shadow">Date of Birth (Must be 18+)</label>
                        <input
                          name="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className={inputClass}
                          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                        />
                        {errors.dateOfBirth && <p className="text-xs font-bold text-red-600 mt-1 drop-shadow">{errors.dateOfBirth}</p>}
                      </div>

                      <div>
                        <label className="block text-white font-semibold text-xs mb-1 drop-shadow">Nationality</label>
                        <input
                          name="nationality"
                          type="text"
                          value={formData.nationality}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder='Nationality'
                        />
                        {errors.nationality && <p className="text-xs font-bold text-red-600 mt-1 drop-shadow">{errors.nationality}</p>}
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div>
                     <select
                        name="idType"
                        value={formData.idType}
                        onChange={handleChange}
                        className={selectClass}
                      >
                        <option disabled hidden value="">Select ID Type</option>
                        {
                          Object.entries(selectID).map(([label, value])=>
                            <option value={value}>{label}</option>
                          )
                        }
                        
                      </select>
                      {errors.idType && <p className="text-xs font-bold text-red-600 mt-1 drop-shadow">{errors.idType}</p>}
                    </div>

                    <div>
                      <input
                        name="idNumber"
                        type="text"
                        value={formData.idNumber}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder='ID Number'
                      />
                      {errors.idNumber && <p className="text-xs font-bold text-red-600 mt-1 drop-shadow">{errors.idNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-white font-semibold text-xs mb-1 drop-shadow">Upload ID Document</label>
                      <input
                        name="idUpload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleChange}
                        className={fileInputClass}
                      />
                      {errors.idUpload && <p className="text-xs font-bold text-red-600 mt-1 drop-shadow">{errors.idUpload}</p>}
                    </div>

                    <div>
                      <label className="block text-white font-semibold text-xs mb-1 drop-shadow">Upload Profile Picture</label>
                      <input
                        name="profilePicture"
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className={fileInputClass}
                      />
                      {errors.profilePicture && <p className="text-xs font-bold text-red-600 mt-1 drop-shadow">{errors.profilePicture}</p>}
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <div>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder='Residential Address'
                        className="w-full px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none text-sm shadow-sm"
                        rows={2}
                      />
                      {errors.address && <p className="text-xs font-bold text-red-600 mt-1 drop-shadow">{errors.address}</p>}
                    </div>

                    <div>
                      <input
                        name="occupation"
                        type="text"
                        value={formData.occupation}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder='Occupation'
                      />
                      {errors.occupation && <p className="text-xs font-bold text-red-600 mt-1 drop-shadow">{errors.occupation}</p>}
                    </div>

                    <div>
                      <select
                        name="incomeSource"
                        value={formData.incomeSource}
                        onChange={handleChange}
                        className={selectClass}
                      >
                        <option disabled value="">Select Source</option>
                        {
                          ['Salary', 'Business', 'Investment', 'Other'].map(item=>
                            <option key={item} value={item.toLowerCase()}>{item}</option>
                          )
                        }
                      </select>
                      {errors.incomeSource && <p className="text-xs font-bold text-red-600 mt-1 drop-shadow">{errors.incomeSource}</p>}
                    </div>

                    <div>
                      <input
                        name="annualIncome"
                        type="number"
                        value={formData.annualIncome}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder='Annual Income (USD)'
                      />
                      {errors.annualIncome && <p className="text-xs font-bold text-red-600 mt-1 drop-shadow">{errors.annualIncome}</p>}
                    </div>

                    <div>
                      <textarea
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none text-sm shadow-sm"
                        rows={2}
                        placeholder='Purpose of Account'
                      />
                      {errors.purpose && <p className="text-xs font-bold text-red-600 mt-1 drop-shadow">{errors.purpose}</p>}
                    </div>
                  </>
                )}

                <div className="flex justify-between pt-4">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="bg-bgColor cursor-pointer hover:bg-white/30 backdrop-blur-sm text-limeTxt font-medium py-2 px-4 rounded-lg transition-all duration-200 border border-white/30 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm shadow-lg"
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
                        className="bg-bgColor cursor-pointer hover:bg-white/30 font-medium py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-lg"
                      >
                        <ArrowRight className='text-limeTxt'/>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className={`bg-bgColor cursor-pointer hover:bg-white/30 text-limeTxt font-medium py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-lg ${
                          loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
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
    </KYC>
    </>
  );
}