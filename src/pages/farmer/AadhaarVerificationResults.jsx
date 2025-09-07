import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaUser, FaIdCard, FaCalendarAlt, FaMapMarkerAlt, FaFileAlt, FaSpinner, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { aadhaarAPI } from '../../services/api';

const AadhaarVerificationResults = () => {
  const { user, logout, updateUserData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const aadhaarData = location.state?.aadhaarData;
  
  // OTP Modal State
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [otpDetails, setOtpDetails] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setOtpError('OTP has expired. Please request a new one.');
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);


  // Start timer for 2 minutes (120 seconds)
  const startTimer = () => {
    setTimeLeft(120); // 2 minutes
    setTimerActive(true);
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!aadhaarData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Found</h2>
          <p className="text-gray-600 mb-4">Please upload your Aadhaar card first.</p>
          <button
            onClick={() => navigate('/farmer/verification')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back to Verification
          </button>
        </div>
      </div>
    );
  }

  const getIcon = (iconName) => {
    const icons = {
      grid: (
        <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      logout: (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
    };
    return icons[iconName] || icons.grid;
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid', active: true, action: () => navigate('/dashboard') },
  ];

  // Handle Submit button click - send OTP
  const handleSubmit = async () => {
    if (!aadhaarData) {
      setOtpError('No Aadhaar data available');
      return;
    }

    // Check if user has email, if not show email input
    if (!user.email) {
      setShowEmailInput(true);
      setShowOTPModal(true);
      return;
    }

    // User has email, send OTP directly
    await sendOTPToEmail(user.email);
  };

  // Send OTP to email
  const sendOTPToEmail = async (emailAddress) => {
    setIsSendingOTP(true);
    setOtpError(null);
    setShowOTPModal(true);
    setShowEmailInput(false);
    
    try {
      const response = await aadhaarAPI.sendOTP({
        email: emailAddress,
        name: user.fullName || user.name,
        userType: user.userType
      });
      
      if (response.success) {
        console.log('OTP sent successfully to email');
        // Start 2-minute timer
        startTimer();
        // Store OTP details for display
        setOtpDetails({
          email: emailAddress,
          name: user.fullName || user.name,
          userType: user.userType,
          sent_at: new Date().toLocaleString(),
          expires_in: '2 minutes'
        });
      } else {
        setOtpError(response.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.response?.status === 500) {
        errorMessage = 'Server error. Please check if the backend is running on port 3000.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setOtpError(errorMessage);
    } finally {
      setIsSendingOTP(false);
    }
  };

  // Handle email input and send OTP
  const handleEmailSubmit = async () => {
    if (!isEmailValid) {
      setOtpError('Please enter a valid email address');
      return;
    }
    await sendOTPToEmail(email);
  };

  // Validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email change
  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    setIsEmailValid(validateEmail(emailValue));
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }

    // Check if OTP has expired
    if (timerActive && timeLeft === 0) {
      setOtpError('OTP has expired. Please request a new one.');
      return;
    }

    setIsVerifyingOTP(true);
    setOtpError(null);

    try {
      // Send OTP to backend for verification
      const response = await aadhaarAPI.verifyOTP({
        email: user.email || email,
        otp: otpString,
        userType: user.userType
      });

      if (response.success) {
        console.log('✅ OTP verification successful!');
        console.log('📊 Response data:', response);
        setOtpSuccess(true);
        setTimerActive(false);
        
        // Store Aadhaar data in database
        console.log('💾 Storing Aadhaar data in database...');
        console.log('📋 Aadhaar data:', aadhaarData);
        
        if (!aadhaarData) {
          console.error('❌ No Aadhaar data found');
          setOtpError('No Aadhaar data found. Please try uploading again.');
          return;
        }

        try {
          // Format the Aadhaar data to match backend schema requirements
          const formatGender = (gender) => {
            if (!gender) return '';
            // Convert to proper case (MALE -> Male, FEMALE -> Female)
            return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
          };

          const formattedAadhaarData = {
            ...aadhaarData,
            gender: formatGender(aadhaarData.gender)
          };

          const aadhaarPayload = {
            userId: user.id || user._id,
            aadhaarData: formattedAadhaarData
          };
          
          console.log('📤 Aadhaar payload for storage:', aadhaarPayload);
          const storeResponse = await aadhaarAPI.storeAadhaarData(aadhaarPayload);
          
          if (storeResponse.success) {
            console.log('✅ Aadhaar data stored successfully!');
            console.log('📊 Store response:', storeResponse);
          } else {
            console.error('❌ Failed to store Aadhaar data:', storeResponse);
          }
        } catch (storeError) {
          console.error('❌ Error storing Aadhaar data:', storeError);
          console.error('❌ Store error response:', storeError.response?.data);
          
          // Handle specific backend error cases
          let errorMessage = 'Failed to store Aadhaar data';
          
          if (storeError.response?.status === 400) {
            const backendMessage = storeError.response?.data?.message;
            if (backendMessage?.includes('already registered')) {
              errorMessage = 'This Aadhaar number is already registered with another account';
            } else if (backendMessage?.includes('already exists')) {
              errorMessage = 'Aadhaar verification already exists for this account';
            } else if (backendMessage?.includes('required')) {
              errorMessage = 'Missing required Aadhaar data';
            } else {
              errorMessage = backendMessage || errorMessage;
            }
          } else if (storeError.response?.status === 404) {
            errorMessage = 'Farmer account not found';
          } else if (storeError.response?.status === 500) {
            errorMessage = 'Server error while storing Aadhaar data';
          }
          
          setOtpError(`Verification successful but data storage failed: ${errorMessage}`);
          
          // Still continue with verification - don't block the user
          console.log('⚠️ Continuing with verification despite storage error...');
        }
        
        // Update user data directly from verification response
        console.log('🔄 Updating user data from verification response...');
        const updatedUserData = {
          ...user,
          isVerified: response.data.isVerified
        };
        console.log('✅ Updated user data:', updatedUserData);
        console.log('✅ New isVerified status:', updatedUserData.isVerified);
        
        // Update the user in context and localStorage
        updateUserData(updatedUserData);
        
        setTimeout(() => {
          console.log('🚀 Navigating to dashboard...');
          navigate('/dashboard');
        }, 2000);
      } else {
        console.log('❌ OTP verification failed:', response);
        setOtpError(response.message || 'Invalid OTP. Please check and try again.');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setOtpError(error.response?.data?.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  // Handle backspace in OTP input
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-white/80 backdrop-blur-xl shadow-2xl border-r border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                SpicesChain
              </span>
              <p className="text-xs text-gray-500 -mt-1">Trading Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.action ? item.action() : null}
              className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                item.active
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                  : 'text-gray-600 hover:bg-white/80 hover:text-gray-900 hover:shadow-md'
              }`}
            >
              <span className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 ${
                item.active
                  ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                  : 'bg-gray-100 group-hover:bg-emerald-50 group-hover:shadow-sm'
              }`}>
                {getIcon(item.icon)}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile and Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/20 bg-white/40 backdrop-blur-sm space-y-4">
          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 group text-red-600 hover:bg-red-50 hover:text-red-700 hover:shadow-md"
          >
            <span className="flex-shrink-0 p-2 rounded-lg transition-all duration-200 bg-red-100 group-hover:bg-red-200">
              {getIcon('logout')}
            </span>
            <span className="text-sm font-medium">Logout</span>
          </button>

          {/* Separator Line */}
          <div className="border-t border-white/30"></div>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                {(user.fullName || user.name) ? (user.fullName || user.name).charAt(0).toUpperCase() : ''}
              </div>
              {/* Verification Status Indicator */}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full flex items-center justify-center ${
                user.isVerified ? 'bg-green-500' : 'bg-orange-500'
              }`}>
                {user.isVerified ? (
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.fullName || user.name}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {user.email || user.contactNumber}
              </p>
              <div className="flex items-center mt-1 space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  {user.userType}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user.isVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {user.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Aadhaar Verification Results
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Extracted data from your Aadhaar card, <span className="font-semibold text-gray-900">{user.fullName || user.name}</span>! 👋
              </p>
            </div>
            <div className="flex items-center space-x-6">
              {/* User Menu */}
              <div className="flex items-center space-x-4 p-3 bg-white/60 rounded-xl border border-white/30">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user.fullName || user.name}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.isVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {(user.fullName || user.name) ? (user.fullName || user.name).charAt(0).toUpperCase() : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-8">
          <div className="space-y-8">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <FaCheckCircle className="text-green-500 text-2xl" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Aadhaar Data Successfully Extracted!</h3>
                  <p className="text-green-700">Your Aadhaar card information has been processed and verified.</p>
                </div>
              </div>
            </div>

            {/* Aadhaar Data Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <FaUser className="text-blue-500 mr-3" />
                  Personal Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaIdCard className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Aadhaar Number</p>
                      <p className="font-semibold text-gray-900">{aadhaarData.aadhaar_number || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaUser className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-semibold text-gray-900">{aadhaarData.name || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaUser className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Father's Name</p>
                      <p className="font-semibold text-gray-900">{aadhaarData.father_name || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaUser className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Mother's Name</p>
                      <p className="font-semibold text-gray-900">{aadhaarData.mother_name || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaCalendarAlt className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-semibold text-gray-900">{aadhaarData.date_of_birth || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaUser className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-semibold text-gray-900">{aadhaarData.gender || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <FaMapMarkerAlt className="text-green-500 mr-3" />
                  Address Information
                </h3>
                
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Complete Address</p>
                    <p className="font-semibold text-gray-900">{aadhaarData.address || 'N/A'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FaMapMarkerAlt className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">PIN Code</p>
                        <p className="font-semibold text-gray-900">{aadhaarData.pin_code || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FaMapMarkerAlt className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">State</p>
                        <p className="font-semibold text-gray-900">{aadhaarData.state || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaMapMarkerAlt className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">District</p>
                      <p className="font-semibold text-gray-900">{aadhaarData.district || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={isSendingOTP}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white px-12 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {isSendingOTP ? (
                  <div className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin h-5 w-5" />
                    <span>Sending OTP...</span>
                  </div>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="text-emerald-600 text-2xl" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h3>
              
              {/* Email Input Section */}
              {showEmailInput ? (
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Please enter your email address to receive the verification OTP:
                  </p>
                  <div className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none text-center"
                      disabled={isSendingOTP}
                    />
                    {email && !isEmailValid && (
                      <p className="text-red-500 text-sm">Please enter a valid email address</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    We've sent a 6-digit OTP to your email address{' '}
                    <span className="font-semibold text-gray-900">
                      {user.email || email}
                    </span>
                  </p>
                  
                  {/* Timer Display */}
                  {timerActive && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 text-center border border-emerald-200">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-gray-600">Expires in</span>
                        <span className={`text-lg font-bold ${timeLeft > 30 ? 'text-emerald-600' : timeLeft > 10 ? 'text-orange-600' : 'text-red-600'}`}>
                          {formatTime(timeLeft)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* OTP Input - Only show when not in email input mode */}
              {!showEmailInput && (
                <div className="flex justify-center space-x-3 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                      disabled={isVerifyingOTP}
                    />
                  ))}
                </div>
              )}

              {/* Error Message */}
              {otpError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <FaTimesCircle className="text-red-500" />
                    <span className="text-red-800 text-sm">{otpError}</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {otpSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <FaCheckCircle className="text-green-500" />
                    <span className="text-green-800 text-sm">OTP verified successfully! Redirecting...</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowOTPModal(false);
                    setShowEmailInput(false);
                    setEmail('');
                    setOtp(['', '', '', '', '', '']);
                    setOtpError(null);
                    setOtpDetails(null);
                    setTimeLeft(0);
                    setTimerActive(false);
                  }}
                  disabled={isVerifyingOTP || isSendingOTP}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                
                {showEmailInput ? (
                  <button
                    onClick={handleEmailSubmit}
                    disabled={!isEmailValid || isSendingOTP}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
                  >
                    {isSendingOTP ? (
                      <div className="flex items-center justify-center space-x-2">
                        <FaSpinner className="animate-spin h-4 w-4" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleVerifyOTP}
                    disabled={isVerifyingOTP || otp.join('').length !== 6}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
                  >
                    {isVerifyingOTP ? (
                      <div className="flex items-center justify-center space-x-2">
                        <FaSpinner className="animate-spin h-4 w-4" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>
                )}
              </div>

              {/* Resend OTP - Only show when not in email input mode */}
              {!showEmailInput && (
                <button
                  onClick={() => {
                    setOtp(['', '', '', '', '', '']);
                    setOtpError(null);
                    sendOTPToEmail(user.email || email);
                  }}
                  disabled={isSendingOTP}
                  className="mt-4 text-emerald-600 hover:text-emerald-700 text-sm font-medium disabled:text-gray-400"
                >
                  {isSendingOTP ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AadhaarVerificationResults;
