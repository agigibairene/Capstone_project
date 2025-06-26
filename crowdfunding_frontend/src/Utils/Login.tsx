import { useState } from 'react';
import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/login_auth';
import type { AppDispatch, RootState } from '../redux/store';
import Loader from './Loader';


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

  console.log(user)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInput(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

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
          if (role === 'Farmer'){
            navigate('/farmer');
          }
          else if (role === 'Investor'){
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-Outfit">
      <div className="w-[90%] max-w-md p-8 bg-white rounded-xl shadow-md text-center">
        <div className="mb-6">
          <div className="flex items-center justify-center text-2xl font-bold text-teal-800">
            <img src={logo} alt="" />
            Agriconnect
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Welcome back!!</h2>

        <form className="space-y-4 text-left" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={UserInput.email}
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
              value={UserInput.password}
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

          { loading ? <Loader/> : <button
            type="submit"
            className="w-full bg-teal-700 text-white font-semibold py-2 rounded-md hover:bg-teal-900 transition cursor-pointer"
          >
            Login
          </button>}
          {error && <p className='text-center text-red-500'>{error}</p>}
        </form>
        <p className="mt-6 text-sm text-gray-600">
          Do not have an account? <Link to='/signup' className="text-teal-700 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
