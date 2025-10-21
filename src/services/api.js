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

  // Get farmer by ID
  getFarmerById: async (farmerId) => {
    const response = await api.get(`/api/auth/farmer/${farmerId}`);
    return response.data;
  },

  // Get all buyers
  getAllBuyers: async () => {
    const response = await api.get('/api/auth/buyer');
    return response.data;
  },

  // Get buyer by ID
  getBuyerById: async (buyerId) => {
    const response = await api.get(`/api/auth/buyer/${buyerId}`);
    return response.data;
  },

  // Get farmer bank details
  getFarmerBankDetails: async (farmerId) => {
    const response = await api.get(`/api/auth/farmer/bank-details/${farmerId}`);
    return response.data;
  },

  // Add farmer bank details
  addFarmerBankDetails: async (bankData) => {
    const response = await api.post('/api/auth/farmer/bank-details', bankData);
    return response.data;
  },

  // Update farmer bank details
  updateFarmerBankDetails: async (farmerId, bankData) => {
    const response = await api.put(`/api/auth/farmer/bank-details/${farmerId}`, bankData);
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

// Create separate axios instance for Spice Prices API
const spicePricesApi = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000, // 10 second timeout
});

// Create separate axios instance for Weather API (OpenWeatherMap)
const weatherApi = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 10000, // 10 second timeout
});

// Create separate axios instance for Inventory API (port 3001)
const inventoryApi = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 30000, // 30 second timeout for file uploads
});

// Add auth token interceptor for inventory API
inventoryApi.interceptors.request.use(
  (config) => {
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

// Spice Prices API functions
export const spicePricesAPI = {
  // Get all spice prices
  getAllSpicePrices: async () => {
    const response = await spicePricesApi.get('/spice-prices');
    return response.data;
  },

  // Get only Cardamom prices
  getCardamomPrices: async (limit = null) => {
    const params = { spice_name: 'Cardamom' };
    if (limit) params.limit = limit;
    const response = await spicePricesApi.get('/spice-prices', { params });
    return response.data;
  },

  // Get all Cardamom data
  getAllCardamomData: async () => {
    const response = await spicePricesApi.get('/spice-prices/all', { 
      params: { spice_name: 'Cardamom' } 
    });
    return response.data;
  },

  // Get latest Cardamom price
  getLatestCardamomPrice: async () => {
    const response = await spicePricesApi.get('/spice-prices/latest/Cardamom');
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await spicePricesApi.get('/spice-prices/stats');
    return response.data;
  },

  // Get daily cardamom prices for the last 7 days
  getDailyCardamomPrices: async (days = 7) => {
    try {
      // Get all cardamom data and process it to get daily prices
      const response = await spicePricesApi.get('/spice-prices/all', { 
        params: { 
          spice_name: 'Cardamom'
        } 
      });
      
      if (response.data && Array.isArray(response.data)) {
        return processDailyPrices(response.data, days);
      }
      return generateMockDailyPrices(days);
    } catch (error) {
      console.error('Error fetching daily cardamom prices:', error);
      // Return mock data if API fails
      return generateMockDailyPrices(days);
    }
  },

  // Get cardamom prices with date range
  getCardamomPricesByDateRange: async (startDate, endDate) => {
    try {
      // Get all cardamom data and filter by date range
      const response = await spicePricesApi.get('/spice-prices/all', { 
        params: { 
          spice_name: 'Cardamom'
        } 
      });
      
      if (response.data && Array.isArray(response.data)) {
        return processDailyPricesByDateRange(response.data, startDate, endDate);
      }
      return generateMockDailyPrices(7);
    } catch (error) {
      console.error('Error fetching cardamom prices by date range:', error);
      return generateMockDailyPrices(7);
    }
  },
};

// Helper function to get correct day name for Indian timezone
const getDayName = (dateString) => {
  // Handle both date strings and full datetime strings
  let date;
  if (dateString.includes('T')) {
    // Full datetime string from database
    date = new Date(dateString);
  } else {
    // Date-only string (YYYY-MM-DD format)
    date = new Date(dateString + 'T00:00:00');
  }
  
  // Ensure we're using Indian timezone for day calculation
  const dayName = date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    timeZone: 'Asia/Kolkata' 
  });
  console.log(`Date: ${dateString}, Parsed Date: ${date.toISOString()}, Day: ${dayName}`);
  return dayName;
};

