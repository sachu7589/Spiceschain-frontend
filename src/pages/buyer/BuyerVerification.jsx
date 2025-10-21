import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Swal from 'sweetalert2';
import { panAPI } from '../../services/api';

const BuyerVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeMenu] = useState('dashboard');
  
  const [formData, setFormData] = useState({
    panNumber: '',
    panHolderName: '',
    dateOfBirth: '',
    businessName: '',
    businessType: '',
    gstNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contactNumber: user?.contactNumber || '',
    email: user?.email || '',
  });

  const [panFile, setPanFile] = useState(null);
  const [panPreview, setPanPreview] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  // Inputs are always readOnly; no lock state needed

  // Business lists removed (single step)

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-format PAN number
    if (name === 'panNumber') {
      const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (upperValue.length <= 10) {
        setFormData({ ...formData, [name]: upperValue });
      }
      return;
    }

    // Auto-format GST number
    if (name === 'gstNumber') {
      const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (upperValue.length <= 15) {
        setFormData({ ...formData, [name]: upperValue });
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        Swal.fire('Error', 'Please upload a valid image (JPG, PNG) or PDF file', 'error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Error', 'File size must be less than 5MB', 'error');
        return;
      }

      setPanFile(file);
      setExtracted(false);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPanPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPanPreview(null);
      }
    }
  };

  // PAN format validation not needed in single-step (server validates)

  // GST validation removed (single step)

  const validateStep1 = () => {
    if (!panFile) {
      Swal.fire('Error', 'Please upload PAN card image', 'error');
      return false;
    }
    return true;
  };

  // Single-step flow now; business details removed

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!extracted) {
      Swal.fire('Info', 'Please extract the PAN details first.', 'info');
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await panAPI.sendOTP({
        buyerId: user?.id || user?._id,
        panNumber: formData.panNumber
      });
      
      if (response.success) {
        setOtpSent(true);
        Swal.fire({ 
          icon: 'success', 
          title: 'OTP Sent', 
          text: `An OTP has been sent to ${response.data?.email || user?.email}. Please check your inbox.`,
          confirmButtonColor: '#10b981'
        });
      } else {
        throw new Error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP failed:', error);
      Swal.fire({ 
        icon: 'error', 
        title: 'Failed to send OTP', 
        text: error.response?.data?.message || error.message || 'Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Swal.fire('Error', 'Please enter a valid 6-digit OTP', 'error');
      return;
    }
    
    try {
      setIsVerifying(true);
      
      // Convert YYYY-MM-DD to DD/MM/YYYY format for backend
      const dobParts = formData.dateOfBirth.split('-');
      const dobFormatted = dobParts.length === 3 ? `${dobParts[2]}/${dobParts[1]}/${dobParts[0]}` : formData.dateOfBirth;
      
      const response = await panAPI.verifyOTP({
        buyerId: user?.id || user?._id,
        otp: otp,
        panNumber: formData.panNumber,
        panName: formData.panHolderName,
        dateOfBirth: dobFormatted
      });
      
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Verification Successful!',
          text: 'Your PAN card has been verified successfully. You can now access all features.',
          confirmButtonColor: '#10b981'
        }).then(() => {
          navigate('/dashboard');
        });
      } else {
        throw new Error(response.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      Swal.fire({ 
        icon: 'error', 
        title: 'Verification Failed', 
        text: error.response?.data?.message || error.message || 'Please try again.' 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  ];

  return (
    <DashboardLayout
      menuItems={menuItems}
      activeMenu={activeMenu}
      onMenuChange={() => navigate('/dashboard')}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Buyer Account Verification</h1>
          <p className="text-gray-600 text-center">Verify your account with PAN card to access all features</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 text-white">
                  <span>1</span>
                </div>
                <span className="ml-2 font-medium text-blue-600">PAN Details</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form Card */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit}>
            {/* PAN Details */}
            {
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">PAN Card Information</h3>
                  <p className="text-sm text-gray-600 mb-6">Enter your PAN card details for verification</p>
                </div>

                {/* Upload first */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload PAN Card <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                    <div className="space-y-1 text-center">
                      {panPreview ? (
                        <div className="mb-4">
                          <img src={panPreview} alt="PAN Preview" className="max-h-48 mx-auto rounded-lg" />
                        </div>
                      ) : (
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>{panFile ? 'Change file' : 'Upload a file'}</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
                      {panFile && (
                        <p className="text-sm text-green-600 font-medium">{panFile.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Auto-filled fields below */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      placeholder="ABCDE1234F"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength="10"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: 5 letters, 4 digits, 1 letter</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Holder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="panHolderName"
                      value={formData.panHolderName}
                      placeholder="As per PAN card"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength="10"
                    />
                  </div>
                </div>

                {/* OTP Verification Section */}
                {otpSent && (
                  <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-lg font-semibold text-blue-900 mb-4">Enter OTP</h4>
                    <p className="text-sm text-blue-700 mb-4">
                      We've sent a 6-digit OTP to your registered email address. Please enter it below to complete verification.
                    </p>
                    <div className="max-w-xs">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(value);
                        }}
                        placeholder="Enter 6-digit OTP"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                        maxLength="6"
                      />
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={!otp || otp.length !== 6 || isVerifying}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          (!otp || otp.length !== 6 || isVerifying)
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {isVerifying ? 'Verifying...' : 'Verify OTP'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp('');
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            }

            {/* Form Actions */}
            <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>

              {!otpSent ? (
                extracted ? (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Submit & Send OTP</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!validateStep1()) return;
                      try {
                        setIsExtracting(true);
                        const fd = new FormData();
                        fd.append('file', panFile);
                        const res = await fetch('http://localhost:5000/verify-pan-buyer', { method: 'POST', body: fd });
                        const json = await res.json();
                        if (!res.ok || !json.success) throw new Error(json?.error || 'Upload the correct PAN card');
                        const dobParts = (json.data.date_of_birth || '').split('/');
                        const isoDob = dobParts.length === 3 ? `${dobParts[2]}-${dobParts[1].padStart(2,'0')}-${dobParts[0].padStart(2,'0')}` : '';
                        setFormData(prev => ({ ...prev, panNumber: (json.data.pan_number || '').toUpperCase(), panHolderName: (json.data.name || '').toUpperCase(), dateOfBirth: isoDob }));
                        setExtracted(true);
                        Swal.fire({ icon: 'success', title: 'Extracted', text: 'PAN details extracted successfully.' });
                      } catch (error) {
                        Swal.fire({ icon: 'error', title: 'Extraction Failed', text: error.message || 'Upload the correct PAN card' });
                      } finally {
                        setIsExtracting(false);
                      }
                    }}
                    disabled={!panFile || isExtracting}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      (!panFile || isExtracting) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {isExtracting ? 'Extracting...' : 'Extract'}
                  </button>
                )
              ) : null}
            </div>
            </form>
          </div>

          {/* Right Column: Helpful Info */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-900 mb-2">Why verification?</h4>
                  <ul className="text-sm text-emerald-800 space-y-1">
                    <li>• Participate in all auctions</li>
                    <li>• Access detailed analytics and pricing</li>
                    <li>• Faster dispute resolution and support</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3">Tips for quick approval</h4>
              <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                <li>Upload a clear image or PDF of PAN card</li>
                <li>Ensure PAN holder name matches exactly</li>
              </ul>
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Verification Process</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Your PAN card will be verified with government records</li>
                    <li>• Verification typically takes 24-48 hours</li>
                    <li>• You'll receive an email notification once verified</li>
                    <li>• All information is encrypted and secure</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BuyerVerification;

