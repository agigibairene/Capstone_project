import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

type FormData = {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: 'investor' | 'farmer';
  investor_id: string;
  farmer_id: string;
};

type ApiError = {
  error?: string;
  detail?: string;
  errors?: {
    user?: Record<string, string[]>;
    investor_id?: string[];
    farmer_id?: string[];
  };
  [key: string]: any;
};

const Signup = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    user_type: 'investor',
    investor_id: '',
    farmer_id: '',
  });
  
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = formData.user_type === 'investor' 
        ? 'http://localhost:8000/api/auth/signup/investor/' 
        : 'http://localhost:8000/api/auth/signup/farmer/';

      const payload = {
        user: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
        },
        [formData.user_type === 'investor' ? 'investor_id' : 'farmer_id']: 
          formData.user_type === 'investor' ? formData.investor_id : formData.farmer_id,
      };

      console.log('Submitting payload:', payload);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: ApiError = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        if (data.errors) {
          let errorMessage = '';
          
          if (data.errors.user) {
            Object.entries(data.errors.user).forEach(([field, messages]) => {
              errorMessage += `${field}: ${messages.join(', ')}\n`;
            });
          }
          
          if (data.errors.investor_id) {
            errorMessage += `Investor ID: ${data.errors.investor_id.join(', ')}\n`;
          }
          
          if (data.errors.farmer_id) {
            errorMessage += `Farmer ID: ${data.errors.farmer_id.join(', ')}\n`;
          }
          
          throw new Error(errorMessage.trim());
        }
        
        throw new Error(data.error || data.detail || 'Signup failed');
      }

      navigate('/login', { 
        state: { 
          successMessage: 'Registration successful! Please login.' 
        } 
      });
    } catch (error) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {formData.user_type === 'investor' ? 'Investor' : 'Farmer'} Sign Up
      </h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded whitespace-pre-line">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <label htmlFor="user_type" className="block mb-2 font-medium text-gray-700">
            User Type
          </label>
          <select
            id="user_type"
            name="user_type"
            value={formData.user_type}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="investor">Investor</option>
            <option value="farmer">Farmer</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block mb-2 font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block mb-2 font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="username" className="block mb-2 font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-2 font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Password must be at least 8 characters long
          </p>
        </div>

        {formData.user_type === 'investor' ? (
          <div>
            <label htmlFor="investor_id" className="block mb-2 font-medium text-gray-700">
              Investor ID
            </label>
            <input
              type="text"
              id="investor_id"
              name="investor_id"
              value={formData.investor_id}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="farmer_id" className="block mb-2 font-medium text-gray-700">
              Farmer ID
            </label>
            <input
              type="text"
              id="farmer_id"
              name="farmer_id"
              value={formData.farmer_id}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : 'Sign Up'}
        </button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Login here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;