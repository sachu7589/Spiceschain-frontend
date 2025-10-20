import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import InventoryManagement from './InventoryManagement';
import { spicePricesAPI, weatherAPI, locationAPI, auctionAPI, inventoryAPI } from '../services/api';
import Swal from 'sweetalert2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FarmerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showVerificationModal, setShowVerificationModal] = useState(false);

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
    // Check if user is verified for restricted menus
    if ((menu === 'inventory' || menu === 'auction') && !user?.isVerified) {
      setShowVerificationModal(true);
      return;
    }
    setActiveMenu(menu);
  };

  const renderDashboardContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <FarmerDashboardOverview user={user} navigate={navigate} onMenuChange={setActiveMenu} />;
      case 'inventory':
        return <InventoryManagement user={user} />;
      case 'auction':
        return <AuctionList />;
      default:
        return <FarmerDashboardOverview user={user} navigate={navigate} onMenuChange={setActiveMenu} />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid', active: true },
    { id: 'inventory', label: 'Inventory', icon: 'inventory', active: false },
    { id: 'auction', label: 'Auction', icon: 'auction', active: false },
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
      auction: (
        <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
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
          {menuItems.map((item) => {
            const isRestricted = (item.id === 'inventory' || item.id === 'auction') && !user?.isVerified;
            return (
              <button
                key={item.id}
                onClick={() => item.action ? item.action() : handleMenuClick(item.id)}
                disabled={isRestricted}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-4'} ${sidebarCollapsed ? 'px-2 py-3' : 'px-4 py-3'} rounded-xl transition-all duration-200 group ${
                  isRestricted
                    ? 'opacity-50 cursor-not-allowed text-gray-400'
                    : activeMenu === item.id
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                    : 'text-gray-600 hover:bg-white/80 hover:text-gray-900 hover:shadow-md'
                }`}
              >
                <span className={`flex-shrink-0 ${sidebarCollapsed ? 'p-2' : 'p-2'} rounded-lg transition-all duration-200 ${
                  isRestricted
                    ? 'bg-gray-100 text-gray-400'
                    : activeMenu === item.id
                    ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                    : 'bg-gray-100 group-hover:bg-emerald-50 group-hover:shadow-sm'
                }`}>
                  {getIcon(item.icon)}
                </span>
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {!sidebarCollapsed && isRestricted && (
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </button>
            );
          })}
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

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border border-white/30 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Required</h3>
              <p className="text-gray-600 mb-6">
                You need to verify your account to access this feature. Please complete the verification process to continue.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowVerificationModal(false);
                    navigate('/farmer/verification');
                  }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Verify Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
const FarmerDashboardOverview = ({ user, navigate, onMenuChange }) => {
  const isVerified = user?.isVerified || false;
  const [cardamomData, setCardamomData] = useState(null);
  const [latestPrice, setLatestPrice] = useState(null);
  const [dailyPrices, setDailyPrices] = useState([]);
  const [ongoingAuctions, setOngoingAuctions] = useState([]);
  const [notifications, setNotifications] = useState([]);

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
            avg_amount: d.avg_amount,
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

  // Fetch ongoing auctions that the farmer has joined
  useEffect(() => {
    const fetchOngoingAuctions = async () => {
      try {
        const allAuctions = await auctionAPI.getUpcomingAuctions();
        const now = new Date();
        
        // Filter for active auctions
        const active = allAuctions.filter(auction => {
          const startDate = new Date(auction.startDate);
          const endDate = new Date(auction.endDate);
          return now >= startDate && now <= endDate && auction.status !== 'End Auction';
        });

        // Check which ones the user has joined
        const joinedActiveAuctions = [];
        for (const auction of active) {
          try {
            const joinData = await auctionAPI.getJoinAuctionsByAuctionId(auction._id || auction.id);
            const hasJoined = joinData.some(join => join.farmerId === user.id);
            if (hasJoined) {
              // Calculate time left
              const endDate = new Date(auction.endDate);
              const timeLeft = endDate - now;
              const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
              const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
              
              joinedActiveAuctions.push({
                id: auction._id || auction.id,
                spice: auction.spiceType,
                title: auction.auctionTitle,
                currentBid: `₹${(auction.currentBid || 0).toLocaleString()}`,
                timeLeft: timeLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : 'Ending soon',
                bidders: auction.bidders || 0,
                endDate: auction.endDate
              });
            }
          } catch (error) {
            console.error('Error checking auction join status:', error);
          }
        }

        setOngoingAuctions(joinedActiveAuctions);

        // Generate notifications based on auctions
        const newNotifications = [];
        joinedActiveAuctions.forEach((auction, index) => {
          const endDate = new Date(auction.endDate);
          const timeLeft = endDate - now;
          const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));

          if (hoursLeft <= 2) {
            newNotifications.push({
              id: `auction-${index}`,
              type: 'auction',
              title: 'Auction ending soon!',
              message: `${auction.title} ends in ${auction.timeLeft}`,
              time: 'Just now',
              unread: true
            });
          } else if (hoursLeft <= 6) {
            newNotifications.push({
              id: `auction-${index}`,
              type: 'auction',
              title: 'Auction update',
              message: `${auction.title} has ${auction.timeLeft} remaining`,
              time: 'Recent',
              unread: false
            });
          }
        });

        setNotifications(newNotifications);
      } catch (error) {
        console.error('Error fetching ongoing auctions:', error);
      }
    };

    if (user?.id) {
      fetchOngoingAuctions();
      // Refresh every minute
      const interval = setInterval(fetchOngoingAuctions, 60000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);


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

        {/* Chart.js Line Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Chart Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Cardamom Price Trend</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {dailyPrices.filter(d => d.hasData).length > 0 
                    ? `Last ${dailyPrices.filter(d => d.hasData).length} day${dailyPrices.filter(d => d.hasData).length !== 1 ? 's' : ''} performance`
                    : 'Last 7 days performance'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Current</div>
                  <div className="text-lg font-semibold text-gray-900">
                    ₹{(() => {
                      const latestData = dailyPrices.filter(d => d.hasData).pop();
                      return latestData ? (latestData.avg_amount || latestData.price || '2,500') : '2,500';
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="p-6">
            {dailyPrices.length > 0 ? (
              <div className="h-80">
                <Line
                  data={{
                    labels: dailyPrices.map(d => `${d.day} ${new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`),
                    datasets: [
                      {
                        label: 'Price (₹)',
                        data: dailyPrices.map(d => d.hasData ? (d.avg_amount || d.price || 0) : null),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        pointRadius: 6,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 8,
                        fill: true,
                        tension: 0.1,
                        spanGaps: false
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        enabled: true,
                        mode: 'point',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        callbacks: {
                          title: function(context) {
                            return context[0].label;
                          },
                          label: function(context) {
                            return `Price: ₹${context.parsed.y.toLocaleString()}`;
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        display: true,
                        title: {
                          display: false
                        },
                        grid: {
                          display: false
                        },
                        ticks: {
                          color: '#6b7280',
                          font: {
                            size: 12
                          }
                        }
                      },
                      y: {
                        display: true,
                        title: {
                          display: false
                        },
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)',
                          drawBorder: false
                        },
                        ticks: {
                          color: '#6b7280',
                          font: {
                            size: 12
                          },
                          callback: function(value) {
                            return '₹' + value.toLocaleString();
                          }
                        }
                      }
                    },
                    interaction: {
                      intersect: false,
                      mode: 'index'
                    },
                    elements: {
                      point: {
                        hoverBackgroundColor: '#3b82f6',
                        hoverBorderColor: '#ffffff',
                        hoverBorderWidth: 3
                      }
                    }
                  }}
                />
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
              <button 
                onClick={() => onMenuChange && onMenuChange('auction')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {ongoingAuctions.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No active auctions</p>
                  <p className="text-gray-400 text-xs mt-1">Join upcoming auctions to see them here</p>
                </div>
              ) : (
                ongoingAuctions.map((auction) => (
                  <div key={auction.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-semibold text-gray-900">{auction.title}</span>
                          <span className="text-sm text-gray-600">({auction.spice})</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Current Bid: <span className="font-semibold text-blue-700">{auction.currentBid}</span></span>
                          <span>•</span>
                          <span>{auction.bidders} bidders</span>
                          <span>•</span>
                          <span className="text-orange-600 font-medium">{auction.timeLeft} left</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Notifications</h3>
              {notifications.filter(n => n.unread).length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {notifications.filter(n => n.unread).length} new
                </span>
              )}
            </div>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-gray-500 text-sm">No notifications</p>
                  <p className="text-gray-400 text-xs mt-1">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notification) => (
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
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Links - Blurred if not verified */}
        <div className={`mt-8 ${!isVerified ? 'blur-sm pointer-events-none' : ''}`}>
          {/* Quick Links */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Links</h3>
            <div className="space-y-4">
              <button 
                onClick={() => onMenuChange && onMenuChange('inventory')}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white p-4 rounded-xl flex items-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-semibold">Add Inventory</span>
              </button>
              <button 
                onClick={() => onMenuChange && onMenuChange('auction')}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-xl flex items-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Browse Auctions</span>
              </button>
              <button 
                onClick={() => onMenuChange && onMenuChange('dashboard')}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white p-4 rounded-xl flex items-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-semibold">View Dashboard</span>
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

// Auction List Component
const AuctionList = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showInventorySelection, setShowInventorySelection] = useState(false);
  const [joinedAuctions, setJoinedAuctions] = useState(new Set());
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [auctionDetails, setAuctionDetails] = useState(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const data = await auctionAPI.getUpcomingAuctions();
        setAuctions(data);
        setError(null);

        // Check which auctions the user has joined
        if (user?.id) {
          const joinedAuctionIds = new Set();
          for (const auction of data) {
            try {
              const joinedData = await auctionAPI.getJoinAuctionsByAuctionId(auction._id || auction.id);
              // Check if current user has joined this auction
              const hasJoined = joinedData.some(join => join.farmerId === user.id);
              if (hasJoined) {
                joinedAuctionIds.add(auction._id || auction.id);
              }
            } catch (err) {
              // Ignore errors for individual auctions
              console.error(`Error checking join status for auction ${auction._id}:`, err);
            }
          }
          setJoinedAuctions(joinedAuctionIds);
        }
      } catch (err) {
        console.error('Error fetching auctions:', err);
        setError('Failed to load auctions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [user?.id]);

  // Calculate dynamic status based on current time
  const getDynamicStatus = (auction) => {
    // If auction status is 'End Auction', always return 'completed'
    if (auction.status === 'End Auction') {
      return 'completed';
    }

    if (!auction.startDate || !auction.endDate) {
      return 'upcoming';
    }

    const now = new Date();
    const startDate = new Date(auction.startDate);
    const endDate = new Date(auction.endDate);

    if (now < startDate) {
      return 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      return 'active';
    } else {
      return 'completed';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'live':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredAuctions = auctions.filter(auction => {
    const dynamicStatus = getDynamicStatus(auction).toLowerCase();
    switch (activeFilter) {
      case 'upcoming':
        return dynamicStatus === 'upcoming';
      case 'active':
        return dynamicStatus === 'active' || dynamicStatus === 'live';
      case 'completed':
        return dynamicStatus === 'completed' || dynamicStatus === 'finished';
      default:
        return true;
    }
  });

  const filterTabs = [
    { id: 'upcoming', label: 'Upcoming', count: auctions.filter(a => getDynamicStatus(a).toLowerCase() === 'upcoming').length },
    { id: 'active', label: 'Active', count: auctions.filter(a => ['active', 'live'].includes(getDynamicStatus(a).toLowerCase())).length },
    { id: 'completed', label: 'Completed', count: auctions.filter(a => ['completed', 'finished'].includes(getDynamicStatus(a).toLowerCase())).length },
  ];

  // Handle Join Auction button click
  const handleJoinAuction = (auction) => {
    setSelectedAuction(auction);
    setShowInventorySelection(true);
  };

  // Handle confirm selection
  const handleConfirmSelection = async (selectedItems) => {
    if (!selectedItems || selectedItems.length === 0) {
      Swal.fire('Error', 'Please select an item', 'error');
      return;
    }

    if (!user?.id) {
      Swal.fire('Error', 'User information not found', 'error');
      return;
    }

    try {
      const selectedItem = selectedItems[0]; // We only allow one item now
      const auctionId = selectedAuction._id || selectedAuction.id;
      
      // Join the auction
      await auctionAPI.joinAuction(
        user.id,
        selectedItem._id,
        auctionId
      );

      // Update inventory status to "Pending Auction"
      await inventoryAPI.updateInventoryStatus(selectedItem._id, 'Pending Auction');

      // Add this auction to joinedAuctions set
      setJoinedAuctions(prev => new Set([...prev, auctionId]));

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Successfully joined the auction',
        confirmButtonColor: '#10b981'
      });

      // Close modal
      handleCloseModal();
      
    } catch (error) {
      console.error('Error joining auction:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to join auction. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowInventorySelection(false);
    setSelectedAuction(null);
  };

  // Handle view auction details
  const handleViewDetails = async (auction) => {
    try {
      const auctionId = auction._id || auction.id;
      
      // Fetch join auction data for this auction
      const joinData = await auctionAPI.getJoinAuctionsByAuctionId(auctionId);
      
      // Find the join entry for the current user
      const userJoin = joinData.find(join => join.farmerId === user.id);
      
      if (userJoin) {
        // Fetch the inventory item details
        const inventoryItem = await inventoryAPI.getInventoryItem(userJoin.inventoryId);
        
        setAuctionDetails({
          auction: auction,
          inventoryItem: inventoryItem,
          joinData: userJoin
        });
        setShowDetailsModal(true);
      } else {
        Swal.fire('Error', 'Could not find your auction entry', 'error');
      }
    } catch (error) {
      console.error('Error fetching auction details:', error);
      Swal.fire('Error', 'Failed to load auction details', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading auctions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-red-900">Error Loading Auctions</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Auctions</h2>
          <p className="text-gray-600 mt-1">Browse all auctions by status</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/30">
            <span className="text-sm text-gray-600">Total Auctions: </span>
            <span className="text-lg font-bold text-emerald-600">{auctions.length}</span>
          </div>
          
          {/* Filter Tabs */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 p-1">
            <div className="flex space-x-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeFilter === tab.id
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    activeFilter === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filteredAuctions.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Auctions</h3>
          <p className="text-gray-600">There are no {activeFilter} auctions at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => (
            <div
              key={auction.id || auction._id}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {auction.auctionTitle || auction.title || auction.productName || auction.name || 'Auction'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {auction.description || auction.product || 'No description available'}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(getDynamicStatus(auction))}`}>
                    {getDynamicStatus(auction).charAt(0).toUpperCase() + getDynamicStatus(auction).slice(1)}
                  </span>
                  {auction.status === 'Intervene' && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Intervene</span>
                    </span>
                  )}
                  {joinedAuctions.has(auction._id || auction.id) ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Joined</span>
                    </span>
                  ) : getDynamicStatus(auction) === 'completed' && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-600 border-gray-200">
                      Not Joined
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {auction.spiceType && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Spice Type:</span>
                    <span className="font-medium text-gray-900">
                      {auction.spiceType}
                    </span>
                  </div>
                )}
                
                {auction.currentBid !== undefined && getDynamicStatus(auction) !== 'upcoming' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Bid:</span>
                    <span className="text-lg font-bold text-blue-600">
                      ₹{auction.currentBid.toLocaleString()}
                    </span>
                  </div>
                )}

                {auction.incrementValue && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bid Increment:</span>
                    <span className="font-medium text-emerald-600">
                      ₹{auction.incrementValue.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

               <div className="border-t border-gray-200 pt-4 space-y-2">
                 {auction.startDate && (
                   <div className="flex items-center space-x-2 text-sm text-gray-600">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     <span>Start: {formatDate(auction.startDate)}</span>
                   </div>
                 )}
                 
                 {auction.endDate && (
                   <div className="flex items-center space-x-2 text-sm text-gray-600">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     <span>End: {formatDate(auction.endDate)}</span>
                   </div>
                 )}

                {auction.blockchainHash && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="truncate">Blockchain Verified</span>
                  </div>
                )}
              </div>

               {getDynamicStatus(auction) === 'upcoming' && (
                 <div className="mt-4 flex justify-center">
                   {joinedAuctions.has(auction._id || auction.id) ? (
                     <button 
                       onClick={() => handleViewDetails(auction)}
                       className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-1.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                       </svg>
                       <span>View Details</span>
                     </button>
                   ) : (
                     <button 
                       onClick={() => handleJoinAuction(auction)}
                       className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-1.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                     >
                       Join Auction
                     </button>
                   )}
                 </div>
               )}

               {(getDynamicStatus(auction) === 'active' || getDynamicStatus(auction) === 'completed') && joinedAuctions.has(auction._id || auction.id) && (
                 <div className="mt-4 flex justify-center">
                   <button 
                     onClick={() => handleViewDetails(auction)}
                     className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-1.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                     </svg>
                     <span>View Details</span>
                   </button>
                 </div>
               )}
            </div>
          ))}
        </div>
      )}

      {/* Inventory Selection Modal */}
      {showInventorySelection && selectedAuction && (
        <InventorySelectionModal
          auction={selectedAuction}
          onClose={handleCloseModal}
          onConfirm={handleConfirmSelection}
        />
      )}

      {/* Auction Details Modal */}
      {showDetailsModal && auctionDetails && (
        <AuctionDetailsModal
          auctionDetails={auctionDetails}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};

// Inventory Selection Component for Auction
const InventorySelectionModal = ({ auction, onClose, onConfirm }) => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cardamomPrices, setCardamomPrices] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both inventory and cardamom prices
        const [inventoryData, pricesData] = await Promise.all([
          inventoryAPI.getInventoryByUser(user?.id),
          spicePricesAPI.getLatestCardamomPrice()
        ]);
        
        // Filter to only show available items (include both old and new)
        const availableItems = inventoryData?.filter(item => item.status === 'available') || [];
        
        setInventory(availableItems);
        setCardamomPrices(pricesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setInventory([]);
        // Fallback prices
        setCardamomPrices({
          avg_amount: 2583.275,
          min_amount: 2565.8,
          max_amount: 2600.75
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Check if item is older than 7 days
  const isItemOlderThan7Days = (item) => {
    const lastUpdateDate = item.updatedAt || item.addedDate || item.createdAt;
    if (!lastUpdateDate) return false;

    const itemDate = new Date(lastUpdateDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - itemDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 7;
  };

  const handleItemToggle = (item) => {
    // Don't allow selection of items older than 7 days
    if (isItemOlderThan7Days(item)) return;
    
    // If clicking the same item, deselect it. Otherwise, select the new item
    setSelectedItem(prev => {
      if (prev?._id === item._id) {
        return null;
      } else {
        return item;
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedItem ? [selectedItem] : []);
    onClose();
  };

  const calculateTotalWeight = () => {
    return selectedItem?.weight || 0;
  };

  const calculateTotalValue = () => {
    if (!cardamomPrices || !selectedItem) return 0;
    
    if (!selectedItem.grade || !selectedItem.weight) return 0;
    
    let pricePerKg = 0;
    
    // Match the exact calculation from InventoryManagement
    switch (selectedItem.grade.toUpperCase()) {
      case 'A':
        pricePerKg = cardamomPrices.max_amount || cardamomPrices.avg_amount || 2600;
        break;
      case 'B':
        pricePerKg = cardamomPrices.avg_amount || 2583;
        break;
      case 'C':
        pricePerKg = cardamomPrices.min_amount || cardamomPrices.avg_amount || 2565;
        break;
      case 'D':
        // Under quality product
        return 0;
      default:
        pricePerKg = cardamomPrices.avg_amount || 2583;
    }
    
    return Math.round(pricePerKg * selectedItem.weight);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p>Loading inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Select Item for Auction</h2>
              <p className="text-gray-600 mt-1">
                Choose one inventory item to add to "{auction?.auctionTitle || 'Auction'}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {inventory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Available Items</h3>
              <p className="text-gray-600">You don't have any available inventory items to add to this auction.</p>
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {inventory.map((item) => {
                 const isSelected = selectedItem?._id === item._id;
                 const isOld = isItemOlderThan7Days(item);
                 return (
                   <div
                     key={item._id}
                     onClick={() => handleItemToggle(item)}
                     className={`p-4 border-2 rounded-lg transition-all duration-200 relative ${
                       isOld
                         ? 'border-orange-200 bg-orange-50 opacity-60 cursor-not-allowed'
                         : isSelected
                         ? 'border-emerald-500 bg-emerald-50 cursor-pointer'
                         : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                     }`}
                   >
                     {/* Needs Update Badge */}
                     {isOld && (
                       <div className="absolute top-2 right-2">
                         <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full shadow-sm">
                           Needs Update
                         </span>
                       </div>
                     )}
                     
                     <div className="flex items-start space-x-3">
                       <div className="flex-shrink-0">
                         <img
                           src={
                             item.spiceImage 
                               ? (item.spiceImage.startsWith('http') 
                                   ? item.spiceImage 
                                   : `http://localhost:3001${item.spiceImage}`)
                               : '/api/placeholder/100/100'
                           }
                           alt={item.spiceName}
                           className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                         />
                       </div>
                       <div className="flex-1 min-w-0">
                         <h4 className={`font-semibold mb-1 ${isOld ? 'text-gray-600' : 'text-gray-900'}`}>
                           {item.spiceName}
                         </h4>
                         <div className="space-y-1 text-sm text-gray-600">
                           <p>Weight: {item.weight} kg</p>
                           <p>Grade: {item.grade}</p>
                         </div>
                       </div>
                       <div className="flex-shrink-0">
                         {isSelected && !isOld && (
                           <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                             <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                             </svg>
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {selectedItem && (
            <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <h4 className="font-semibold text-emerald-900 mb-2">Selected Item Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-emerald-700">Item:</span>
                  <span className="ml-2 font-medium">{selectedItem.spiceName}</span>
                </div>
                <div>
                  <span className="text-emerald-700">Weight:</span>
                  <span className="ml-2 font-medium">{calculateTotalWeight().toFixed(1)} kg</span>
                </div>
                <div>
                  <span className="text-emerald-700">Grade:</span>
                  <span className="ml-2 font-medium">{selectedItem.grade}</span>
                </div>
                <div>
                  <span className="text-emerald-700">Estimated Value:</span>
                  <span className="ml-2 font-medium">₹{calculateTotalValue().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedItem}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedItem
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add to Auction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Auction Details Modal Component
const AuctionDetailsModal = ({ auctionDetails, onClose }) => {
  const { auction, inventoryItem } = auctionDetails;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-500 to-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Auction Details</h2>
              <p className="text-emerald-50 mt-1">Your participation details</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-emerald-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Auction Information */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Auction Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Title:</span>
                <span className="font-semibold text-gray-900">{auction.auctionTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Spice Type:</span>
                <span className="font-semibold text-gray-900">{auction.spiceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Bid:</span>
                <span className="font-semibold text-blue-600">₹{auction.currentBid?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Increment Value:</span>
                <span className="font-semibold text-emerald-600">₹{auction.incrementValue?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-semibold text-gray-900">{formatDate(auction.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End Date:</span>
                <span className="font-semibold text-gray-900">{formatDate(auction.endDate)}</span>
              </div>
            </div>
          </div>

          {/* Inventory Item Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Your Item Details
            </h3>
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="flex items-start space-x-4">
                {inventoryItem.spiceImage && (
                  <div className="flex-shrink-0">
                    <img
                      src={
                        inventoryItem.spiceImage.startsWith('http')
                          ? inventoryItem.spiceImage
                          : `http://localhost:3001${inventoryItem.spiceImage}`
                      }
                      alt={inventoryItem.spiceName}
                      className="w-24 h-24 object-cover rounded-lg border-2 border-emerald-300"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Spice Name:</span>
                    <span className="font-semibold text-gray-900">{inventoryItem.spiceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-semibold text-gray-900">{inventoryItem.weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grade:</span>
                    <span className="font-semibold text-emerald-700">{inventoryItem.grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {inventoryItem.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;

