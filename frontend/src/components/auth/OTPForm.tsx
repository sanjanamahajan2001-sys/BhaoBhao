import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';

interface OTPFormProps {
  otp: string;
  setOtp: (otp: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onRetry: () => void;
  loading: boolean;
  cooldownTime: number;
  isSignUp: boolean;
  // otpReceived: string;
}

const OTPForm: React.FC<OTPFormProps> = ({
  otp,
  setOtp,
  onSubmit,
  onBack,
  onRetry,
  loading,
  cooldownTime,
  isSignUp,
  // otpReceived,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="otp"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Verification Code
        </label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,6}$/.test(value)) {
                setOtp(e.target.value);
              }
            }}
            required
            maxLength={6}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent tracking-wider text-center text-lg"
            placeholder="Enter OTP"
          />
        </div>
        {/* <span className="text-gray-500 text-sm my-6">{otpReceived}</span> */}
        <div className="mt-3 p-3 bg-teal-50 border border-teal-100 rounded-xl flex items-start space-x-2 text-left">
          <span className="text-xs text-teal-800 leading-relaxed">
            💡 <strong>Demo Mode Active:</strong> Enter the code <strong>123456</strong> to immediately verify and log in.
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="w-full bg-teal-500 text-white py-3 px-4 rounded-full font-semibold hover:bg-yellow-400 hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-teal-500 flex items-center justify-center space-x-2"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
        ) : (
          <>
            <CheckCircle className="h-5 w-5" />
            <span>Verify & Continue</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-between">
        {cooldownTime === 0 && (
          <button
            type="button"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 py-2 text-sm"
          >
            Go Back
          </button>
        )}

        <button
          type="button"
          onClick={onRetry}
          disabled={loading || cooldownTime > 0}
          className="text-teal-600 hover:text-teal-700 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cooldownTime > 0 ? `Retry in ${cooldownTime}s` : 'Resend Code'}
        </button>
      </div>
    </form>
  );
};

export default OTPForm;

