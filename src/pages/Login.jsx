import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import GoogleAuthLogin from '../components/GoogleAuthLogin';

const Login = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

  // Validation functions
  const validateEmailOrPhone = (value) => {
    if (!value) return 'Email or phone number is required';
    
    const inputType = detectInputType(value);
    if (inputType === 'email') {
      if (!/\S+@\S+\.\S+/.test(value)) {
        return 'Please enter a valid email address';
      }
    } else if (inputType === 'phone') {
      const cleanPhone = value.replace(/[\s\-()]/g, '');
      if (!/^\+?[1-9]\d{9,14}$/.test(cleanPhone)) {
        return 'Please enter a valid phone number';
      }
    } else {
      return 'Please enter a valid email address or phone number';
    }
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters long';
    return '';
  };

  const detectInputType = (value) => {
    // Check if it's an email (contains @)
    if (value.includes('@')) {
      return 'email';
    }
    // Check if it's a phone number (contains only digits, +, spaces, dashes, parentheses)
    const phoneRegex = /^[+\d\s\-()]+$/;
    if (phoneRegex.test(value) && value.replace(/[\s\-()]/g, '').length >= 10) {
      return 'phone';
    }
    return 'unknown';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';
    
    switch (name) {
      case 'emailOrPhone':
        error = validateEmailOrPhone(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleKeyUp = (e) => {
    const { name, value } = e.target;
    let error = '';
    
    switch (name) {
      case 'emailOrPhone':
        error = validateEmailOrPhone(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const SUCCESS_ALERT_CONFIG = {
    position: 'top-end',
    timer: 5000,
    timerProgressBar: true,
    toast: true,
    showConfirmButton: false,
    allowOutsideClick: false,
    customClass: {
      popup: 'swal2-toast',
      title: 'swal2-toast-title',
      content: 'swal2-toast-content'
    }
  };

  const showSuccessAlert = (message) => {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      ...SUCCESS_ALERT_CONFIG
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Login Failed!',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#ef4444',
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        confirmButton: 'swal2-confirm-error',
        popup: 'swal2-error-popup'
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate email or phone
    const emailOrPhoneError = validateEmailOrPhone(formData.emailOrPhone);
    if (emailOrPhoneError) newErrors.emailOrPhone = emailOrPhoneError;

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        // Prepare request body based on detected input type
        const inputType = detectInputType(formData.emailOrPhone);
        const requestBody = {
          password: formData.password
        };

        if (inputType === 'email') {
          requestBody.emailAddress = formData.emailOrPhone;
        } else if (inputType === 'phone') {
          requestBody.contactNumber = formData.emailOrPhone;
        }

        const response = await authAPI.login(requestBody);
        
        // Show success alert
        showSuccessAlert('Login successful! Welcome back.');
        
        // Add a small delay to ensure the alert is visible before redirecting
        setTimeout(() => {
          // Use the auth context to login
          login(response.data.token, response.data.user);
        }, 1000);
      } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials and try again.';
        showErrorAlert(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                SpicesChain
              </h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email or Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyUp={handleKeyUp}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 ${
                    errors.emailOrPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email or phone number"
                />
              </div>
              {errors.emailOrPhone && <p className="text-red-500 text-sm mt-1">{errors.emailOrPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyUp={handleKeyUp}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleAuthLogin />
            </div>

            <div className="text-center">
              <p className="text-gray-600">Don't have an account?</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <Link
                  to="/register/farmer"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors text-center"
                >
                  Register as Farmer
                </Link>
                <Link
                  to="/register/buyer"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  Register as Buyer
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-40 right-10 w-16 h-16 bg-white rounded-full"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h2 className="text-4xl font-bold mb-4">Revolutionizing Spice Trading</h2>
            <p className="text-xl opacity-90 mb-8">
              Connect directly with farmers, get real-time pricing, and trade spices with transparency and efficiency.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm opacity-80">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">₹50M+</div>
                <div className="text-sm opacity-80">Trading Volume</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm opacity-80">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-white/20 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-white/40 rounded-full animate-pulse delay-2000"></div>
      </div>
    </div>
  );
};

export default Login; 