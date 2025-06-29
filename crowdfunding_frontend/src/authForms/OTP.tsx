import { useEffect, useRef, useState } from "react";
import image from '../assets/login_img.jpg';



interface OTPLoginProps {
  length?: number;
  onSubmit?: (otp: string) => void;
}

export default function OTPLogin({ length = 4, onSubmit }: OTPLoginProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  function handleChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    const combinedOtp = newOtp.join("");
    if (combinedOtp.length === length && onSubmit) {
      onSubmit(combinedOtp);
    }

    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  const handleClick = (index: number) => {
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
      inputRefs?.current[index - 1]?.focus();
    }
  }

  const handleDemoSubmit = (otpValue: string) => {
    alert(`OTP Submitted: ${otpValue}`);
  };

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
              Enter OTP
            </h2>
            <p className="text-bgColor text-center mb-8">
              Please enter the {length}-digit code sent to your email
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
                    className="h-12 w-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:limeTxt focus:outline-none transition-colors"
                  />
                );
              })}
            </div>
            <button
              onClick={() => {
                const currentOtp = otp.join("");
                if (currentOtp.length === length) {
                  handleDemoSubmit(currentOtp);
                } else {
                  alert("Please enter the complete OTP");
                }
              }}
              className="w-full bg-bgColor cursor-pointer disabled:cursor-not-allowed text-limeTxt py-2 px-4 rounded-lg transition-colors disabled:bg-teal-500 disabled:text-gray-500"
              disabled={otp.join("").length !== length}
            >
              Submit OTP
            </button>
          </div>
        </div>
    </div>
  );
}