import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/ReactToastify.css';
import image from '../assets/login_img.jpg';
import logo from '../assets/green_logo.png';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const { reset_id } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm_password, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm_password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const newErrors: { password?: string; confirm_password?: string } = {};
    if (!password.trim()) newErrors.password = 'Password is required';
    if (!confirm_password.trim()) {
      newErrors.confirm_password = 'Confirm password is required';
    } else if (password !== confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/auth/reset-password/${reset_id}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirm_password }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Password reset successful! You can now log in.');
        setTimeout(() => navigate('/login'), 1000);
      } else {
        setErrors(data.errors || {});
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${image})`,
          filter: 'blur(0.6px) brightness(1)',
          transform: 'scale(1)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 via-teal-500/20 to-blue-600/40" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="" className="h-10" />
            </div>
            <h2 className="text-2xl font-semibold text-bgColor mb-2">Reset Password</h2>
            <p className="text-white/70 text-sm">Enter your new password below</p>
          </div>

          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-white/80 text-sm font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-white/70 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-sm font-bold text-red-400 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-white/80 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm_password"
                  value={confirm_password}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirm_password) setErrors((prev) => ({ ...prev, confirm_password: '' }));
                  }}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 pr-10"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-white/70 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-red-400 font-bold mt-1">{errors.confirm_password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-bgColor text-limeTxt outline-0 backdrop-blur-sm cursor-pointer font-medium py-3 px-4 rounded-lg transition-all duration-200"
            >
              Reset Password
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

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
