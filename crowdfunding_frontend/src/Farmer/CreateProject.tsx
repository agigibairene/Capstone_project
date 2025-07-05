/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import InputField from "../Utils/InputField";
import Loader from "../Utils/Loader";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL } from "../Utils/constants";

export default function CreateProject() {
  const [isLoading, setIsLoading] = useState(false);
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

  const handleFormFieldChange = (
    fieldName: keyof typeof form,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (fieldName === "file" && e.target instanceof HTMLInputElement && e.target.files) {
      setForm({ ...form, file: e.target.files[0] });
    } else {
      setForm({ ...form, [fieldName]: e.target.value });
    }
    // Clear error when field changes
    setFormErrors(prev => ({ ...prev, [fieldName]: '' }));
  };

  const validateForm = (): boolean => {
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
    } else if (form.file.size > 5 * 1024 * 1024) { // 5MB limit
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // Get token with consistent key - use the same key as your Redux store
    const token = localStorage.getItem("ACCESS_TOKEN") || localStorage.getItem("access_token");
    
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
          // Don't set Content-Type for FormData - let the browser set it
        },
        body: formData,
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          toast.error("Authentication failed. Please login again.");
          localStorage.removeItem("ACCESS_TOKEN");
          localStorage.removeItem("access_token");
          localStorage.removeItem("REFRESH_TOKEN");
          localStorage.removeItem("role");
          navigate("/login");
          return;
        }

        if (response.status === 403) {
          toast.error("Permission denied. Please ensure your KYC is verified.");
          return;
        }

        // Handle backend validation errors
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

      // Success handling
      toast.success("Project created successfully!");
      navigate("/projects"); // Redirect to projects list
      
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
            {isLoading ? 'Processing...' : 'Submit your project'}
          </button>
        </div>
      </form>
    </div>
  );
}