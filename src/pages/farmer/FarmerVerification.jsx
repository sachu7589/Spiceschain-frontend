import React, { useState } from 'react';
import { FaUpload, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { aadhaarAPI } from '../../services/api';

const FarmerVerification = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type - only PDF allowed
      if (file.type === 'application/pdf') {
        setAadhaarFile(file);
        setUploadSuccess(false);
        setUploadError(null);
      } else {
        setUploadError('Please select a PDF file only');
      }
    }
  };

  const handleUpload = async () => {
    if (!aadhaarFile) {
      setUploadError('Please select an Aadhaar PDF first');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Try 2-page extraction first
      const response = await aadhaarAPI.extractAadhaar(aadhaarFile);
      
      if (response.success) {
        setUploadSuccess(true);
        // Navigate to results page with extracted data
        navigate('/farmer/verification/results', { 
          state: { aadhaarData: response.data } 
        });
      } else {
        setUploadError(response.error || 'Failed to extract Aadhaar data');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // If 2-page extraction fails, try single page
      try {
        const singleResponse = await aadhaarAPI.extractSingle(aadhaarFile);
        
        if (singleResponse.success) {
          setUploadSuccess(true);
          // Navigate to results page with extracted data
          navigate('/farmer/verification/results', { 
            state: { aadhaarData: singleResponse.data } 
          });
        } else {
          setUploadError(singleResponse.error || 'Failed to extract Aadhaar data');
        }
      } catch (singleError) {
        console.error('Single page extraction error:', singleError);
        
        // Check if it's a network error
        if (error.code === 'ERR_NETWORK' || singleError.code === 'ERR_NETWORK') {
          setUploadError('Unable to connect to verification service. Please check if the backend is running on http://localhost:5000');
        } else {
          setUploadError(
            error.response?.data?.error || 
            singleError.response?.data?.error || 
            'Failed to process Aadhaar card. Please try again.'
          );
        }
      }
    } finally {
      setIsUploading(false);
    }
  };


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

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className={`bg-white/80 backdrop-blur-xl shadow-2xl border-r border-white/20 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          {!sidebarCollapsed && (
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
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-white/60 hover:shadow-md transition-all duration-200 group"
          >
            <svg className={`w-5 h-5 transition-colors duration-200 ${
              sidebarCollapsed ? 'text-emerald-600' : 'text-gray-600'
            } group-hover:text-emerald-700`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className={`${sidebarCollapsed ? 'p-4' : 'p-6'} space-y-2`}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.action ? item.action() : null}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-4'} ${sidebarCollapsed ? 'px-2 py-3' : 'px-4 py-3'} rounded-xl transition-all duration-200 group ${
                item.active
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                  : 'text-gray-600 hover:bg-white/80 hover:text-gray-900 hover:shadow-md'
              }`}
            >
              <span className={`flex-shrink-0 ${sidebarCollapsed ? 'p-2' : 'p-2'} rounded-lg transition-all duration-200 ${
                item.active
                  ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                  : 'bg-gray-100 group-hover:bg-emerald-50 group-hover:shadow-sm'
              }`}>
                {getIcon(item.icon)}
              </span>
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile and Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/20 bg-white/40 backdrop-blur-sm space-y-4">
          {/* Logout Button */}
          <button
            onClick={logout}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-4'} ${sidebarCollapsed ? 'px-2 py-3' : 'px-4 py-3'} rounded-xl transition-all duration-200 group text-red-600 hover:bg-red-50 hover:text-red-700 hover:shadow-md`}
          >
            <span className={`flex-shrink-0 ${sidebarCollapsed ? 'p-2' : 'p-2'} rounded-lg transition-all duration-200 bg-red-100 group-hover:bg-red-200`}>
              {getIcon('logout')}
            </span>
            {!sidebarCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>

          {/* Separator Line */}
          <div className="border-t border-white/30"></div>

          {/* User Profile */}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-4'}`}>
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
            {!sidebarCollapsed && (
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
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent capitalize">
                Account Verification
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Complete your verification, <span className="font-semibold text-gray-900">{user.fullName || user.name}</span>! 👋
              </p>
            </div>
            <div className="flex items-center space-x-6">
              {/* Notifications */}
              <button className="relative p-3 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:bg-white/60 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75l-.75.75V19.5h13.5v-1.5l-.75-.75V9.75a6 6 0 00-6-6z" />
                </svg>
                <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              
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
                  {/* Verification Status Indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full flex items-center justify-center ${
                    user.isVerified ? 'bg-green-500' : 'bg-orange-500'
                  }`}>
                    {user.isVerified ? (
                      <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-8">
          <div className="space-y-8">
            {/* Verification Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Step 1: Upload Aadhaar */}
              <div className="lg:col-span-2">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                    Upload Aadhaar Card (PDF with Front & Back)
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-gray-900">
                          {aadhaarFile ? aadhaarFile.name : 'Choose Aadhaar PDF (Front & Back)'}
                        </p>
                        <p className="text-sm text-gray-500">
                          PDF only, up to 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="aadhaar-upload"
                      />
                      <label
                        htmlFor="aadhaar-upload"
                        className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors"
                      >
                        Select File
                      </label>
                    </div>

                    {aadhaarFile && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <FaCheckCircle className="text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900">{aadhaarFile.name}</p>
                            <p className="text-sm text-gray-500">
                              {(aadhaarFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleUpload}
                      disabled={!aadhaarFile || isUploading}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                        aadhaarFile && !isUploading
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isUploading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <FaSpinner className="animate-spin h-4 w-4" />
                          <span>Processing Aadhaar...</span>
                        </div>
                      ) : (
                        'Upload Aadhaar PDF'
                      )}
                    </button>

                    {uploadSuccess && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <FaCheckCircle className="text-green-500" />
                          <span className="text-green-800 font-medium">
                            Aadhaar PDF uploaded successfully!
                          </span>
                        </div>
                      </div>
                    )}

                    {uploadError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <FaTimesCircle className="text-red-500" />
                          <span className="text-red-800 font-medium">
                            {uploadError}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Verification Info */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                  Verification Process
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-700">
                        Upload a PDF with both front and back sides of your Aadhaar card
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-700">
                        Ensure all details are clearly visible
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-700">
                        Verification will be completed within 24 hours
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">Note:</span> Your account will remain unverified until the verification process is complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Verification Status</h3>
                <p className="text-orange-600 text-2xl font-bold">Pending</p>
                <p className="text-gray-500 text-sm">Upload required</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Documents Uploaded</h3>
                <p className="text-blue-600 text-2xl font-bold">{aadhaarFile ? '1' : '0'}</p>
                <p className="text-gray-500 text-sm">of 1 required</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Processing Time</h3>
                <p className="text-purple-600 text-2xl font-bold">24h</p>
                <p className="text-gray-500 text-sm">estimated</p>
              </div>
            </div>

            {/* Verification Requirements */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Verification Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
              <p className="text-gray-600 flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Upload a PDF with both front and back sides of your Aadhaar card</span>
              </p>
                  <p className="text-gray-600 flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Ensure all text and numbers are clearly readable</span>
                  </p>
                  <p className="text-gray-600 flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>The PDF should be clear and high-quality</span>
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-600 flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Include both front and back sides in the same PDF</span>
                  </p>
                  <p className="text-gray-600 flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Verification will be completed within 24 hours</span>
                  </p>
                  <p className="text-gray-600 flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>You'll receive an email notification when complete</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default FarmerVerification;