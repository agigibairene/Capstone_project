/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/green_logo.png";
import { useDispatch, useSelector } from "react-redux";
import { signupUser, resetSignupState } from '../redux/signup_auth';
import type { AppDispatch, RootState } from "../redux/store";
import { Eye, EyeOff } from "lucide-react";
import Loader from "../Utils/Loader";

interface Details {
  title: string;
  description: string;
}

const miniDetails: Details[] = [
  {
    title: "Upload Proposal and Documentation",
    description: `Each project listing provides detailed information about the project, 
    including its goals, budget, expected returns and risks`,
  },
  {
    title: "Protects intellectual property",
    description: `Investors must sign a Non-Disclosure Agreement (NDA) and also farmers view other farmers ideas to reduce theft`,
  },
  {
    title: "Project Screening",
    description: `Before projects are listed on the platform, they undergo a 
    screening process to assess their feasibility and impact.`,
  },
];

export default function Signup() {
  const [userInput, setUserInput] = useState<{ [key: string]: string }>({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    phone_number: "",
    organization: "",
    investorType: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, success } = useSelector((state: RootState) => state.signupReducer);

  function handleUserInput(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setUserInput((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  }

  function validateInput() {
    const newErrors: { [key: string]: string } = {};
    
    if (!userInput.first_name.trim()) newErrors.first_name = "First name is required";
    if (!userInput.last_name.trim()) newErrors.last_name = "Last name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userInput.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(userInput.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!userInput.role) newErrors.role = "Role is required";

    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!userInput.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!phoneRegex.test(userInput.phone_number)) {
      newErrors.phone_number = "Enter a valid phone number";
    }

    if (userInput.role === "Investor") {
      if (!userInput.investorType) newErrors.investorType = "Select investor type";
      if (!userInput.organization.trim()) newErrors.organization = "Organization is required";
    }

    if (!userInput.password) {
      newErrors.password = "Password is required";
    } else if (userInput.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!userInput.confirm_password) {
      newErrors.confirm_password = "Confirm password is required";
    } else if (userInput.password !== userInput.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const foundErrors = validateInput();
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length === 0) {
      try {
        const signupData = {
          first_name: userInput.first_name.trim(),
          last_name: userInput.last_name.trim(),
          email: userInput.email.trim(),
          password: userInput.password,
          confirm_password: userInput.confirm_password,
          role: userInput.role as "Farmer" | "Investor",
          phone_number: userInput.phone_number.trim(),
          ...(userInput.role === "Investor" && {
            organization: userInput.organization.trim(),
            investorType: userInput.investorType as "Individual" | "Organization",
          }),
        };

        await dispatch(signupUser(signupData)).unwrap();
        
      } catch (err: any) {
        console.error("Signup failed:", err);
        setErrors({ general: err || "Signup failed. Please try again." });
      }

      
    }
  }

 useEffect(() => {
  console.log('Signup status:', { success, role: userInput.role });
  if (success) {
    console.log('Navigating to KYC...');
    if (userInput.role === "Farmer") {
      navigate("/kyc_farmer");
    } else if (userInput.role === "Investor") {
      navigate("/kyc_investor");
    }
    dispatch(resetSignupState());
  }
}, [success, userInput.role, navigate, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetSignupState());
    };
  }, [dispatch]);

  return (
    <>
      {loading && <Loader text="Creating account..." />}

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8 font-Outfit">
      <div className="w-full max-w-6xl bg-gray-200 p-4 sm:p-6 md:p-8 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-[40%_60%] gap-4">
        {/* LEFT SIDE */}
        <div className="bg-gray-200 p-4 sm:p-6 md:p-8 space-y-6">
          <div className="flex gap-2 items-center text-xl font-semibold text-teal-700">
            <img src={logo} className="w-[26px]" alt="Agriconnect Logo" />
            Agriconnect
          </div>
          <h2 className="text-2xl font-bold text-bgColor">
            We create a platform for farmers & investors to connect
          </h2>
          <ul className="space-y-4 text-gray-700 text-sm">
            {miniDetails.map(({ title, description }) => (
              <li key={title}>
                <span className="font-semibold text-teal-700">• {title}</span> <br />
                {description}
              </li>
            ))}
          </ul>
          <div className="text-xs text-gray-500 pt-10">
            © {new Date().getFullYear()} Agriconnect –{" "}
            <a href="#" className="underline">
              Privacy & Terms
            </a>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-4 sm:p-6 md:p-12 rounded-lg bg-white">
          <h2 className="text-xl font-semibold text-teal-700">Create an Account on Agriconnect</h2>
          <p className="text-sm text-gray-500 mb-6">Sign up to see more amazing features</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              <div className="w-full">
                <input
                  name="first_name"
                  type="text"
                  placeholder="First Name"
                  value={userInput.first_name}
                  onChange={handleUserInput}
                  className={`input w-full ${errors.first_name ? 'border-red-500' : ''}`}
                />
                {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
              </div>
              <div className="w-full">
                <input
                  name="last_name"
                  type="text"
                  placeholder="Last Name"
                  value={userInput.last_name}
                  onChange={handleUserInput}
                  className={`input w-full ${errors.last_name ? 'border-red-500' : ''}`}
                />
                {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
              </div>
            </div>

            <div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={userInput.email}
                onChange={handleUserInput}
                className={`input w-full ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <select
                name="role"
                value={userInput.role}
                onChange={handleUserInput}
                className={` w-full ${errors.role ? 'border-red-500' : ''}`}
              >
                <option value="">Select Role</option>
                <option value="Farmer">Farmer</option>
                <option value="Investor">Investor</option>
              </select>
              {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
            </div>

            <div>
              <input
                name="phone_number"
                type="tel"
                placeholder="Phone Number"
                value={userInput.phone_number}
                onChange={handleUserInput}
                className={`input w-full ${errors.phone_number ? 'border-red-500' : ''}`}
              />
              {errors.phone_number && <p className="text-xs text-red-500 mt-1">{errors.phone_number}</p>}
            </div>

            {userInput.role === "Investor" && (
              <>
                <div>
                  <select
                    name="investorType"
                    value={userInput.investorType}
                    onChange={handleUserInput}
                    className={`input w-full ${errors.investorType ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select investor type</option>
                    <option value="Organization">Organization</option>
                    <option value="Individual">Individual</option>
                  </select>
                  {errors.investorType && <p className="text-xs text-red-500 mt-1">{errors.investorType}</p>}
                </div>
                <div>
                  <input
                    name="organization"
                    type="text"
                    placeholder="Organization"
                    value={userInput.organization}
                    onChange={handleUserInput}
                    className={`input w-full ${errors.organization ? 'border-red-500' : ''}`}
                  />
                  {errors.organization && <p className="text-xs text-red-500 mt-1">{errors.organization}</p>}
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              <div className="w-full">
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={userInput.password}
                    onChange={handleUserInput}
                    className={`input w-full pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>
              <div className="w-full">
                <div className="relative">
                  <input
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={userInput.confirm_password}
                    onChange={handleUserInput}
                    className={`input w-full pr-10 ${errors.confirm_password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password}</p>}
              </div>
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 text-sm p-2 rounded">{error}</div>
            )}

            <button
              type="submit"
              className="w-full cursor-pointer bg-teal-700 hover:bg-teal-900 text-white font-semibold py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create My Account
            </button>

            <p className="text-sm text-gray-600 text-center">
              Already have an account? <Link to="/login" className="text-teal-500 hover:underline">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
    
    </>
  );
}