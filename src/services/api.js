import axios from 'axios';

// Debug: Log the environment variable
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Debug: Log the request URL
    console.log('Request URL:', config.baseURL + config.url);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if it's not a login or registration request
    if (error.response?.status === 401 && 
        !error.config.url.includes('/login') && 
        !error.config.url.includes('/register')) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('userType');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API functions
export const authAPI = {
  // Farmer registration
  registerFarmer: async (farmerData) => {
    const response = await api.post('/api/auth/farmer/register', farmerData);
    return response.data;
  },

  // Buyer registration
  registerBuyer: async (buyerData) => {
    const response = await api.post('/api/auth/buyer/register', buyerData);
    return response.data;
  },

  // Login (if you have login endpoints)
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  // Get all farmers
  getAllFarmers: async () => {
    const response = await api.get('/api/auth/farmer');
    return response.data;
  },

  // Get all buyers
  getAllBuyers: async () => {
    const response = await api.get('/api/auth/buyer');
    return response.data;
  },

  // Get Aadhaar verification details
  getAadhaarVerification: async (userId) => {
    const response = await api.get(`/api/verification/aadhaar/${userId}`);
    return response.data;
  },

  // Google login
  googleLogin: async (googleData) => {
    const response = await api.post('/api/auth/google/login', googleData);
    return response.data;
  },
};

// Create separate axios instance for Aadhaar API
const aadhaarApi = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 30000, // 30 second timeout for file uploads
});

// Aadhaar Verification API functions
export const aadhaarAPI = {
  // Health check
  healthCheck: async () => {
    console.log('Aadhaar API Health Check URL:', aadhaarApi.defaults.baseURL + '/health');
    const response = await aadhaarApi.get('/health');
    return response.data;
  },

  // Extract Aadhaar data from 2-page PDF
  extractAadhaar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Aadhaar API Extract URL:', aadhaarApi.defaults.baseURL + '/extract-aadhaar');
    const response = await aadhaarApi.post('/extract-aadhaar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Extract Aadhaar data from single page PDF
  extractSingle: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Aadhaar API Single Extract URL:', aadhaarApi.defaults.baseURL + '/extract-single');
    const response = await aadhaarApi.post('/extract-single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Send OTP for verification (using main API on port 3000)
  sendOTP: async (emailData) => {
    console.log('Main API Send OTP URL:', api.defaults.baseURL + '/api/verification/send-otp');
    console.log('Send OTP payload:', emailData);
    try {
      const response = await api.post('/api/verification/send-otp', emailData);
      console.log('Send OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Send OTP API error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  // Verify OTP (using main API on port 3000)
  verifyOTP: async (otpData) => {
    console.log('Main API Verify OTP URL:', api.defaults.baseURL + '/api/verification/verify-otp');
    console.log('Verify OTP payload:', otpData);
    try {
      const response = await api.post('/api/verification/verify-otp', otpData);
      console.log('Verify OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Verify OTP API error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  // Store Aadhaar data in database (using main API on port 3000)
  storeAadhaarData: async (aadhaarData) => {
    console.log('Main API Store Aadhaar URL:', api.defaults.baseURL + '/api/verification/store-aadhaar');
    console.log('Store Aadhaar payload:', aadhaarData);
    try {
      const response = await api.post('/api/verification/store-aadhaar', aadhaarData);
      console.log('Store Aadhaar response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Store Aadhaar API error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },
};

export default api; 