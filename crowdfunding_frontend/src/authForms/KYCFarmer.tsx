import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import image from '../assets/login_img.jpg';
import logo from '../assets/green_logo.png';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import KYC from './KYC';
import { submitFarmerKYC } from '../redux/KycSlice';
import type { AppDispatch, RootState } from '../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../Utils/Loader';
import { countryCodes } from '../data/data';
import { API_URL } from '../Utils/constants';

export default function KYCFarmer() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+233', 
    phoneNumber: '',
    role: '',
    background: '',
    dateOfBirth: '',
    nationality: '',
    idType: '',
    idNumber: '',
    idDocument: null as File | null,
    profilePicture: null as File | null,
    address: '',
  });

  const dispatch = useDispatch<AppDispatch>()
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { loading, error } = useSelector((state: RootState) => state.kycReducer);
 


  useEffect(() => {
    async function fetchPrefillData() {
      try {
        const token = localStorage.getItem('ACCESS_TOKEN');
        if (!token) return;

        const response = await fetch(`${API_URL}/kyc/autofill/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("Prefill fetch error:", await response.json());
          return;
        }

        const data = await response.json();

        const phoneMatch = data.phone_number?.match(/^\+(\d{1,3})(\d{7,15})$/);
        const countryCode = phoneMatch ? `+${phoneMatch[1]}` : '+233';
        const phoneNumber = phoneMatch ? phoneMatch[2] : '';

        setFormData((prev) => ({
          ...prev,
          fullName: data.full_name || '',
          email: data.email || '',
          countryCode,
          phoneNumber,
          role: data.role || '',
        }));
      } catch (err) {
        console.error("Failed to fetch prefill data:", err);
      }
    }

    fetchPrefillData();
  }, []);

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
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required';
      } else {
        const phoneRegex = /^\d{7,15}$/;
        if (!phoneRegex.test(formData.phoneNumber.replace(/\s+/g, ''))) {
          newErrors.phoneNumber = 'Please enter a valid phone number (7-15 digits)';
        }
      }
      if (!formData.role.trim()) newErrors.role = 'Role is required';
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      } else {
        const today = new Date();
        const birthDate = new Date(formData.dateOfBirth);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ? age - 1
          : age;
        if (actualAge < 18) {
          newErrors.dateOfBirth = 'You must be 18 years or older to proceed';
        }
      }
      if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
    }

    if (step === 2) {
      if (!formData.background.trim()) newErrors.background = 'Background info is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    }

    if (step === 3) {
      if (!formData.idType.trim()) newErrors.idType = 'ID type is required';
      if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
      if (!formData.idDocument) newErrors.idDocument = 'ID document is required';
      if (!formData.profilePicture) newErrors.profilePicture = 'Profile picture is required';
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
    setCurrentStep((prev) => prev + 1);
  }

  function handlePrevious() {
    setCurrentStep((prev) => prev - 1);
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateStep(currentStep);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const data = new FormData();
    data.append('full_name', formData.fullName);
    data.append('email', formData.email);
    data.append('phone_number', `${formData.countryCode}${formData.phoneNumber}`);
    data.append('role', formData.role);
    data.append('background', formData.background);
    data.append('date_of_birth', formData.dateOfBirth);
    data.append('nationality', formData.nationality);
    data.append('id_type', formData.idType);
    data.append('id_number', formData.idNumber);
    if (formData.idDocument) data.append('id_document', formData.idDocument);
    if (formData.profilePicture) data.append('profile_picture', formData.profilePicture);
    data.append('address', formData.address);

    try {
      const resultAction = await dispatch(submitFarmerKYC(data));
      if (submitFarmerKYC.fulfilled.match(resultAction)) {
        navigate('/farmer');
      } else {
        console.error('KYC submission error:', resultAction.payload);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  }

  const inputClass = 'w-full px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-bgColor focus:border-emerald-500 transition-all duration-200 text-sm shadow-sm';
  const selectClass = 'w-full px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-bgColor focus:border-emerald-500 transition-all duration-200 text-sm shadow-sm';
  const fileInputClass = 'w-full px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg text-gray-900 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-bgColor focus:border-emerald-500 transition-all duration-200 text-sm shadow-sm';

  return (
    <>
      {loading && <Loader text='Submitting...'/>}
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
                <div className="flex justify-between font-Outfit mb-1">
                    {
                      ['Personal Info', 'Background','Docs & Verification'].map((item, index) => (
                        <span key={index} className="text-white  text-base">{item}</span>
                      ))
                    }
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                  </div>
                )}

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
                      <input
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder='Full Name'
                      />
                      {errors.fullName && <p className="text-xs text-red-600 font-bold mt-1">{errors.fullName}</p>}
                    </div>

                    <div className='md:col-span-2'>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder='Email'
                      />
                      {errors.email && <p className="text-xs font-bold text-red-600 mt-1">{errors.email}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-white/80 text-xs font-medium mb-1">Phone Number</label>
                      <div className="flex gap-2">
                        <select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleChange}
                          className="px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-bgColor focus:border-emerald-500 transition-all duration-200 text-sm shadow-sm w-24 flex-shrink-0"
                        >
                          {countryCodes.map((country) => (
                            <option key={country.code} value={country.code} className="text-gray-900 bg-white">
                              {country.flag} {country.code}
                            </option>
                          ))}
                        </select>
                        <input
                          name="phoneNumber"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className={`${inputClass} flex-1`}
                          placeholder='Phone Number (without country code)'
                        />
                      </div>
                      {errors.phoneNumber && <p className="text-xs font-bold text-red-600 mt-1">{errors.phoneNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-white/80 text-xs font-medium mb-1">Date of Birth (Must be 18+)</label>
                      <input
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className={inputClass}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}

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
                        placeholder="e.g., Ghanaian"
                      />
                      {errors.nationality && <p className="text-xs font-bold text-red-600 mt-1">{errors.nationality}</p>}
                    </div>

                    <div className="md:col-span-2">
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={selectClass}
                      >
                        <option value="" disabled>Select Occupation</option>
                        {['Student', 'Farmer', 'Entrepreneur', 'Other'].map((item) => (
                          <option key={item} value={item} className="text-gray-900 bg-white">
                            {item}
                          </option>
                        ))}
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
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bgColor focus:border-emerald-500 transition-all duration-200 text-sm"
                        rows={3}
                        placeholder="Tell us about your experience and background"
                      />
                      {errors.background && <p className="text-xs font-bold text-red-600 mt-1">{errors.background}</p>}
                    </div>

                    <div>
                      <label className="block text-white/80 text-xs font-medium mb-1">Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bgColor focus:border-emerald-500 transition-all duration-200 resize-none text-sm"
                        rows={3}
                        placeholder="Enter your complete address"
                      />
                      {errors.address && <p className="text-xs font-bold text-red-600 mt-1">{errors.address}</p>}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <select
                        name="idType"
                        value={formData.idType}
                        onChange={handleChange}
                        className={selectClass}
                      >
                        <option value="" disabled hidden>Select ID Type</option>
                        {['National ID', 'Passport', 'Driver\'s License', 'Voter ID'].map((item) => (
                          <option key={item} value={item} className="text-gray-900 bg-white">
                            {item}
                          </option>
                        ))}
                      </select>
                      {errors.idType && <p className="text-xs font-bold text-red-600 mt-1">{errors.idType}</p>}
                    </div>

                    <div>
                      <input
                        name="idNumber"
                        type="text"
                        value={formData.idNumber}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Enter your ID number"
                      />
                      {errors.idNumber && <p className="text-xs font-bold text-red-600 mt-1">{errors.idNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-white/80 text-xs font-medium mb-1">Upload ID Document</label>
                      <input
                        name="idDocument"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleChange}
                        className={fileInputClass}
                      />
                      {errors.idDocument && <p className="text-xs font-bold text-red-600 mt-1">{errors.idDocument}</p>}
                    </div>

                    <div>
                      <label className="block text-white/80 text-xs font-medium mb-1">Upload Profile Picture</label>
                      <input
                        name="profilePicture"
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleChange}
                        className={fileInputClass}
                      />
                      {errors.profilePicture && <p className="text-xs font-bold text-red-600 mt-1">{errors.profilePicture}</p>}
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
                        className="bg-bgColor text-limeTxt cursor-pointer font-medium py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
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