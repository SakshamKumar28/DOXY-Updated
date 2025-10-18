import React, { useState } from 'react';
import { User, Phone, Calendar, MapPin, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignupPage = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    age: '',
    address: ''
  });

  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '']);

  // API Configuration
  const API_BASE_URL = import.meta?.env?.SERVER_URL || 'http://localhost:3000/api';

  // Custom fetch wrapper with error handling
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\s+/g, ''))) {
        newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
      }
    }
    
    if (step === 2) {
      if (!formData.age) {
        newErrors.age = 'Age is required';
      } else if (formData.age < 1 || formData.age > 120) {
        newErrors.age = 'Please enter a valid age between 1 and 120';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsLoading(true);
    setApiError('');

    try {
      // Clean phone number before sending
      const cleanedPhoneNumber = formData.phoneNumber.replace(/\s+/g, '');
      const payload = {
        ...formData,
        phoneNumber: cleanedPhoneNumber,
        age: parseInt(formData.age) // Ensure age is a number
      };

      console.log('Sending registration data:', payload);
      
      const response = await apiCall('/auth/user/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      console.log('Registration response:', response);
      
      if (response?.data?.userId) {
        setUserId(response.data.userId);
        setShowVerification(true);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      setApiError(errorMessage);
      
      // Navigate to appropriate step based on error
      if (errorMessage.toLowerCase().includes('phone')) {
        setCurrentStep(1);
      } else if (errorMessage.toLowerCase().includes('age')) {
        setCurrentStep(2);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationChange = (index, value) => {
    // Only allow single digits
    if (value.length > 1 || !/^\d*$/.test(value)) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Auto-focus next input
    if (value && index < 4) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerificationKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join('');
    if (code.length !== 5) {
      setApiError('Please enter all 5 digits of the verification code');
      return;
    }

    if (!userId) {
      setApiError('Session expired. Please try registering again.');
      setShowVerification(false);
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const payload = {
        userId: userId,
        verificationCode: code
      };

      console.log('Sending verification data:', payload);
      
      const response = await apiCall('/auth/user/verify', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      console.log('Verification response:', response);
      
      // Success - show success message and handle navigation
      alert('Account created successfully! Welcome to DOXY!');
      
      // Navigate to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Verification error:', error);
      
      let errorMessage = 'Verification failed. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      setApiError(errorMessage);
      
      // Clear verification code on error
      setVerificationCode(['', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!userId) {
      setApiError('Cannot resend code. Please try registering again.');
      setShowVerification(false);
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      // Since there's no separate resend endpoint, we'll re-register
      const cleanedPhoneNumber = formData.phoneNumber.replace(/\s+/g, '');
      const payload = {
        ...formData,
        phoneNumber: cleanedPhoneNumber,
        age: parseInt(formData.age)
      };

      const response = await apiCall('/auth/user/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (response?.data?.userId) {
        setUserId(response.data.userId);
        alert('A new verification code has been sent to your phone.');
        setVerificationCode(['', '', '', '', '']);
      }
    } catch (error) {
      console.error('Resend error:', error);
      const errorMessage = error.message || 'Failed to resend code. Please try again.';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInClick = () => {
    if (onNavigate) {
      onNavigate('/role?action=login');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/role?action=login';
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div onClick={()=>{navigate('/')}} className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div  className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
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
                <span className="font-semibold text-green-600">+91{formData.phoneNumber}</span>
              </p>
            </div>

            {/* API Error Display */}
            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center text-sm">
                <AlertCircle className="w-4 h-4 inline mr-2" />
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
                    className="w-14 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
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
                <p className="text-gray-600 mb-2">Didn't receive the code?</p>
                <button
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-green-600 font-semibold hover:text-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Resend Code'}
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
        <div onClick={()=>{navigate('/')}} className="text-center mb-8 cursor-pointer">
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
          {/* API Error Display */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center text-sm">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              {apiError}
            </div>
          )}
          
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
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
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-green-200 transition-all text-gray-900 outline-none ${
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
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-green-200 transition-all text-gray-900 outline-none ${
                      errors.phoneNumber 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-green-500'
                    }`}
                    placeholder="Enter your 10-digit phone number"
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
            <div className="space-y-6">
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
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-green-200 transition-all text-gray-900 outline-none ${
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
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-gray-900 resize-none outline-none"
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
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
                    <span className="font-semibold text-gray-900">+91{formData.phoneNumber}</span>
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
                  type="button"
                  onClick={handleSubmit}
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

          {/* Sign In Link */}
          <div className="text-center mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={handleSignInClick}
                className="text-green-600 font-semibold hover:text-green-700 transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;