// Helper function to process daily prices from API response
const processDailyPrices = (apiData, days = 7) => {
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    return generateMockDailyPrices(days);
  }

  // Sort data by date_time (oldest first for proper chronological order)
  const sortedData = apiData.sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
  
  // Group by date and calculate daily averages
  const dailyGroups = {};
  
  sortedData.forEach(item => {
    // Parse the date_time and convert to local date string
    const itemDate = new Date(item.date_time);
    // Use Indian timezone to get the correct date
    const date = itemDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD format
    
    console.log(`Processing item: ${item.date_time} -> ${date}`);
    
    if (!dailyGroups[date]) {
      dailyGroups[date] = {
        prices: [],
        min_amounts: [],
        max_amounts: []
      };
    }
    dailyGroups[date].prices.push(item.avg_amount);
    dailyGroups[date].min_amounts.push(item.min_amount);
    dailyGroups[date].max_amounts.push(item.max_amount);
  });

  // Create a 7-day array with available data
  const today = new Date();
  const sevenDaysData = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    
    if (dailyGroups[dateString]) {
      // We have data for this date
      const group = dailyGroups[dateString];
      const avgPrice = group.prices.reduce((sum, price) => sum + price, 0) / group.prices.length;
      const minPrice = Math.min(...group.min_amounts);
      const maxPrice = Math.max(...group.max_amounts);
      
      sevenDaysData.push({
        date: dateString,
        day: getDayName(dateString),
        price: Math.round(avgPrice * 100) / 100,
        avg_amount: Math.round(avgPrice * 100) / 100,
        min_amount: Math.round(minPrice * 100) / 100,
        max_amount: Math.round(maxPrice * 100) / 100,
        hasData: true
      });
    } else {
      // No data for this date
      sevenDaysData.push({
        date: dateString,
        day: getDayName(dateString),
        price: null,
        avg_amount: null,
        min_amount: null,
        max_amount: null,
        hasData: false
      });
    }
  }

  console.log('Processed 7-day data:', sevenDaysData);

  // Return the 7-day data structure
  return sevenDaysData;
};

// Helper function to process daily prices by date range
const processDailyPricesByDateRange = (apiData, startDate, endDate) => {
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    return generateMockDailyPrices(7);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Filter data by date range
  const filteredData = apiData.filter(item => {
    const itemDate = new Date(item.date_time);
    return itemDate >= start && itemDate <= end;
  });

  return processDailyPrices(filteredData, 7);
};

// Helper function to generate mock daily prices
const generateMockDailyPrices = (days) => {
  const mockPrices = [];
  const basePrice = 2500;
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // Generate realistic price variations
    const variation = (Math.random() - 0.5) * 200; // ±100 variation
    const price = Math.round(basePrice + variation);
    
    mockPrices.push({
      date: dateString,
      day: getDayName(dateString),
      price: price,
      avg_amount: price,
      min_amount: price - Math.round(Math.random() * 50),
      max_amount: price + Math.round(Math.random() * 50)
    });
  }
  
  return mockPrices;
};

