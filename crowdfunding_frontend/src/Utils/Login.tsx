/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import logo from '../assets/green_logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/login_auth';
import type { AppDispatch, RootState } from '../redux/store';
import Loader from './Loader';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import image from '../assets/loginImage.jpg';



export default function Login() {
  const [UserInput, setUserInput] = useState({
    email: '',
    password: '',
  });

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, user } = useSelector((state :RootState)=>state.loginReducer)

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false)


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInput(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  console.log(user)

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!UserInput.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!UserInput.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault();
    setSubmitted(true);

    if (validate()) {
      try{
        const response: any = await dispatch(loginUser(UserInput));
        if (response.payload && response.payload.user){
        const role = response.payload.user.profile.role;
        console.log(role)
          if (role === 'farmer'){
            navigate('/farmer');
          }
          else if (role === 'investor'){
            navigate('/investor')
          }
          else{
            navigate('/')
          }
        }
      }
      catch(e){
        console.error('Login failed:', e)
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-Outfit px-4">
      <div className="w-full max-w-6xl h-[600px] bg-white rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className="hidden md:block">
          <img
            src={image}
            alt="Login visual"
            className="h-full w-full rounded-r-2xl object-cover"
          />
        </div>

        <div className="flex flex-col  items-center p-8 md:p-12 w-full relative">
          <Link to="/" className="absolute top-4 left-4 flex items-center text-gray-500 hover:text-teal-700 transition">
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">Back Home</span>
          </Link>
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <div className="flex justify-center items-center gap-2 text-2xl font-bold text-teal-800">
                <img src={logo} alt="logo" className="h-8" />
                Agriconnect
              </div>
              <h2 className="text-xl font-semibold mt-4">Welcome back!</h2>
            </div>

            <form className="space-y-5 w-full" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={UserInput.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md outline-none focus:ring-2 ${
                    submitted && errors.email ? 'border-red-500 focus:ring-red-300' : 'focus:ring-limeTxt'
                  }`}
                />
                {submitted && errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="********"
                    value={UserInput.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md outline-none focus:ring-2 ${
                      submitted && errors.password ? 'border-red-500 focus:ring-red-300' : 'focus:ring-limeTxt'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {submitted && errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                )}
                <div className="text-right mt-2">
                  <Link to="/forgot-password" className="text-sm text-lime-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {loading ? (
                <Loader />
              ) : (
                <button
                  type="submit"
                  className="w-full bg-teal-700 text-white py-2 cursor-pointer rounded-md hover:bg-teal-800 transition duration-200"
                >
                  Login
                </button>
              )}

              {error && <p className="text-center text-red-500 text-sm">{error}</p>}
            </form>

            <p className="mt-6 text-sm text-center text-gray-600">
              Don’t have an account?{' '}
              <Link to="/signup" className="text-teal-700 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
