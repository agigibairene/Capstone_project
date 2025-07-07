/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import InputField from "../Utils/InputField";
import Loader from "../Utils/Loader";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL } from "../Utils/constants";


export default function CreateProject() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingKyc, setIsCheckingKyc] = useState(true);
  const [projectSubmitted, setProjectSubmitted] = useState(false);
  const [kycNotVerified, setKycNotVerified] = useState(false);
  const [form, setForm] = useState({
    name: '',
    title: '',
    email: '',
    brief: '',
    description: '',
    benefits: '',
    target_amount: '',
    deadline: '',
    image: '',
    file: null as File | null,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    checkKycStatus();
  }, []);

  async function checkKycStatus() {
    const token = localStorage.getItem("ACCESS_TOKEN");
    
    if (!token) {
      toast.error("Authentication required. Please login again.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/kyc/status/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Authentication failed. Please login again.");
          localStorage.removeItem("ACCESS_TOKEN");
          localStorage.removeItem("REFRESH_TOKEN");
          localStorage.removeItem("role");
          navigate("/login");
          return;
        }
        throw new Error("Failed to check KYC status");
      }

      const data = await response.json();
      
  
      if (!data.kyc_verified) {
        setKycNotVerified(true);
      }
    } catch (error: any) {
      console.error("KYC status check error:", error);
      toast.error("Unable to verify KYC status. Please try again.");
    } finally {
      setIsCheckingKyc(false);
    }
  }

  function handleFormFieldChange(fieldName: keyof typeof form, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>){
    if (fieldName === "file" && e.target instanceof HTMLInputElement && e.target.files) {
      setForm({ ...form, file: e.target.files[0] });
    } else {
      setForm({ ...form, [fieldName]: e.target.value });
    }
    setFormErrors(prev => ({ ...prev, [fieldName]: '' }));
  };

  function validateForm (): boolean{
    const errors: Record<string, string> = {};

    // Required field validation
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.email.trim()) errors.email = "Valid email is required";
    if (!form.brief.trim()) errors.brief = "Brief description is required";
    if (!form.description.trim()) errors.description = "Detailed description is required";
    if (!form.target_amount.trim()) errors.target = "Funding target is required";
    if (!form.deadline.trim()) errors.deadline = "Deadline is required";
    if (!form.image.trim()) errors.image = "Image URL is required";
    
    // File validation
    if (!form.file) {
      errors.file = "Proposal PDF is required";
    } else if (form.file.type !== "application/pdf") {
      errors.file = "Only PDF files are accepted";
    } else if (form.file.size > 25 * 1024 * 1024) { 
      errors.file = "File size must be less than 5MB";
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email.trim() && !emailRegex.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function handleSubmit (e: React.FormEvent){
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    const token = localStorage.getItem("ACCESS_TOKEN");
    
    if (!token) {
      toast.error("Authentication required. Please login again.");
      setIsLoading(false);
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("title", form.title);
    formData.append("email", form.email);
    formData.append("brief", form.brief);
    formData.append("description", form.description);
    formData.append("benefits", form.benefits);
    formData.append("target_amount", form.target_amount);
    formData.append("deadline", form.deadline);
    formData.append("image", form.image);
    if (form.file) formData.append("file", form.file);

    try {
      console.log("Submitting with token:", token ? "Token present" : "No token");
      
      const response = await fetch(`${API_URL}/projects/create/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Authentication failed. Please login again.");
          localStorage.removeItem("ACCESS_TOKEN");
          localStorage.removeItem("REFRESH_TOKEN");
          localStorage.removeItem("role");
          navigate("/login");
          return;
        }

        if (response.status === 403) {
          setKycNotVerified(true);
          return;
        }

        if (data.errors) {
          const backendErrors: Record<string, string> = {};
          Object.keys(data.errors).forEach(key => {
            backendErrors[key] = Array.isArray(data.errors[key]) 
              ? data.errors[key].join(" ") 
              : data.errors[key];
          });
          setFormErrors(backendErrors);
        }
        
        throw new Error(data.message || `HTTP ${response.status}: Failed to create project`);
      }

      setProjectSubmitted(true);
      setTimeout(()=> toast.success("Project created successfully!"), 4000)
      
    } catch (error: any) {
      console.error("Submission error:", error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(error.message || "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  function resetForm(){
    setForm({
      name: '',
      title: '',
      email: '',
      brief: '',
      description: '',
      benefits: '',
      target_amount: '',
      deadline: '',
      image: '',
      file: null,
    });
    setFormErrors({});
    setProjectSubmitted(false);
    setKycNotVerified(false);
  };

  const SuccessCard = () => (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center max-w-md mx-auto">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-green-800 mb-2">Project Successfully Submitted!</h3>
      <p className="text-green-700 text-sm mb-4">
        Your project has been submitted for review. You will be notified once it's approved.
      </p>
      <button 
        onClick={resetForm}
        className="bg-bgColor hover:bg-teal-700 text-limeTxt cursor-pointer font-medium py-2 px-4 rounded-md transition duration-200"
      >
        Submit Another Project
      </button>
    </div>
  );

  // KYC Not Verified Card Component
  const KycNotVerifiedCard = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">Verification Required</h3>
      <p className="text-red-700 text-sm mb-4">
        You need to complete KYC verification before you can submit a project.
      </p>
      <div className="space-y-2">
        <button 
          onClick={() => navigate("/kyc-verification")}
          className="bg-red-600 hover:bg-red-700 cursor-pointer text-white font-medium py-2 px-4 rounded-md transition duration-200 w-full"
        >
          Complete KYC Verification
        </button>
        <button 
          onClick={() => navigate(-1)}
          className="bg-gray-300 hover:bg-gray-400 cursor-pointer text-gray-700 font-medium py-2 px-4 rounded-md transition duration-200 w-full"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  if (isCheckingKyc) {
    return (
      <div className="bg-white/20 backdrop-blur-sm mx-auto w-[85%] flex justify-center items-center flex-col rounded-lg sm:p-10 p-4">
        <Loader text="Checking verification status..." />
      </div>
    );
  }

  // Show KYC not verified card if KYC is not verified
  if (kycNotVerified) {
    return (
      <KycNotVerifiedCard />
    );
  }

  // Show success card if project is submitted
  if (projectSubmitted) {
    return (
      <SuccessCard />
    );
  }

  return (
    <div className="bg-white/20 backdrop-blur-sm mx-auto w-[85%] flex justify-center items-center flex-col rounded-lg sm:p-10 p-4">
      {isLoading && <Loader text="Creating project..." />}
      
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-bgColor rounded-[10px]">
        <h1 className="font-Outfit font-bold sm:text-[25px] text-[18px] leading-[38px] text-limeTxt">
          Start a Project
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full mt-[65px] flex flex-col gap-[30px]">
        <div className="flex flex-wrap gap-[40px]">
          <InputField 
            label="Your Name *" 
            placeholder="Enter your full name" 
            inputType="text" 
            value={form.name} 
            handleChange={(e) => handleFormFieldChange('name', e)} 
            isTextArea={false} 
            error={formErrors.name} 
          />
          <InputField 
            label="Project Title *" 
            placeholder="Write a title" 
            inputType="text" 
            value={form.title} 
            handleChange={(e) => handleFormFieldChange('title', e)} 
            isTextArea={false} 
            error={formErrors.title} 
          />
        </div>

        <div className="flex flex-wrap gap-[40px]">
          <InputField 
            label="Email address *" 
            placeholder="Enter your email address" 
            inputType="email" 
            value={form.email} 
            handleChange={(e) => handleFormFieldChange('email', e)} 
            isTextArea={false} 
            error={formErrors.email} 
          />
          <InputField 
            label="Brief description *" 
            placeholder="Write a brief description not more than one sentence" 
            inputType="text" 
            value={form.brief} 
            handleChange={(e) => handleFormFieldChange('brief', e)} 
            isTextArea={true} 
            rows={1} 
            error={formErrors.brief} 
          />
        </div>

        <div className="flex flex-wrap gap-[40px]">
          <InputField 
            label="Detailed Description *" 
            inputType="textarea" 
            placeholder="Write a description" 
            isTextArea={true} 
            value={form.description} 
            rows={8} 
            handleChange={(e) => handleFormFieldChange('description', e)} 
            error={formErrors.description} 
          />
          <InputField 
            label="Projected Investor Benefits" 
            inputType="textarea" 
            placeholder="List benefits for potential investors" 
            isTextArea={true} 
            value={form.benefits} 
            rows={8} 
            handleChange={(e) => handleFormFieldChange('benefits', e)} 
            error={formErrors.benefits} 
          />
        </div>

        <div className="flex flex-wrap gap-[40px]">
          <InputField 
            label="Target Amount *" 
            placeholder="USD/ETH 0.50" 
            inputType="number" 
            value={form.target_amount} 
            isTextArea={false} 
            handleChange={(e) => handleFormFieldChange('target_amount', e)} 
            error={formErrors.target} 
          />
          <InputField 
            label="End Date *" 
            placeholder="End Date" 
            inputType="date" 
            isTextArea={false} 
            value={form.deadline} 
            handleChange={(e) => handleFormFieldChange('deadline', e)} 
            error={formErrors.deadline} 
          />
        </div>

        <div className="flex flex-wrap gap-[40px]">
          <InputField 
            label="Image URL *" 
            placeholder="Place image URL of your project" 
            inputType="url" 
            isTextArea={false} 
            value={form.image} 
            handleChange={(e) => handleFormFieldChange('image', e)} 
            error={formErrors.image} 
          />
          <InputField 
            label="Proposal upload *"
            placeholder="Upload your proposal PDF"
            inputType="file"
            accept=".pdf"
            isTextArea={false}
            handleChange={(e) => handleFormFieldChange('file', e)}
            error={formErrors.file}
            fileName={form.file?.name} 
            value=""
          />
        </div>

        <div className="flex justify-center items-center mt-[40px]">
          <button
            type="submit"
            disabled={isLoading}
            className={`transition hover:-translate-y-1 hover:shadow-xl cursor-pointer bg-bgColor font-Outfit font-semibold text-[16px] leading-[26px] text-limeTxt min-h-[52px] px-4 rounded-[10px] ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? <Loader text="Submitting" /> : 'Submit your project'}
          </button>    
        </div>
      </form>
    </div>
  );
}