// Location API functions (using PostalPincode.in - Indian pincode API)
export const locationAPI = {
  // Get location name from pincode using PostalPincode.in API
  getLocationFromPincode: async (pincode) => {
    try {
      console.log('Fetching location for pincode:', pincode);
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      console.log('PostalPincode API response:', response.data);
      
      if (response.data && response.data[0]?.Status === 'Success' && response.data[0]?.PostOffice?.length > 0) {
        const postOffice = response.data[0].PostOffice[0];
        const locationData = {
          name: `${postOffice.Name}, ${postOffice.District}, ${postOffice.State}, India`,
          city: postOffice.Name || 'Unknown',
          district: postOffice.District || 'Unknown',
          state: postOffice.State || 'Unknown',
          country: 'India',
          pincode: pincode
        };
        console.log('Location data found:', locationData);
        return locationData;
      }
      console.log('No location data found for pincode:', pincode);
      return null;
    } catch (error) {
      console.error('Error fetching location from pincode:', error);
      return null;
    }
  },

  // Mock location data for development (comprehensive Kerala and other states)
  getMockLocation: async (pincode) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockLocations = {
      // Kerala pincodes
      '682001': { name: 'Kochi, Ernakulam, Kerala, India', city: 'Kochi', district: 'Ernakulam', state: 'Kerala', country: 'India' },
      '695001': { name: 'Thiruvananthapuram, Thiruvananthapuram, Kerala, India', city: 'Thiruvananthapuram', district: 'Thiruvananthapuram', state: 'Kerala', country: 'India' },
      '673001': { name: 'Kozhikode, Kozhikode, Kerala, India', city: 'Kozhikode', district: 'Kozhikode', state: 'Kerala', country: 'India' },
      '680001': { name: 'Thrissur, Thrissur, Kerala, India', city: 'Thrissur', district: 'Thrissur', state: 'Kerala', country: 'India' },
      '686001': { name: 'Kottayam, Kottayam, Kerala, India', city: 'Kottayam', district: 'Kottayam', state: 'Kerala', country: 'India' },
      '689001': { name: 'Alappuzha, Alappuzha, Kerala, India', city: 'Alappuzha', district: 'Alappuzha', state: 'Kerala', country: 'India' },
      '670001': { name: 'Kannur, Kannur, Kerala, India', city: 'Kannur', district: 'Kannur', state: 'Kerala', country: 'India' },
      '676001': { name: 'Malappuram, Malappuram, Kerala, India', city: 'Malappuram', district: 'Malappuram', state: 'Kerala', country: 'India' },
      '691001': { name: 'Pathanamthitta, Pathanamthitta, Kerala, India', city: 'Pathanamthitta', district: 'Pathanamthitta', state: 'Kerala', country: 'India' },
      '685001': { name: 'Idukki, Idukki, Kerala, India', city: 'Idukki', district: 'Idukki', state: 'Kerala', country: 'India' },
      '690001': { name: 'Kollam, Kollam, Kerala, India', city: 'Kollam', district: 'Kollam', state: 'Kerala', country: 'India' },
      '671001': { name: 'Kasargod, Kasargod, Kerala, India', city: 'Kasargod', district: 'Kasargod', state: 'Kerala', country: 'India' },
      '683001': { name: 'Palakkad, Palakkad, Kerala, India', city: 'Palakkad', district: 'Palakkad', state: 'Kerala', country: 'India' },
      '674001': { name: 'Wayanad, Wayanad, Kerala, India', city: 'Wayanad', district: 'Wayanad', state: 'Kerala', country: 'India' },
      
      // Other major cities
      '560001': { name: 'Bangalore, Bangalore Urban, Karnataka, India', city: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka', country: 'India' },
      '400001': { name: 'Mumbai, Mumbai, Maharashtra, India', city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', country: 'India' },
      '110001': { name: 'New Delhi, New Delhi, Delhi, India', city: 'New Delhi', district: 'New Delhi', state: 'Delhi', country: 'India' },
      '600001': { name: 'Chennai, Chennai, Tamil Nadu, India', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '700001': { name: 'Kolkata, Kolkata, West Bengal, India', city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', country: 'India' },
      '380001': { name: 'Ahmedabad, Ahmedabad, Gujarat, India', city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', country: 'India' },
      '500001': { name: 'Hyderabad, Hyderabad, Telangana, India', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', country: 'India' },
      '800001': { name: 'Patna, Patna, Bihar, India', city: 'Patna', district: 'Patna', state: 'Bihar', country: 'India' },
      '302001': { name: 'Jaipur, Jaipur, Rajasthan, India', city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', country: 'India' },
      '411001': { name: 'Pune, Pune, Maharashtra, India', city: 'Pune', district: 'Pune', state: 'Maharashtra', country: 'India' }
    };
    
    return mockLocations[pincode] || { 
      name: `Location ${pincode}`, 
      city: 'Unknown', 
      district: 'Unknown',
      state: 'Unknown', 
      country: 'India' 
    };
  }
};

// Weather API functions
export const weatherAPI = {
  // Get current weather by pincode (using OpenWeatherMap API)
  getCurrentWeather: async (pincode, countryCode = 'IN') => {
    // First get coordinates from pincode using geocoding
    const geoResponse = await weatherApi.get('/weather', {
      params: {
        zip: `${pincode},${countryCode}`,
        appid: 'YOUR_OPENWEATHER_API_KEY', // Replace with actual API key
        units: 'metric'
      }
    });
    return geoResponse.data;
  },

  // Get weather forecast by pincode
  getWeatherForecast: async (pincode, countryCode = 'IN') => {
    const response = await weatherApi.get('/forecast', {
      params: {
        zip: `${pincode},${countryCode}`,
        appid: 'YOUR_OPENWEATHER_API_KEY', // Replace with actual API key
        units: 'metric'
      }
    });
    return response.data;
  },

  // Get weather by coordinates (alternative method)
  getWeatherByCoords: async (lat, lon) => {
    const response = await weatherApi.get('/weather', {
      params: {
        lat: lat,
        lon: lon,
        appid: 'YOUR_OPENWEATHER_API_KEY', // Replace with actual API key
        units: 'metric'
      }
    });
    return response.data;
  },

  // Mock weather data for development (when API key is not available)
  getMockWeather: async (pincode) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockWeatherData = {
      name: `Location ${pincode}`,
      main: {
        temp: Math.round(25 + Math.random() * 10), // 25-35°C
        feels_like: Math.round(25 + Math.random() * 10),
        humidity: Math.round(60 + Math.random() * 30), // 60-90%
        pressure: Math.round(1000 + Math.random() * 50), // 1000-1050 hPa
      },
      weather: [
        {
          main: ['Clear', 'Clouds', 'Rain', 'Thunderstorm'][Math.floor(Math.random() * 4)],
          description: ['clear sky', 'few clouds', 'scattered clouds', 'broken clouds', 'shower rain', 'rain', 'thunderstorm'][Math.floor(Math.random() * 7)],
          icon: ['01d', '02d', '03d', '04d', '09d', '10d', '11d'][Math.floor(Math.random() * 7)]
        }
      ],
      wind: {
        speed: Math.round(Math.random() * 10), // 0-10 m/s
        deg: Math.round(Math.random() * 360) // 0-360 degrees
      },
      visibility: Math.round(8000 + Math.random() * 2000), // 8-10 km
      sys: {
        sunrise: new Date().getTime() / 1000 + Math.random() * 3600,
        sunset: new Date().getTime() / 1000 + Math.random() * 3600 + 43200
      }
    };
    
    return mockWeatherData;
  }
};

// Inventory API functions
export const inventoryAPI = {
  // Add inventory item
  addInventory: async (inventoryData) => {
    const formData = new FormData();
    formData.append('userid', inventoryData.userid);
    formData.append('spiceName', inventoryData.spiceName);
    formData.append('weight', inventoryData.weight);
    formData.append('grade', inventoryData.grade);
    formData.append('status', inventoryData.status || 'available');
    if (inventoryData.spiceImage) {
      formData.append('spiceImage', inventoryData.spiceImage);
    }

    const response = await inventoryApi.post('/api/inventory', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get inventory by user ID
  getInventoryByUser: async (userId) => {
    const response = await inventoryApi.get(`/api/inventory/user/${userId}`);
    return response.data;
  },

  // Get single inventory item
  getInventoryItem: async (itemId) => {
    const response = await inventoryApi.get(`/api/inventory/${itemId}`);
    return response.data;
  },

  // Update inventory item (full update with image)
  updateInventoryItem: async (itemId, inventoryData) => {
    const formData = new FormData();
    formData.append('spiceName', inventoryData.spiceName);
    formData.append('weight', inventoryData.weight);
    formData.append('grade', inventoryData.grade);
    formData.append('status', inventoryData.status || 'available');
    if (inventoryData.spiceImage) {
      formData.append('spiceImage', inventoryData.spiceImage);
    }

    const response = await inventoryApi.put(`/api/inventory/${itemId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update specific fields only (PATCH)
  updateInventoryStatus: async (itemId, status) => {
    const response = await inventoryApi.patch(`/api/inventory/${itemId}/status`, {
      status: status
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // Delete inventory item
  deleteInventoryItem: async (itemId) => {
    const response = await inventoryApi.delete(`/api/inventory/${itemId}`);
    return response.data;
  },

  // Get all inventory (admin)
  getAllInventory: async () => {
    const response = await inventoryApi.get('/api/inventory');
    return response.data;
  }
};

// Create separate axios instance for Auction API
const auctionApi = axios.create({
  baseURL: 'http://localhost:3002',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
auctionApi.interceptors.request.use(
  (config) => {
    console.log('Auction API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
auctionApi.interceptors.response.use(
  (response) => {
    console.log('Auction API Response:', response.data);
    return response;
  },
  (error) => {
    console.error('Auction API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Auction API functions
export const auctionAPI = {
  // Get all auctions
  getAllAuctions: async () => {
    const response = await auctionApi.get('/api/auctions');
    return response.data;
  },

  // Get upcoming auctions
  getUpcomingAuctions: async () => {
    const response = await auctionApi.get('/api/auctions');
    return response.data;
  },

  // Update auction status
  updateAuctionStatus: async (auctionId, status) => {
    const response = await auctionApi.put(`/api/auctions/${auctionId}/update`, { status });
    return response.data;
  },

  // Join auction
  joinAuction: async (farmerId, inventoryId, auctionId) => {
    const response = await auctionApi.post('/api/join-auctions/create', {
      farmerId,
      inventoryId,
      auctionId
    });
    return response.data;
  },

  // Get join auction details by auction ID
  getJoinAuctionsByAuctionId: async (auctionId) => {
    const response = await auctionApi.get(`/api/join-auctions/auction/${auctionId}`);
    return response.data;
  },

  // Get bids for a specific inventory
  getBidsByInventoryId: async (inventoryId) => {
    const response = await auctionApi.get(`/api/bids/inventory/${inventoryId}`);
    return response.data;
  },

  // Place a new bid
  createBid: async (bidData) => {
    const response = await auctionApi.post('/api/bids/create', bidData);
    return response.data;
  },

  // Get bids by buyer ID
  getBidsByBuyerId: async (buyerId) => {
    const response = await auctionApi.get(`/api/bids/buyer/${buyerId}`);
    return response.data;
  },

  // Create payment
  createPayment: async (paymentData) => {
    const response = await auctionApi.post('/api/payments/create', paymentData);
    return response.data;
  },

  // Get all payments
  getAllPayments: async () => {
    const response = await auctionApi.get('/api/payments/');
    return response.data;
  },

  // Get payments by farmer ID
  getPaymentsByFarmerId: async (farmerId) => {
    const response = await auctionApi.get(`/api/payments/farmer/${farmerId}`);
    return response.data;
  },

  // Get payments by auction ID
  getPaymentsByAuctionId: async (auctionId) => {
    const response = await auctionApi.get(`/api/payments/auction/${auctionId}`);
    return response.data;
  },

  // Get payments by inventory ID
  getPaymentsByInventoryId: async (inventoryId) => {
    const response = await auctionApi.get(`/api/payments/inventory/${inventoryId}`);
    return response.data;
  },

  // Get payments by buyer ID
  getPaymentsByBuyerId: async (buyerId) => {
    const response = await auctionApi.get(`/api/payments/buyer/${buyerId}`);
    return response.data;
  },
};

// PAN Verification API functions (using main API on port 3000)
export const panAPI = {
  // Send OTP for PAN verification
  sendOTP: async (panData) => {
    console.log('PAN API Send OTP:', api.defaults.baseURL + '/api/verification/pan/send-otp');
    console.log('Send OTP payload:', panData);
    try {
      const response = await api.post('/api/verification/pan/send-otp', panData);
      console.log('Send OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Send OTP API error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  // Verify OTP for PAN
  verifyOTP: async (otpData) => {
    console.log('PAN API Verify OTP:', api.defaults.baseURL + '/api/verification/pan/verify-otp');
    console.log('Verify OTP payload:', otpData);
    try {
      const response = await api.post('/api/verification/pan/verify-otp', otpData);
      console.log('Verify OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Verify OTP API error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },
};

// Platform Statistics API
export const statsAPI = {
  // Get platform statistics by aggregating data from existing APIs
  getPlatformStats: async () => {
    try {
      // Fetch data from all existing endpoints in parallel
      const [
        farmersResponse,
        buyersResponse,
        inventoryResponse,
        auctionsResponse,
        paymentsResponse,
        latestPriceResponse
      ] = await Promise.allSettled([
        authAPI.getAllFarmers(),
        authAPI.getAllBuyers(),
        inventoryAPI.getAllInventory(),
        auctionAPI.getAllAuctions(),
        auctionAPI.getAllPayments(),
        spicePricesAPI.getLatestCardamomPrice()
      ]);

      // Extract data or use empty arrays as fallback
      const farmers = farmersResponse.status === 'fulfilled' ? farmersResponse.value : [];
      const buyers = buyersResponse.status === 'fulfilled' ? buyersResponse.value : [];
      const inventory = inventoryResponse.status === 'fulfilled' ? inventoryResponse.value : [];
      const auctions = auctionsResponse.status === 'fulfilled' ? auctionsResponse.value : [];
      const payments = paymentsResponse.status === 'fulfilled' ? paymentsResponse.value : [];
      const latestPrice = latestPriceResponse.status === 'fulfilled' ? latestPriceResponse.value : null;

      // Calculate Active Users
      const activeUsers = (Array.isArray(farmers) ? farmers.length : 0) + 
                         (Array.isArray(buyers) ? buyers.length : 0);

      // Calculate Trading Volume (sum of all payment amounts)
      const tradingVolume = Array.isArray(payments) 
        ? payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0)
        : 0;

      // Calculate Monthly Volume (payments from last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyVolume = Array.isArray(payments)
        ? payments
            .filter(p => new Date(p.created_at || p.createdAt) >= thirtyDaysAgo)
            .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0)
        : 0;

      // Calculate Success Rate (completed auctions / total auctions)
      const completedAuctions = Array.isArray(auctions)
        ? auctions.filter(a => a.status === 'completed').length
        : 0;
      const totalAuctions = Array.isArray(auctions) ? auctions.length : 0;
      const successRate = totalAuctions > 0 
        ? (completedAuctions / totalAuctions) * 100 
        : 95.3;

      // Calculate Active Listings
      const activeListings = Array.isArray(inventory)
        ? inventory.filter(item => item.status === 'available').length
        : 0;

      // Find Top Auction
      let topAuction = { amount: 0, winner: 'N/A' };
      if (Array.isArray(payments) && payments.length > 0) {
        const topPayment = payments.reduce((max, p) => 
          (parseFloat(p.amount) || 0) > (parseFloat(max.amount) || 0) ? p : max
        , payments[0]);
        
        topAuction = {
          amount: parseFloat(topPayment.amount) || 0,
          winner: topPayment.buyerName || topPayment.buyer_name || 'Anonymous'
        };
      }

      // Find Top Farmer (farmer with most inventory items)
      let topFarmer = { name: 'N/A', volume: 0 };
      if (Array.isArray(inventory) && inventory.length > 0 && Array.isArray(farmers)) {
        const farmerInventory = {};
        inventory.forEach(item => {
          const farmerId = item.userid || item.userId || item.farmer_id;
          if (farmerId) {
            if (!farmerInventory[farmerId]) {
              farmerInventory[farmerId] = { count: 0, weight: 0 };
            }
            farmerInventory[farmerId].count++;
            farmerInventory[farmerId].weight += parseFloat(item.weight) || 0;
          }
        });

        let maxFarmerId = null;
        let maxWeight = 0;
        for (const [farmerId, data] of Object.entries(farmerInventory)) {
          if (data.weight > maxWeight) {
            maxWeight = data.weight;
            maxFarmerId = farmerId;
          }
        }

        if (maxFarmerId) {
          const farmer = farmers.find(f => f.id === parseInt(maxFarmerId));
          topFarmer = {
            name: farmer ? `${farmer.firstname} ${farmer.lastname?.charAt(0)}.` : 'Top Farmer',
            volume: Math.round(maxWeight)
          };
        }
      }

      // Get Daily Spice Price
      let dailySpicePrice = { current: 1780, change: 45, changePercent: 2.1 };
      if (latestPrice && latestPrice.avg_amount) {
        dailySpicePrice.current = Math.round(latestPrice.avg_amount);
        // Calculate change if previous data exists
        if (latestPrice.previous_avg) {
          dailySpicePrice.change = Math.round(latestPrice.avg_amount - latestPrice.previous_avg);
          dailySpicePrice.changePercent = ((latestPrice.avg_amount - latestPrice.previous_avg) / latestPrice.previous_avg * 100).toFixed(1);
        }
      }

      return {
        activeUsers: activeUsers || 0,
        tradingVolume: tradingVolume || 0,
        successRate: parseFloat(successRate.toFixed(1)) || 95.3,
        activeListings: activeListings || 0,
        monthlyVolume: monthlyVolume || 0,
        topAuction,
        topFarmer,
        dailySpicePrice
      };

    } catch (error) {
      console.error('Error aggregating platform stats:', error);
      // Return minimal fallback data
      return {
        activeUsers: 0,
        tradingVolume: 0,
        successRate: 0,
        activeListings: 0,
        monthlyVolume: 0,
        topAuction: { amount: 0, winner: 'N/A' },
        topFarmer: { name: 'N/A', volume: 0 },
        dailySpicePrice: { current: 0, change: 0, changePercent: 0 }
      };
    }
  }
};

export default api; 