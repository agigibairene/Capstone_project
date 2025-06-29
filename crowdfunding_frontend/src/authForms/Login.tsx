/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import logo from '../assets/green_logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/login_auth';
import type { AppDispatch, RootState } from '../redux/store';
import Loader from '../Utils/Loader';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import image from '../assets/login_img.jpg';

export default function Login() {
  const [UserInput, setUserInput] = useState({
    email: '',
    password: '',
  });

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, user } = useSelector((state: RootState) => state.loginReducer)

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);

    if (validate()) {
      try {
        const response: any = await dispatch(loginUser(UserInput));
        if (response.payload && response.payload.user) {
          const role = response.payload.user.profile.role;
          console.log(role)
          
          if (role.toLowerCase() === 'farmer') {
            navigate('/farmer');
          }
          else if (role.toLowerCase() === 'investor') {
            navigate('/investor')
          }
          else {
            navigate('/')
          }
        }
      }
      catch (e) {
        console.error('Login failed:', e)
      }
    }
  };

  return (
    <>
      {loading && <Loader text='Logging in'/>}
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-Outfit">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${image})`,
          filter: 'blur(0.6px) brightness(0.9)',
          transform: 'scale(1)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 via-teal-500/20 to-blue-600/40" />

      <Link 
        to="/" 
        className="absolute top-4 left-4 sm:top-8 sm:left-6 z-20 flex items-center text-limeTxt hover:text-white transition-colors duration-200 backdrop-blur-sm bg-white/10 px-3 py-2 rounded-lg border border-white/20"
      >
        <ArrowLeft className="h-5 w-5 mr-1" />
        <span className="text-sm font-medium">Back Home</span>
      </Link>

      <div className="relative z-10 w-full max-w-md mx-4 mt-16 sm:mt-0">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-2 mb-4">
              <img src={logo} alt="logo" className="h-8" />
              <span className="text-2xl font-bold text-bgColor">Agriconnect</span>
            </div>
            <h2 className="text-2xl font-semibold text-bgColor mb-2">Welcome back!</h2>
            <p className="text-white/80 text-sm">Sign in to your account</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={UserInput.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 ${
                  submitted && errors.email ? 'border-red-400 focus:ring-red-300/30' : ''
                }`}
              />
              {submitted && errors.email && (
                <p className="text-sm text-red-400 font-bold mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="********"
                  value={UserInput.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 pr-12 ${
                    submitted && errors.password ? 'border-red-400 focus:ring-red-300/30' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-white/70 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {submitted && errors.password && (
                <p className="text-sm text-red-400 font-bold mt-1">{errors.password}</p>
              )}
              <div className="text-right mt-2">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-limeTxt hover:underline transition-colors duration-200 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          
              <button
                type="submit"
                className="w-full bg-bgColor text-limeTxt outline-0 backdrop-blur-sm cursor-pointer font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-bgColor/90"
              >
                Login
              </button>
            {error && (
              <p className="text-center text-red-400 text-sm font-bold bg-red-500/10 backdrop-blur-sm border border-red-400/20 rounded-lg py-2 px-4">
                {error}
              </p>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-limeTxt font-medium hover:underline transition-colors duration-200"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}