import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setAuthTokens } from '../redux/login_auth'; 
import type { AppDispatch } from '../redux/store';
import image from '../assets/login_img.jpg';
import { API_URL } from "../Utils/constants";
import { toast, ToastContainer } from 'react-toastify';

interface OTPLoginProps {
  length?: number;
}

export default function OTPLogin({ length = 5}: OTPLoginProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string>("");
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();


  useEffect(() => {
    if (!username) {
      navigate('/login', { 
        state: { error: 'Session expired. Please login again.' }
      });
    }
  }, [username, navigate]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (resendMessage) {
      toast.success(resendMessage);
    }
  }, [resendMessage]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);


  function resetOTPInputs(){
    setOtp(new Array(length).fill(""));
    setError("");
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  function handleChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(""); 

    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleClick(index: number){
    const currentInput = inputRefs.current[index];
    if (currentInput) {
      currentInput.setSelectionRange(1, 1);
    }

    if (index > 0 && !otp[index - 1]) {
      const firstEmptyIndex = otp.indexOf("");
      if (firstEmptyIndex !== -1 && inputRefs.current[firstEmptyIndex]) {
        inputRefs.current[firstEmptyIndex]?.focus();
      }
    }
  };

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste (e: React.ClipboardEvent<HTMLInputElement>){
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    
    if (/^\d+$/.test(pasteData) && pasteData.length === length) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      setError("");
      
      if (inputRefs.current[length - 1]) {
        inputRefs.current[length - 1]?.focus();
      }
      
    }
  };

  async function handleOTPSubmit(otpValue: string){
    if (!username) {
      setError("Username not found. Please try logging in again.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/verify-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          otp_code: otpValue
        }),
      });

      if (response.status === 404) {
        setError("Verification endpoint not found. Please try again later.");
        return;
      }

      if (response.status === 500) {
        setError("Server error occurred. Please check the server logs and try again.");
        return;
      }

      // Check for JSON response
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', response.status, response.statusText);
        setError('Server returned invalid response. Please check server logs.');
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.access && data.refresh && data.user) {
          dispatch(setAuthTokens({
            user: data.user,
            access: data.access,
            refresh: data.refresh
          }));
          
          const role = data.user.profile.role.toLowerCase();
          if (role === 'farmer') {
            navigate('/farmer');
          } else if (role === 'investor') {
            navigate('/investor');
          } else {
            navigate('/');
          }
        } else {
          setError("Login successful but missing user data.");
        }
      } else {
        if (response.status === 400) {
          setError(data.errors?.general || data.message || "Invalid or expired OTP.");
        } else if (response.status === 429) {
          setError("Too many attempts. Please try later.");
        } else {
          setError(data.message || "Verification failed. Please try again.");
        }
        resetOTPInputs();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError("Cannot connect to server. Please check if the server is running.");
      } else if (error instanceof SyntaxError) {
        setError("Server returned invalid data. Please check server logs.");
      } else {
        setError("Network error. Please check your connection and try again.");
      }
      resetOTPInputs();
    } finally {
      setIsLoading(false);
    }
  };

  async function handleResendOTP(){
    if (!username) {
      setError("Username not found. Please try logging in again.");
      return;
    }

    setResendLoading(true);
    setResendMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/resend-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username 
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setResendMessage("A new OTP has been sent to your email!");
        setCountdown(60);
        resetOTPInputs();
      } else {
        setError(data.errors?.general || "Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      if (error instanceof Error && error.message.includes('non-JSON')) {
        setError("Server error. Please try again later.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  if (!username) {
    return null;
  }

  return (
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

      <div className="relative z-10 w-full max-w-md px-4 mx-4">
        <div className="bg-white/30 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
          <h2 className="text-2xl font-bold text-center mb-6 text-bgColor">
            Verify Login
          </h2>
          <p className="text-bgColor text-center mb-8">
            Please enter the {length}-digit OTP sent to your email and click verify to complete your login
          </p>

          <div className="flex justify-center space-x-2 mb-6">
            {otp.map((value, index) => {
              return (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  ref={(input) => {inputRefs.current[index] = input}}
                  value={value}
                  onChange={(e) => handleChange(index, e)}
                  onClick={() => handleClick(index)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isLoading}
                  aria-label={`OTP digit ${index + 1} of ${length}`}
                  aria-describedby={error ? "otp-error" : undefined}
                  className="h-12 w-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-limeTxt focus:outline-none focus:ring-2 focus:ring-limeTxt/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              );
            })}
          </div>

          <button
            onClick={() => {
              const currentOtp = otp.join("");
              if (currentOtp.length === length) {
                handleOTPSubmit(currentOtp);
              } else {
                setError("Please enter the complete OTP");
              }
            }}
            disabled={otp.join("").length !== length || isLoading}
            className="w-full bg-bgColor cursor-pointer disabled:cursor-not-allowed text-limeTxt py-3 px-4 rounded-lg font-semibold transition-all hover:bg-bgColor/90 disabled:bg-teal-500 disabled:text-gray-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-limeTxt/20"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-limeTxt" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify"
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="text-bgColor text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={resendLoading || countdown > 0}
              className="text-limeTxt font-semibold cursor-pointer hover:underline disabled:text-gray-400 disabled:no-underline focus:outline-none focus:underline"
            >
              {resendLoading ? (
                "Sending..."
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                "Resend OTP"
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-bgColor text-sm hover:underline focus:outline-none focus:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
      
      <ToastContainer position="top-center" autoClose={5000} />

    </div>
  );
}