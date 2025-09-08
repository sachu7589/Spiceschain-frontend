import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import InventoryManagement from './InventoryManagement';
import { spicePricesAPI, weatherAPI, locationAPI } from '../services/api';

const FarmerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');

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

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

  const renderDashboardContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <FarmerDashboardOverview user={user} navigate={navigate} />;
      case 'inventory':
        return <InventoryManagement user={user} />;
      default:
        return <FarmerDashboardOverview user={user} navigate={navigate} />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid', active: true },
    { id: 'inventory', label: 'Inventory', icon: 'inventory', active: false },
  ];

  const getIcon = (iconName) => {
    const icons = {
      grid: (
        <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      inventory: (
        <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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
              onClick={() => item.action ? item.action() : handleMenuClick(item.id)}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-4'} ${sidebarCollapsed ? 'px-2 py-3' : 'px-4 py-3'} rounded-xl transition-all duration-200 group ${
                activeMenu === item.id
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                  : 'text-gray-600 hover:bg-white/80 hover:text-gray-900 hover:shadow-md'
              }`}
            >
              <span className={`flex-shrink-0 ${sidebarCollapsed ? 'p-2' : 'p-2'} rounded-lg transition-all duration-200 ${
                activeMenu === item.id
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
                {activeMenu === 'dashboard' ? 'Dashboard' : activeMenu}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, <span className="font-semibold text-gray-900">{user.fullName || user.name}</span>! 👋
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
          {renderDashboardContent()}
        </main>
      </div>
    </div>
  );
};

// Weather Component
const WeatherWidget = ({ user }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get pincode from user profile data
  const pincode = user?.pincode || user?.address?.pincode || user?.location?.pincode;
  
  // Debug: Log pincode for troubleshooting
  console.log('WeatherWidget - User object:', user);
  console.log('WeatherWidget - Pincode:', pincode);

  const fetchLocation = async (pin) => {
    if (!pin || pin.length !== 6) return;
    
    setLocationLoading(true);
    
    try {
      // Try real API first, fallback to mock data
      const data = await locationAPI.getLocationFromPincode(pin);
      if (data) {
        setLocationData(data);
      } else {
        // Fallback to mock data
        const mockData = await locationAPI.getMockLocation(pin);
        setLocationData(mockData);
      }
    } catch (err) {
      console.error('Error fetching location:', err);
      // Fallback to mock data on error
      try {
        const mockData = await locationAPI.getMockLocation(pin);
        setLocationData(mockData);
      } catch (mockErr) {
        console.error('Error fetching mock location:', mockErr);
      }
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchWeather = async (pin) => {
    if (!pin || pin.length !== 6) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Using mock data for development (replace with real API call)
      const data = await weatherAPI.getMockWeather(pin);
      setWeatherData(data);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch location and weather when component mounts or pincode changes
  useEffect(() => {
    if (pincode) {
      fetchLocation(pincode);
      fetchWeather(pincode);
    }
  }, [pincode]);

  const getWeatherIcon = (weatherMain) => {
    const icons = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️'
    };
    return icons[weatherMain] || '🌤️';
  };

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">🌤️</span>
          Weather Updates
        </h3>
        <div className="flex items-center space-x-2">
          {pincode ? (
            <div className="text-sm text-gray-600">
              {locationData ? (
                <div>
                  <span className="font-medium">📍</span> {locationData.city}, {locationData.district || locationData.state}
                  <div className="text-xs text-gray-500 mt-1">Pincode: {pincode}</div>
                </div>
              ) : locationLoading ? (
                <div className="flex items-center space-x-2">
                  <span className="animate-spin">⟳</span>
                  <span>Loading location...</span>
                </div>
              ) : (
                <div>
                  <span className="font-medium">Pincode:</span> {pincode}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
              ⚠️ No pincode in profile
            </div>
          )}
          {loading && (
            <div className="text-sm text-blue-600">
              <span className="animate-spin">⟳</span> Loading weather...
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {weatherData ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Main Weather Info */}
          <div className="md:col-span-2 bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-2xl font-bold text-gray-900">
                  {weatherData.main.temp}°C
                </h4>
                <p className="text-gray-600 text-sm">
                  Feels like {weatherData.main.feels_like}°C
                </p>
                <p className="text-gray-500 text-sm capitalize">
                  {weatherData.weather[0].description}
                </p>
                <p className="text-gray-500 text-sm">
                  {locationData ? `${locationData.city}, ${locationData.district || locationData.state}` : weatherData.name}
                </p>
              </div>
              <div className="text-6xl">
                {getWeatherIcon(weatherData.weather[0].main)}
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h5 className="font-semibold text-gray-900 mb-3">Details</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Humidity</span>
                <span className="font-medium">{weatherData.main.humidity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pressure</span>
                <span className="font-medium">{weatherData.main.pressure} hPa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Visibility</span>
                <span className="font-medium">{Math.round(weatherData.visibility / 1000)} km</span>
              </div>
            </div>
          </div>

          {/* Wind Info */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h5 className="font-semibold text-gray-900 mb-3">Wind</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Speed</span>
                <span className="font-medium">{weatherData.wind.speed} m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Direction</span>
                <span className="font-medium">{getWindDirection(weatherData.wind.deg)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sunrise</span>
                <span className="font-medium">
                  {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('en-IN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🌤️</div>
          <p>
            {pincode 
              ? 'Loading weather data...' 
              : 'Add pincode to your profile to get weather updates'
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Farmer Dashboard Content Components
const FarmerDashboardOverview = ({ user, navigate }) => {
  const isVerified = user?.isVerified || false;
  const [cardamomData, setCardamomData] = useState(null);
  const [latestPrice, setLatestPrice] = useState(null);
  const [dailyPrices, setDailyPrices] = useState([]);

  // Fetch cardamom data from API
  useEffect(() => {
    const fetchCardamomData = async () => {
      try {
        console.log('Fetching cardamom data...');
        const [allData, latestData, statsData, dailyData] = await Promise.all([
          spicePricesAPI.getAllCardamomData(),
          spicePricesAPI.getLatestCardamomPrice(),
          spicePricesAPI.getStatistics(),
          spicePricesAPI.getDailyCardamomPrices(6)
        ]);
        
        console.log('Raw API responses:');
        console.log('All data:', allData);
        console.log('Latest price:', latestData);
        console.log('Stats:', statsData);
        console.log('Processed daily prices:', dailyData);
        
        setCardamomData(allData);
        setLatestPrice(latestData);
        setDailyPrices(dailyData || []);
        
        // Log the processed daily prices for debugging
        if (dailyData && dailyData.length > 0) {
          console.log('Daily prices for chart:', dailyData.map(d => ({
            day: d.day,
            price: d.price,
            date: d.date
          })));
        }
      } catch (err) {
        console.error('Error fetching cardamom data:', err);
        // Fallback to mock data
        setLatestPrice({ avg_amount: 2583.275, min_amount: 2565.8, max_amount: 2600.75 });
        // Generate mock daily prices as fallback
        const mockDailyPrices = [
          { day: 'Mon', price: 2400, avg_amount: 2400 },
          { day: 'Tue', price: 2450, avg_amount: 2450 },
          { day: 'Wed', price: 2480, avg_amount: 2480 },
          { day: 'Thu', price: 2500, avg_amount: 2500 },
          { day: 'Fri', price: 2475, avg_amount: 2475 },
          { day: 'Sat', price: 2490, avg_amount: 2490 },
          { day: 'Sun', price: 2450, avg_amount: 2450 },
        ];
        setDailyPrices(mockDailyPrices);
        console.log('Using fallback mock data:', mockDailyPrices);
      }
    };

    fetchCardamomData();
  }, []);

  const ongoingAuctions = [
    { id: 'A001', spice: 'Cardamom (Green)', quantity: '50kg', currentBid: '₹3,200', timeLeft: '2h 15m', bidders: 8 },
    { id: 'A002', spice: 'Black Pepper', quantity: '100kg', currentBid: '₹450', timeLeft: '4h 30m', bidders: 12 },
    { id: 'A003', spice: 'Cinnamon', quantity: '75kg', currentBid: '₹280', timeLeft: '1h 45m', bidders: 5 },
  ];

  const notifications = [
    { id: 1, type: 'auction', title: 'Auction A001 ending soon', message: 'Your cardamom auction has 2 hours left', time: '2m ago', unread: true },
    { id: 2, type: 'payment', title: 'Payment received', message: '₹15,600 received for Black Pepper sale', time: '1h ago', unread: true },
    { id: 3, type: 'auction', title: 'New bid on your auction', message: 'A002 received a bid of ₹450/kg', time: '3h ago', unread: false },
    { id: 4, type: 'weather', title: 'Weather alert', message: 'Heavy rain expected in your area', time: '5h ago', unread: false },
  ];


  return (
    <div className="space-y-8">
      {/* Weather Updates */}
      <WeatherWidget user={user} />

      {/* Cardamom Price Overview - Kerala Only */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Today's Cardamom Price - Kerala</h3>
          <span className="text-sm text-gray-500">Updated 2 minutes ago</span>
        </div>
        

        {/* Cardamom Statistics */}
        {cardamomData && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Cardamom Market Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Average Price</p>
                    <p className="text-2xl font-bold text-green-800">
                      ₹{cardamomData.avg_amount || latestPrice?.avg_amount || '2,583.275'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Price Range</p>
                    <p className="text-lg font-bold text-blue-800">
                      ₹{cardamomData.min_amount || latestPrice?.min_amount || '2,565.8'} - ₹{cardamomData.max_amount || latestPrice?.max_amount || '2,600.75'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modern SAAS-style Line Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Chart Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Cardamom Price Trend</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {dailyPrices.length > 0 
                    ? `Last ${dailyPrices.length} day${dailyPrices.length !== 1 ? 's' : ''} performance`
                    : 'Last 6 days performance'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Price (₹)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-0.5 bg-red-500" style={{borderTop: '2px dashed #ef4444'}}></div>
                  <span className="text-sm text-gray-600">Average</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Current</div>
                  <div className="text-lg font-semibold text-gray-900">
                    ₹{dailyPrices.length > 0 ? dailyPrices[dailyPrices.length - 1]?.price || dailyPrices[dailyPrices.length - 1]?.avg_amount || '2,500' : '2,500'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="p-6">
            {dailyPrices.length > 0 ? (
              <div className="h-80 relative pb-8">
                {/* Custom Line Chart */}
                <div className="w-full h-full relative">
                  {/* Calculate price range for dynamic scaling */}
                  {(() => {
                    const prices = dailyPrices.map(d => d.price || d.avg_amount || 0);
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    const priceRange = maxPrice - minPrice;
                    const padding = priceRange * 0.1; // 10% padding
                    const chartMin = minPrice - padding;
                    const chartMax = maxPrice + padding;
                    const chartRange = chartMax - chartMin;
                    
                    // Calculate average price for the line
                    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

                    return (
                      <>
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between">
                          {[0, 1, 2, 3, 4].map((_, i) => (
                            <div key={i} className="h-px bg-gray-100"></div>
                          ))}
                        </div>
                        
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                          <span>₹{Math.round(chartMax).toLocaleString()}</span>
                          <span>₹{Math.round(chartMin + chartRange * 0.75).toLocaleString()}</span>
                          <span>₹{Math.round(chartMin + chartRange * 0.5).toLocaleString()}</span>
                          <span>₹{Math.round(chartMin + chartRange * 0.25).toLocaleString()}</span>
                          <span>₹{Math.round(chartMin).toLocaleString()}</span>
                        </div>

                        {/* Chart Area */}
                        <div className="ml-12 mr-4 h-full relative">
                          {/* Area under the curve */}
                          <div className="absolute inset-0">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1"/>
                                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02"/>
                                </linearGradient>
                              </defs>
                              <path
                                d={`M 0,${100 - ((prices[0] - chartMin) / chartRange) * 100} ${dailyPrices.map((data, index) => {
                                  const x = dailyPrices.length > 1 ? (index / (dailyPrices.length - 1)) * 100 : 50;
                                  const y = 100 - ((prices[index] - chartMin) / chartRange) * 100;
                                  return `L ${x},${y}`;
                                }).join(' ')} L 100,100 L 0,100 Z`}
                                fill="url(#areaGradient)"
                              />
                            </svg>
                          </div>

                          {/* Average Price Line */}
                          <div className="absolute inset-0">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <line
                                x1="0"
                                y1={100 - ((averagePrice - chartMin) / chartRange) * 100}
                                x2="100"
                                y2={100 - ((averagePrice - chartMin) / chartRange) * 100}
                                stroke="#ef4444"
                                strokeWidth="0.3"
                                strokeDasharray="2,2"
                                opacity="0.8"
                              />
                            </svg>
                          </div>

                          {/* Main Price Line */}
                          <div className="absolute inset-0">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <path
                                d={`M 0,${100 - ((prices[0] - chartMin) / chartRange) * 100} ${dailyPrices.map((data, index) => {
                                  const x = dailyPrices.length > 1 ? (index / (dailyPrices.length - 1)) * 100 : 50;
                                  const y = 100 - ((prices[index] - chartMin) / chartRange) * 100;
                                  return `L ${x},${y}`;
                                }).join(' ')}`}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="0.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>

                          {/* Data Points */}
                          {dailyPrices.map((data, index) => {
                            const x = dailyPrices.length > 1 ? (index / (dailyPrices.length - 1)) * 100 : 50;
                            const y = 100 - ((prices[index] - chartMin) / chartRange) * 100;
                            
                            return (
                              <div key={index} className="absolute group">
                                {/* Hover area */}
                                <div 
                                  className="absolute w-8 h-8 -ml-4 -mt-4 cursor-pointer"
                                  style={{ left: `${x}%`, top: `${y}%` }}
                                >
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                    <div className="font-semibold">{data.day}</div>
                                    <div className="text-gray-300">
                                      {new Date(data.date).toLocaleDateString('en-IN', { 
                                        day: '2-digit', 
                                        month: 'short', 
                                        year: 'numeric' 
                                      })}
                                    </div>
                                    <div>₹{(data.price || data.avg_amount || 0).toLocaleString()}</div>
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                                  </div>
                                </div>
                                
                                {/* Data point */}
                                <div 
                                  className="absolute w-2 h-2 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-200"
                                  style={{ left: `${x}%`, top: `${y}%` }}
                                ></div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Day and Date labels below the chart */}
                        <div className="absolute -bottom-8 left-12 right-4 flex justify-between text-xs">
                          {dailyPrices.map((data, index) => (
                            <div key={index} className="text-center">
                              <div className="font-medium text-gray-500 mb-1">{data.day}</div>
                              <div className="text-xs text-gray-400">
                                {new Date(data.date).toLocaleDateString('en-IN', { 
                                  day: '2-digit', 
                                  month: 'short' 
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p>Loading chart data...</p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Blurred Sections Container with Verify Button Overlay */}
      <div className="relative">
        {/* Main Content Grid - Blurred if not verified */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${!isVerified ? 'blur-sm pointer-events-none' : ''}`}>
          {/* Ongoing Auctions Summary */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Ongoing Auctions Summary</h3>
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {ongoingAuctions.map((auction) => (
                <div key={auction.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-semibold text-gray-900">{auction.spice}</span>
                        <span className="text-sm text-gray-600">({auction.quantity})</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Current: <span className="font-semibold text-gray-900">{auction.currentBid}/kg</span></span>
                        <span>•</span>
                        <span>{auction.bidders} bidders</span>
                        <span>•</span>
                        <span className="text-orange-600 font-medium">{auction.timeLeft} left</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">Auction ID</span>
                      <p className="text-sm font-mono text-gray-700">{auction.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Notifications</h3>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {notifications.filter(n => n.unread).length} new
              </span>
            </div>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-3 rounded-lg border ${
                  notification.unread 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'auction' ? 'bg-orange-500' :
                      notification.type === 'payment' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links - Blurred if not verified */}
        <div className={`mt-8 ${!isVerified ? 'blur-sm pointer-events-none' : ''}`}>
          {/* Quick Links */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Links</h3>
            <div className="space-y-4">
              <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white p-4 rounded-xl flex items-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-semibold">Add Inventory</span>
              </button>
              <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-xl flex items-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Start Auction</span>
              </button>
              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white p-4 rounded-xl flex items-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-semibold">View Analytics</span>
              </button>
            </div>
          </div>
        </div>

        {/* Verify Button Overlay - Centered in middle of blurred sections */}
        {!isVerified && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/30 pointer-events-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Account Verification Required</h3>
                <p className="text-gray-600 mb-6">Please verify your account to access all dashboard features</p>
                <button 
                  onClick={() => navigate('/farmer/verification')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  <span>Verify Account</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;

