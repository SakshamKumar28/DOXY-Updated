import React, { useState } from 'react';
import { User, Phone, Calendar, MapPin, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For programmatic navigation


// It's best practice to configure a base instance for axios
const api = axios.create({
  baseURL: import.meta.env.SERVER_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

const SignupPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(''); // For displaying backend errors

  // Add state to hold the userId returned from the registration step
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate(); // Hook for navigation

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    age: '',
    address: ''
  });

  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '']);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear API error as well
    setApiError('');
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
        // Simple 10-digit validation for client-side
        newErrors.phoneNumber = 'Please enter a valid 10-digit number';
      }
    }
    if (step === 2) {
      if (!formData.age) newErrors.age = 'Age is required';
      else if (formData.age < 1 || formData.age > 120) newErrors.age = 'Please enter a valid age';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return; // Final check before submission

    setIsLoading(true);
    setApiError('');

    try {
      // Use the actual backend endpoint
      console.log(formData);
      const response = await api.post('/auth/user/register', formData);
      setUserId(response.data.data.userId); // Save the userId for the verification step
      setShowVerification(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
      setApiError(errorMessage);
      // If the error is for a specific field, go back to that step
      if (errorMessage.toLowerCase().includes('phone number')) {
        setCurrentStep(1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationChange = (index, value) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    if (value && index < 4) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleVerificationKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join('');
    if (code.length !== 5) return;

    setIsLoading(true);
    setApiError('');

    try {
      // Use the actual verification endpoint
      await api.post('/auth/user/verify', {
        userId: userId,
        verificationCode: code
      });
      alert('Account created successfully! You will be redirected.');
      navigate('/dashboard'); // Navigate to a protected route on success
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Verification failed.";
      setApiError(errorMessage);
      setVerificationCode(['', '', '', '', '']); // Clear input on error
    } finally {
      setIsLoading(false);
    }
  };

  // Note: You would need to create a `resend-code` endpoint in your backend for this to work
  const handleResendCode = async () => {
    if (!userId) {
      setApiError("Cannot resend code. User session not found.");
      return;
    }
    setIsLoading(true);
    setApiError('');
    try {
      // Assuming you have an endpoint like this
      await api.post('/auth/user/resend-code', { userId });
      // You can add a success message here, e.g., using a toast notification
      alert("A new code has been sent.");
    } catch (error) {
       const errorMessage = error.response?.data?.message || "Failed to resend code.";
       setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  if (showVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">D</span>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">DOXY</span>
            </div>
          </div>
          {/* Verification Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Phone</h2>
              <p className="text-gray-600">
                We've sent a 5-digit code to<br />
                <span className="font-semibold text-green-600">{formData.phoneNumber}</span>
              </p>
            </div>

            {/* API Error Display */}
            {apiError && (
              <div className="my-4 p-3 bg-red-100 text-red-700 rounded-lg text-center text-sm">
                {apiError}
              </div>
            )}

            <div className="space-y-6">
              {/* Verification Code Input */}
              <div className="flex justify-center space-x-3">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleVerificationChange(index, e.target.value)}
                    onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                ))}
              </div>
              {/* Verify Button */}
              <button
                onClick={handleVerifyCode}
                disabled={verificationCode.join('').length !== 5 || isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="ml-2" size={20} />
                  </>
                )}
              </button>
              {/* Resend Code */}
              <div className="text-center">
                <p className="text-gray-600">Didn't receive the code?</p>
                <button
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-green-600 font-semibold hover:text-green-700 transition-colors disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">D</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">DOXY</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600">Join thousands who trust DOXY for healthcare</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  currentStep >= step
                     ? 'bg-green-500 text-white shadow-lg'
                     : 'bg-gray-200 text-gray-400'
                }`}>
                  {currentStep > step ? <CheckCircle size={20} /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-8 h-1 rounded-full transition-all duration-300 ${
                    currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-500">Step {currentStep} of 3</span>
          </div>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit}>

            {/* API Error Display */}
            {apiError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center text-sm">
                  {apiError}
              </div>
            )}
            
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                  <p className="text-gray-600">Let's start with your basic details</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-green-200 transition-all text-gray-900 ${
                        errors.fullName
                           ? 'border-red-300 focus:border-red-500'
                           : 'border-gray-200 focus:border-green-500'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.fullName && (
                    <div className="flex items-center mt-2 text-red-600">
                      <AlertCircle size={16} className="mr-1" />
                      <span className="text-sm">{errors.fullName}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-green-200 transition-all text-gray-900 ${
                        errors.phoneNumber
                           ? 'border-red-300 focus:border-red-500'
                           : 'border-gray-200 focus:border-green-500'
                      }`}
                      placeholder="Enter a 10-digit number"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <div className="flex items-center mt-2 text-red-600">
                      <AlertCircle size={16} className="mr-1" />
                      <span className="text-sm">{errors.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Additional Info */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Additional Details</h2>
                  <p className="text-gray-600">Help us personalize your experience</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      min="1"
                      max="120"
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-green-200 transition-all text-gray-900 ${
                        errors.age
                           ? 'border-red-300 focus:border-red-500'
                           : 'border-gray-200 focus:border-green-500'
                      }`}
                      placeholder="Enter your age"
                    />
                  </div>
                  {errors.age && (
                    <div className="flex items-center mt-2 text-red-600">
                      <AlertCircle size={16} className="mr-1" />
                      <span className="text-sm">{errors.age}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-gray-400" size={20} />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-gray-900 resize-none"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Review Information</h2>
                  <p className="text-gray-600">Please confirm your details</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Full Name</span>
                      <span className="font-semibold text-gray-900">{formData.fullName}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Phone Number</span>
                      <span className="font-semibold text-gray-900">{formData.phoneNumber}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Age</span>
                      <span className="font-semibold text-gray-900">{formData.age} years</span>
                    </div>
                  </div>
                  {formData.address && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Address</span>
                        <span className="font-semibold text-gray-900 text-right">{formData.address}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-semibold"
                >
                  <ArrowLeft className="mr-2" size={20} />
                  Back
                </button>
              )}
              <div className="ml-auto">
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Next
                    <ArrowRight className="ml-2" size={20} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : null}
                    Create Account
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="/signin" className="text-green-600 font-semibold hover:text-green-700 transition-colors">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SignupPage;