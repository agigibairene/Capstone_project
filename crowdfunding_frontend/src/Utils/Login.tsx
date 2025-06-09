import { useState } from 'react';
import logo from '../assets/logo.png';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (validate()) {
      console.log('Form submitted:', formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-Outfit">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md text-center">
        <div className="mb-6">
          <div className="flex items-center justify-center text-2xl font-bold text-teal-800">
            <img src={logo} alt="" />
            Agriconnect
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-6">Welcome back!!</h2>

        {/* Form */}
        <form className="space-y-4 text-left" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 outline-none ${
                submitted && errors.email ? 'border-red-500 focus:ring-red-300' : 'focus:ring-limeTxt'
              }`}
            />
            {submitted && errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 outline-none ${
                submitted && errors.password ? 'border-red-500 focus:ring-red-300' : 'focus:ring-limeTxt'
              }`}
            />
            {submitted && errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
            <div className="text-right mt-1">
              <a href="#" className="text-sm text-lime-600 hover:underline">Forgot password?</a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-900 text-white font-semibold py-2 rounded-md hover:bg-bgColor transition cursor-pointer"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-600">
          Do not have an account? <a href="#" className="text-teal-700 hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}
