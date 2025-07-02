/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import image from '../assets/login_img.jpg';
import logo from '../assets/green_logo.png';
import { Link } from 'react-router-dom';
import { API_URL } from '../Utils/constants';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required"); 
      return;
    }

    setError(null); 

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset link sent to your email.');
      } else {
        setError(data.errors?.email || 'Something went wrong.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen font-Outfit flex items-center justify-center relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${image})`,
          filter: 'blur(0.5px) brightness(0.9)',
          transform: 'scale(1)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 via-teal-500/20 to-blue-600/40" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="logo" className='h-10' />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Forgot Password</h2>
            <p className="text-white/70 text-sm">
              Enter your email to reset your password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null); 
                }}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
              />
              {error && (
                <p className="text-sm text-red-400 font-bold mt-1">{error}</p> 
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-bgColor text-limeTxt outline-0 backdrop-blur-sm cursor-pointer font-medium py-3 px-4 rounded-lg transition-all duration-200"
            >
              Send Reset Link
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Remember your password?{' '}
              <Link to="/login" className="text-limeTxt font-medium transition-colors duration-200">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <ToastContainer position='top-center' autoClose={3000} />
    </div>
  );
}
