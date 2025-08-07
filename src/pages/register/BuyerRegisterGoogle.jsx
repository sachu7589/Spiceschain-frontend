import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaLock, FaBuilding, FaBriefcase, FaGoogle } from 'react-icons/fa';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const BuyerRegisterGoogle = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [googleData, setGoogleData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    businessType: '',
    yearsInBusiness: '',
    contactNumber: '',
    whatsappNumber: '',
    emailAddress: '',
    registeredOfficeAddress: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    password: 'google-auth', // Fixed password for Google auth
    confirmPassword: 'google-auth'
  });

  const [errors, setErrors] = useState({});

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 3) return 'Name must be at least 3 characters';
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Name can only contain alphabets and spaces';
    if (name.trim().length >= 3 && /^(.)\1+$/.test(name.trim())) return 'Name cannot be all same characters';
    return '';
  };



  const validatePhoneNumber = (number) => {
    if (!number.trim()) return 'Phone number is required';
    if (!/^\d{10}$/.test(number.trim())) return 'Phone number must be 10 digits';
    if (!/^[6789]/.test(number.trim())) return 'Phone number must start with 6, 7, 8, or 9';
    
    // Check for 5 consecutive same digits
    for (let i = 0; i <= number.length - 5; i++) {
      const segment = number.slice(i, i + 5);
      if (/^(\d)\1{4}$/.test(segment)) {
        return 'Phone number cannot have 5 consecutive same digits';
      }
    }
    return '';
  };



  const fetchAddressFromPincode = async (pincode) => {
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      setIsPincodeLoading(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        
        if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            district: postOffice.District || '',
            state: postOffice.State || ''
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            district: '',
            state: ''
          }));
        }
      } catch (error) {
        console.error('Error fetching pincode data:', error);
        setFormData(prev => ({
          ...prev,
          district: '',
          state: ''
        }));
      } finally {
        setIsPincodeLoading(false);
      }
    }
  };

  useEffect(() => {
    // Get Google data from sessionStorage
    const storedGoogleData = sessionStorage.getItem('googleAuthData');
    if (storedGoogleData) {
      const data = JSON.parse(storedGoogleData);
      setGoogleData(data);
      
      // Pre-fill form with Google data
      setFormData(prev => ({
        ...prev,
        fullName: data.name || '',
        emailAddress: data.email || ''
      }));
    } else {
      // If no Google data, redirect back to regular registration
      navigate('/register/buyer');
    }
  }, [navigate]);

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
      title: 'Registration Failed!',
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

    // Auto-fetch address for pincode
    if (name === 'pincode') {
      fetchAddressFromPincode(value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';

    switch (name) {
      case 'fullName':
        error = validateName(value);
        break;
      case 'contactNumber':
        error = validatePhoneNumber(value);
        break;
      case 'whatsappNumber':
        error = validatePhoneNumber(value);
        break;
      case 'emailAddress':
        if (!value.trim()) {
          error = 'Email address is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'registeredOfficeAddress':
        if (!value.trim()) error = 'Registered office address is required';
        break;
      case 'city':
        if (!value.trim()) error = 'City is required';
        break;
      case 'district':
        if (!value.trim()) error = 'District is required';
        break;
      case 'state':
        if (!value.trim()) error = 'State is required';
        break;
      case 'pincode':
        if (!value.trim()) error = 'Pincode is required';
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
      case 'fullName':
        error = validateName(value);
        break;
      case 'contactNumber':
        error = validatePhoneNumber(value);
        break;
      case 'whatsappNumber':
        error = validatePhoneNumber(value);
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    const nameError = validateName(formData.fullName);
    if (nameError) newErrors.fullName = nameError;

    // Validate business fields
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!formData.businessType) newErrors.businessType = 'Business type is required';
    if (!formData.yearsInBusiness) newErrors.yearsInBusiness = 'Years in business is required';



    // Validate phone numbers
    const contactError = validatePhoneNumber(formData.contactNumber);
    if (contactError) newErrors.contactNumber = contactError;

    const whatsappError = validatePhoneNumber(formData.whatsappNumber);
    if (whatsappError) newErrors.whatsappNumber = whatsappError;

    // Validate email
    if (!formData.emailAddress.trim()) newErrors.emailAddress = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address';
    }

    // Validate address fields
    if (!formData.registeredOfficeAddress.trim()) newErrors.registeredOfficeAddress = 'Registered office address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        // Remove confirmPassword from the data sent to API
        const { confirmPassword, ...apiData } = formData;
        
        const response = await authAPI.registerBuyer(apiData);
        
        // Clear Google data from sessionStorage
        sessionStorage.removeItem('googleAuthData');
        
        // Show success alert
        showSuccessAlert('Buyer account created successfully! Welcome to SpicesChain!');
        
        // Add a small delay to ensure the alert is visible before redirecting
        setTimeout(() => {
          // Use the auth context to login
          login(response.data.token, response.data.buyer);
        }, 1000);
      } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
        showErrorAlert(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!googleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <FaBuilding className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold text-gray-900">SpicesChain</span>
            </Link>
            <Link 
              to="/login" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content - Full Height */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 sm:px-8 py-4 sm:py-6">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FaGoogle className="text-white text-lg sm:text-2xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Complete Your Buyer Profile</h1>
              <p className="text-blue-100 text-sm sm:text-base">Signed in with Google • {googleData.email}</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Business Information Section */}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                  <FaBriefcase className="mr-2 text-blue-600" />
                  Business Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onKeyUp={handleKeyUp}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>



                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.businessName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter business name"
                    />
                    {errors.businessName && (
                      <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type *
                    </label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.businessType ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select business type</option>
                      <option value="wholesaler">Wholesaler</option>
                      <option value="retailer">Retailer</option>
                      <option value="exporter">Exporter</option>
                      <option value="manufacturer">Manufacturer</option>
                    </select>
                    {errors.businessType && (
                      <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years in Business *
                    </label>
                    <input
                      type="number"
                      name="yearsInBusiness"
                      value={formData.yearsInBusiness}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.yearsInBusiness ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter years in business"
                      min="0"
                    />
                    {errors.yearsInBusiness && (
                      <p className="text-red-500 text-sm mt-1">{errors.yearsInBusiness}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number *
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyUp={handleKeyUp}
                        className={`w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.contactNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter contact number"
                      />
                    </div>
                    {errors.contactNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Number *
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyUp={handleKeyUp}
                        className={`w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.whatsappNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter WhatsApp number"
                      />
                    </div>
                    {errors.whatsappNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.whatsappNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.emailAddress ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter email address"
                        readOnly
                      />
                    </div>
                    {errors.emailAddress && (
                      <p className="text-red-500 text-sm mt-1">{errors.emailAddress}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Address Section */}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-600" />
                  Business Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registered Office Address *
                    </label>
                    <textarea
                      name="registeredOfficeAddress"
                      value={formData.registeredOfficeAddress}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows="3"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.registeredOfficeAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter registered office address"
                    />
                    {errors.registeredOfficeAddress && (
                      <p className="text-red-500 text-sm mt-1">{errors.registeredOfficeAddress}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter city"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District *
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      readOnly
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 ${
                        errors.district ? 'border-red-500' : 'border-gray-300'
                      } ${isPincodeLoading ? 'bg-gray-100' : ''}`}
                      placeholder="Will be auto-filled from pincode"
                    />
                    {errors.district && (
                      <p className="text-red-500 text-sm mt-1">{errors.district}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      readOnly
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      } ${isPincodeLoading ? 'bg-gray-100' : ''}`}
                      placeholder="Will be auto-filled from pincode"
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                                         <div className="relative">
                       <input
                         type="text"
                         name="pincode"
                         value={formData.pincode}
                         onChange={handleChange}
                         onBlur={handleBlur}
                         className={`w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                           errors.pincode ? 'border-red-500' : 'border-gray-300'
                         }`}
                         placeholder="Enter pincode"
                         maxLength="6"
                         disabled={isPincodeLoading}
                       />
                       {isPincodeLoading && (
                         <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
                           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                         </div>
                       )}
                     </div>
                    {errors.pincode && (
                      <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 sm:pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 sm:py-4 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center pt-3 sm:pt-4">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerRegisterGoogle; 