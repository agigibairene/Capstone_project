import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/green_logo.png";

interface Details{
  title: string,
  description: string
}

const miniDetails: Details[] = [
  {
    title: "Upload Proposal and Documentation", 
    description: `Each project listing provides detailed information about the project, 
    including its goals, budget, expected returns and risks`
  },
  {
    title: "Protects intellectual property",
    description: `Investors must sign a Non-Disclosure Agreement (NDA) and also farmers view other farmers ideas to reduce theft`
  },
  {
    title: "Project Screening",
    description: `Before projects are listed on the platform, they undergo a 
    screening process to assess their feasibility and impact. `
  }
]


export default function Signup() {
  const [userInput, setUserInput] = useState<{[key: string] : string}>({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    phoneNumber: "",
    organization: "",
    investorType: "",
    password: ""
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  function handleUserInput(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setUserInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateInput() {
    const newErrors: { [key: string]: string } = {};

    if (!userInput.firstName) newErrors.firstName = "First name is required";
    if (!userInput.lastName) newErrors.lastName = "Last name is required";
    
    // Email validation with regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userInput.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(userInput.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!userInput.role) newErrors.role = "Role is required";
    
    // Phone number validation
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!userInput.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!phoneRegex.test(userInput.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    // Investor-specific validations
    if (userInput.role === "Investor") {
      if (!userInput.investorType) {
        newErrors.investorType = "Please select investor type";
      }
      if (!userInput.organization) {
        newErrors.organization = "Organization is required for investors";
      }
    }

    // Password validation
    if (!userInput.password) {
      newErrors.password = "Password is required";
    }else if (userInput.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const foundErrors = validateInput();
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length === 0) {
      console.log("Form submitted:", userInput);
      alert("Account created successfully!");
    }
  }

  return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8 font-Outfit">
    <div className="w-full max-w-6xl bg-gray-200 p-4 sm:p-6 md:p-8 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-[40%_60%] gap-4">

      {/* LEFT SIDE */}
      <div className="bg-gray-200 p-4 sm:p-6 md:p-8 space-y-6">
        <div className="flex gap-2 items-center text-xl font-semibold text-teal-700">
          <img src={logo} className="w-[26px]" alt="" />
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
          © {new Date().getFullYear()} Agriconnect – <a href="#" className="underline">Privacy & Terms</a>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="p-4 sm:p-6 md:p-12 rounded-lg bg-white">
        <h2 className="text-xl font-semibold text-teal-700">Sign Up for Agriconnect</h2>
        <p className="text-sm text-gray-500 mb-6">Sign up to see more amazing features</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
            <div className="w-full sm:w-1/2">
              <input
                name="firstName"
                type="text"
                placeholder="First Name"
                value={userInput.firstName}
                onChange={handleUserInput}
                className="input w-full"
              />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
            </div>

            <div className="w-full sm:w-1/2">
              <input
                name="lastName"
                type="text"
                placeholder="Last Name"
                value={userInput.lastName}
                onChange={handleUserInput}
                className="input w-full"
              />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
            <div className="w-full sm:w-1/2">
              <input
                name="email"
                type="email"
                placeholder="Enter your Email"
                value={userInput.email}
                onChange={handleUserInput}
                className="input w-full"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="w-full sm:w-1/2">
              <select
                name="role"
                value={userInput.role}
                onChange={handleUserInput}
                className="input px-4 py-2 bg-white w-full focus:ring-2 focus:ring-teal-700"
              >
                <option value="" disabled>Select role</option>
                <option value="Farmer">Farmer</option>
                <option value="Investor">Investor</option>
              </select>
              {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
            </div>
          </div>

          <div>
            <input
              name="phoneNumber"
              type="tel"
              placeholder="Phone Number"
              value={userInput.phoneNumber}
              onChange={handleUserInput}
              className="input w-full"
            />
            {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
          </div>

          {userInput.role === "Investor" && (
            <div>
              <select
                name="investorType"
                value={userInput.investorType}
                onChange={handleUserInput}
                className="input px-4 py-2 bg-white w-full focus:ring-2 focus:ring-teal-700"
              >
                <option value="" disabled>Select investor type</option>
                <option value="Organization">Organization</option>
                <option value="Individual">Individual</option>
              </select>
              {errors.investorType && <p className="text-sm text-red-500">{errors.investorType}</p>}
            </div>
          )}

          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={userInput.password}
              onChange={handleUserInput}
              className="input w-full"
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-teal-700 hover:bg-teal-900 cursor-pointer text-white font-semibold py-2 rounded-md transition"
          >
            Create My Account
          </button>

          <p className="text-sm text-gray-600 text-center">
            Already have an account? <Link to='/login' className="text-teal-500">Login</Link>
          </p>
        </form>
      </div>
    </div>
  </div>
);

}
