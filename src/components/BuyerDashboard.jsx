import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { spicePricesAPI, auctionAPI, authAPI, inventoryAPI } from '../services/api';
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

const BuyerDashboard = () => {
  const { user } = useAuth();
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

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { id: 'auctions', label: 'Auctions', icon: 'gavel' },
    { id: 'your-auctions', label: 'Ongoing Auctions', icon: 'briefcase' },
    { id: 'winning-bids', label: 'Winning Bids', icon: 'trophy' },
    { id: 'payments', label: 'Payment History', icon: 'payment' },
  ];

  return (
    <DashboardLayout
      menuItems={menuItems}
      activeMenu={activeMenu}
      onMenuChange={handleMenuClick}
    >
      {activeMenu === 'dashboard' && <BuyerDashboardOverview user={user} />}
      {activeMenu === 'auctions' && <BuyerAuctionsPage user={user} />}
      {activeMenu === 'your-auctions' && <YourAuctionsPage user={user} />}
      {activeMenu === 'winning-bids' && <WinningBidsPage user={user} />}
      {activeMenu === 'payments' && <BuyerPaymentsPage user={user} />}
    </DashboardLayout>
  );
};

// Buyer Dashboard Content Components
const BuyerDashboardOverview = ({ user }) => {
  const navigate = useNavigate();
  const isVerified = user?.isVerified || false;
  
  // State for API data
  const [cardamomData, setCardamomData] = useState(null);
  const [latestPrice, setLatestPrice] = useState(null);
  const [dailyPrices, setDailyPrices] = useState([]);
  const [allAuctions, setAllAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auctionFilter, setAuctionFilter] = useState('active'); // 'active', 'upcoming', 'completed'

  // Buyer-specific data
  const buyerStats = [];

  // Fetch cardamom price data
  const fetchPriceData = useCallback(async () => {
    try {
      console.log('Fetching cardamom data...');
      const [allData, latestData, dailyData] = await Promise.all([
        spicePricesAPI.getAllCardamomData(),
        spicePricesAPI.getLatestCardamomPrice(),
        spicePricesAPI.getDailyCardamomPrices(7)
      ]);
      
      console.log('Raw API responses:');
      console.log('All data:', allData);
      console.log('Latest price:', latestData);
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
    } catch (error) {
      console.error('Error fetching cardamom data:', error);
      // Fallback to mock data
      setLatestPrice({ avg_amount: 2583.275, min_amount: 2565.8, max_amount: 2600.75 });
      // Generate mock daily prices as fallback
      const mockDailyPrices = [
        { day: 'Mon', price: 2400, avg_amount: 2400, hasData: true },
        { day: 'Tue', price: 2450, avg_amount: 2450, hasData: true },
        { day: 'Wed', price: 2480, avg_amount: 2480, hasData: true },
        { day: 'Thu', price: 2500, avg_amount: 2500, hasData: true },
        { day: 'Fri', price: 2475, avg_amount: 2475, hasData: true },
        { day: 'Sat', price: 2490, avg_amount: 2490, hasData: true },
        { day: 'Sun', price: 2450, avg_amount: 2450, hasData: true },
      ];
      setDailyPrices(mockDailyPrices);
      console.log('Using fallback mock data:', mockDailyPrices);
    }
  }, []);

  // Calculate dynamic status based on current time
  const getDynamicStatus = (auction) => {
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

  // Fetch auction data
  const fetchAuctionData = useCallback(async () => {
    try {
      const auctions = await auctionAPI.getAllAuctions();
      
      if (auctions && Array.isArray(auctions)) {
        setAllAuctions(auctions);
      }
    } catch (error) {
      console.error('Error fetching auction data:', error);
      setAllAuctions([]);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch price data
        await fetchPriceData();
        
        // Fetch auction data
        await fetchAuctionData();
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchPriceData, fetchAuctionData]);

  // Helper function to calculate time left
  const calculateTimeLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Format date
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

  // Filter auctions based on selected filter
  const filteredAuctions = allAuctions.filter(auction => {
    const dynamicStatus = getDynamicStatus(auction).toLowerCase();
    switch (auctionFilter) {
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

  // Calculate filter counts
  const activeCount = allAuctions.filter(a => ['active', 'live'].includes(getDynamicStatus(a).toLowerCase())).length;
  const upcomingCount = allAuctions.filter(a => getDynamicStatus(a).toLowerCase() === 'upcoming').length;
  const completedCount = allAuctions.filter(a => ['completed', 'finished'].includes(getDynamicStatus(a).toLowerCase())).length;

  // Loading state
  if (loading) {
  return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.fullName || user?.name}!</h1>
        <p className="text-blue-100">Browse and purchase quality spices from verified farmers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {buyerStats.map((stat, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Blurred Content Container with Verify Button Overlay */}
      <div className="relative">
        {/* Main Content - Blurred if not verified */}
        <div className={!isVerified ? 'blur-sm pointer-events-none' : ''}>
          {/* Cardamom Price Overview */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Today's Cardamom Price - Kerala</h3>
          <span className="text-sm text-gray-500">Updated 2 minutes ago</span>
        </div>

        {/* Cardamom Statistics */}
        {(cardamomData || latestPrice) && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Cardamom Market Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Average Price</p>
                    <p className="text-2xl font-bold text-green-800">
                      ₹{cardamomData?.avg_amount || latestPrice?.avg_amount || '2,583.275'}
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
                      ₹{cardamomData?.min_amount || latestPrice?.min_amount || '2,565.8'} - ₹{cardamomData?.max_amount || latestPrice?.max_amount || '2,600.75'}
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
                    labels: dailyPrices.map(d => `${d.day} ${d.date ? new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}`),
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
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                          label: function(context) {
                            return 'Price: ₹' + context.parsed.y.toLocaleString();
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)',
                          drawBorder: false
                        },
                        ticks: {
                          color: '#6b7280',
                          font: {
                            size: 12
                          }
                        }
                      },
                      y: {
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

      {/* Auctions Section with Tabs */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
            <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Auctions</h3>
            <p className="text-sm text-gray-600 mt-1">Browse and participate in spice auctions</p>
          </div>
          
          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-1">
            <div className="flex space-x-1">
          <button
                onClick={() => setAuctionFilter('active')}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  auctionFilter === 'active'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span>Active</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  auctionFilter === 'active'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {activeCount}
                </span>
          </button>

            <button
                onClick={() => setAuctionFilter('upcoming')}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  auctionFilter === 'upcoming'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span>Upcoming</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  auctionFilter === 'upcoming'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {upcomingCount}
              </span>
            </button>

          <button
                onClick={() => setAuctionFilter('completed')}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  auctionFilter === 'completed'
                    ? 'bg-gray-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span>Completed</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  auctionFilter === 'completed'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {completedCount}
            </span>
          </button>
              </div>
                  </div>
                </div>

        {/* Auctions List */}
            <div className="space-y-4">
          {filteredAuctions.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
              <p className="text-gray-500 text-sm">No {auctionFilter} auctions</p>
              <p className="text-gray-400 text-xs mt-1">Check back later for new auctions</p>
              </div>
          ) : (
            filteredAuctions.map((auction) => {
              const status = getDynamicStatus(auction);
              const isActive = status === 'active';
              const isUpcoming = status === 'upcoming';
              const isCompleted = status === 'completed';
              
              return (
                <div key={auction._id || auction.id} className={`rounded-xl p-5 border transition-all hover:shadow-md ${
                  isActive ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                  isUpcoming ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' :
                  'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-bold text-gray-900">{auction.auctionTitle}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isActive ? 'bg-green-100 text-green-800' :
                          isUpcoming ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {isActive && (
                            <span className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5 animate-pulse"></span>
                              Active
                            </span>
                          )}
                          {isUpcoming && 'Upcoming'}
                          {isCompleted && 'Completed'}
              </span>
              </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span>Type: <span className="font-medium">{auction.spiceType}</span></span>
                        <span>•</span>
                        {isActive && (
                          <>
                            <span className="text-orange-600 font-medium">{calculateTimeLeft(auction.endDate)} left</span>
                            <span>•</span>
                          </>
                        )}
                        {isUpcoming && (
                          <>
                            <span>Starts: <span className="font-medium">{formatDate(auction.startDate)}</span></span>
                            <span>•</span>
                          </>
                        )}
                        {isCompleted && (
                          <>
                            <span>Ended: <span className="font-medium">{formatDate(auction.endDate)}</span></span>
                            <span>•</span>
                          </>
                        )}
                        <span>Increment: ₹{auction.incrementValue}</span>
            </div>
                  </div>
                </div>

                  {isActive && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        <span>{auction.participantCount || 0} participants</span>
                </div>
              </div>
            )}

                  {isUpcoming && !isVerified && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-orange-600 text-center">🔒 Verify your account to participate in auctions</p>
          </div>
                  )}
                </div>
              );
            })
          )}
            </div>
        </div>
      </div>

        {/* Verify Button Overlay - Centered in middle of blurred sections */}
        {!isVerified && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/30 pointer-events-auto">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Account Verification Required</h3>
                <p className="text-gray-600 mb-6 max-w-md">Please verify your account to access cardamom prices, analytics, and participate in auctions</p>
                <button 
                  onClick={() => navigate('/buyer/verification')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Verify Account Now</span>
                </button>
              </div>
            </div>
          </div>
                )}
              </div>
            </div>
  );
};

// Buyer Auctions Page Component
const BuyerAuctionsPage = ({ user }) => {
  const [allAuctions, setAllAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auctionFilter, setAuctionFilter] = useState('active'); // 'active', 'upcoming', 'completed'
  const [showParticipantsView, setShowParticipantsView] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [participants, setParticipants] = useState([]);
  const isVerified = user?.isVerified || false;

  // Fetch all auctions
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const response = await auctionAPI.getAllAuctions();
        setAllAuctions(response || []);
      } catch (error) {
        console.error('Error fetching auctions:', error);
        setAllAuctions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  // Get dynamic status of auction - Same logic as dashboard
  const getDynamicStatus = (auction) => {
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

  // Filter auctions based on selected tab
  const filteredAuctions = allAuctions.filter(auction => {
    const status = getDynamicStatus(auction);
    return status === auctionFilter;
  });

  // Count auctions by status
  const activeCount = allAuctions.filter(a => getDynamicStatus(a) === 'active').length;
  const upcomingCount = allAuctions.filter(a => getDynamicStatus(a) === 'upcoming').length;
  const completedCount = allAuctions.filter(a => getDynamicStatus(a) === 'completed').length;

  // Handle View Farmers
  const handleViewFarmers = async (auction) => {
    try {
      setSelectedAuction(auction);
      const auctionId = auction._id || auction.id;
      
      console.log('Fetching participants for auction:', auctionId);
      
      // Fetch participants for this auction from join-auctions collection
      const joinData = await auctionAPI.getJoinAuctionsByAuctionId(auctionId);
      console.log('Join data received:', joinData);
      
      // Fetch inventory and farmer details for each participant
      const participantsWithInventory = await Promise.all(
        joinData.map(async (join) => {
          let inventoryItem = null;
          let farmer = null;
          let currentBid = null;
          
          console.log('Processing join:', join);
          console.log('Farmer ID from join:', join.farmerId);
          
          // Fetch inventory item
          try {
            inventoryItem = await inventoryAPI.getInventoryItem(join.inventoryId);
            console.log('Inventory item fetched:', inventoryItem);
          } catch (error) {
            console.error('Error fetching inventory for participant:', error);
          }
          
          // Fetch farmer details by farmerId
          try {
            const farmerResponse = await authAPI.getFarmerById(join.farmerId);
            console.log('Farmer API response for', join.farmerId, ':', farmerResponse);
            
            // Response structure: { success, message, data: { farmer: {...} } }
            if (farmerResponse && farmerResponse.data && farmerResponse.data.farmer) {
              farmer = farmerResponse.data.farmer;
              console.log('Farmer details extracted:', farmer);
            } else {
              console.warn('Unexpected farmer response structure:', farmerResponse);
            }
          } catch (error) {
            console.error('Error fetching farmer details for ID:', join.farmerId, error);
          }

          // Fetch current bid for this inventory
          let allBidsForInventory = [];
          try {
            const bidsResponse = await auctionAPI.getBidsByInventoryId(join.inventoryId);
            console.log('Bids response for inventory', join.inventoryId, ':', bidsResponse);
            
            allBidsForInventory = bidsResponse || [];
            
            // Get the highest bid if bids exist
            if (bidsResponse && Array.isArray(bidsResponse) && bidsResponse.length > 0) {
              // Find highest currentBidPrice from all bids
              currentBid = Math.max(...bidsResponse.map(bid => bid.currentBidPrice || bid.bidAmount || 0));
              console.log('Highest bid (currentBidPrice) for inventory:', currentBid);
            }
          } catch (error) {
            console.error('Error fetching bids for inventory:', join.inventoryId, error);
          }
          
          return {
            ...join,
            inventoryItem,
            farmer,
            currentBid,
            allBidsForInventory
          };
        })
      );
      
      console.log('Final participants with inventory:', participantsWithInventory);
      setParticipants(participantsWithInventory);
      setShowParticipantsView(true);
    } catch (error) {
      console.error('Error fetching participants:', error);
      Swal.fire('Error', 'Failed to load participants', 'error');
    }
  };

  // Helper function to calculate time left
  const calculateTimeLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading auctions...</p>
        </div>
      </div>
    );
  }

  // If showing participants view, render that instead
  if (showParticipantsView && selectedAuction) {
    return (
      <AuctionParticipantsView
        auction={selectedAuction}
        participants={participants}
        onBack={() => {
          setShowParticipantsView(false);
          // Refresh auctions after viewing participants
          const fetchAuctions = async () => {
            try {
              const response = await auctionAPI.getAllAuctions();
              setAllAuctions(response || []);
            } catch (error) {
              console.error('Error refreshing auctions:', error);
            }
          };
          fetchAuctions();
        }}
        user={user}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
          <div className="flex items-center justify-between">
            <div>
          <h2 className="text-3xl font-bold text-gray-900">Auctions</h2>
          <p className="text-gray-600 mt-1">Browse and participate in spice auctions</p>
            </div>
        
        {/* Filter Tabs - Right Side */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-1">
          <div className="flex space-x-1">
            <button
              onClick={() => setAuctionFilter('active')}
              className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                auctionFilter === 'active'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span>Active</span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                auctionFilter === 'active'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {activeCount}
                  </span>
              </button>
              
            <button
              onClick={() => setAuctionFilter('upcoming')}
              className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                auctionFilter === 'upcoming'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span>Upcoming</span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                auctionFilter === 'upcoming'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {upcomingCount}
                  </span>
            </button>
            
            <button
              onClick={() => setAuctionFilter('completed')}
              className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                auctionFilter === 'completed'
                  ? 'bg-gray-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span>Completed</span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                auctionFilter === 'completed'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {completedCount}
              </span>
            </button>
                </div>
              </div>
          </div>

      {/* Verification Warning */}
      {!isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
            <div>
              <h4 className="font-semibold text-yellow-900">Account Verification Required</h4>
              <p className="text-sm text-yellow-700 mt-1">You need to verify your account to participate in auctions.</p>
        </div>
      </div>
        </div>
      )}

      {/* Auctions Grid */}
      {filteredAuctions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No {auctionFilter.charAt(0).toUpperCase() + auctionFilter.slice(1)} Auctions
          </h3>
          <p className="text-gray-600">There are currently no {auctionFilter} auctions. Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => {
            const status = getDynamicStatus(auction);
            const isActive = status === 'active';
            const isUpcoming = status === 'upcoming';
            const isCompleted = status === 'completed';
            
            return (
            <div
              key={auction._id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-300"
            >
              {/* Auction Header */}
              <div className={`p-4 text-white ${
                isActive ? 'bg-gradient-to-r from-green-500 to-green-600' :
                isUpcoming ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                'bg-gradient-to-r from-gray-500 to-gray-600'
              }`}>
                <div className="flex items-start justify-between">
            <div>
                    <h3 className="text-lg font-bold">{auction.auctionName || auction.auctionTitle}</h3>
                    <p className="text-white/80 text-sm mt-1">{auction.spiceName || auction.spiceType}</p>
                  </div>
                  <span className={`backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold flex items-center ${
                    isActive ? 'bg-white/20 text-white' :
                    isUpcoming ? 'bg-white/20 text-white' :
                    'bg-white/20 text-white'
                  }`}>
                    {isActive && (
                      <>
                        <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span>
                        Active
                      </>
                    )}
                    {isUpcoming && 'Upcoming'}
                    {isCompleted && 'Completed'}
                  </span>
                  </div>
                </div>

              {/* Auction Details */}
              <div className="p-4 space-y-3">
                {/* Time Left (Active only) */}
                {isActive && (
                  <div className="flex items-center space-x-2 text-sm">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600">Time Left:</span>
                    <span className="font-semibold text-orange-600">{calculateTimeLeft(auction.endDate)}</span>
              </div>
                )}

                {/* Start Date */}
                <div className="flex items-center space-x-2 text-sm">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">{isUpcoming ? 'Starts:' : 'Started:'}</span>
                  <span className="text-gray-900 text-xs">{formatDate(auction.startDate)}</span>
            </div>

                {/* End Date */}
                <div className="flex items-center space-x-2 text-sm">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">{isCompleted ? 'Ended:' : 'Ends:'}</span>
                  <span className="text-gray-900 text-xs">{formatDate(auction.endDate)}</span>
          </div>

                {/* Participants (Active only) */}
                {isActive && (
                  <div className="flex items-center space-x-2 text-sm pt-2 border-t border-gray-100">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-gray-600">{auction.participantCount || 0} participants</span>
      </div>
                )}

                {/* Description */}
                {auction.description && (
                  <p className="text-sm text-gray-600 pt-2 border-t border-gray-100">
                    {auction.description}
                  </p>
                )}
            </div>

              {/* Action Button - View Farmers */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => handleViewFarmers(auction)}
                  className="w-full py-3 rounded-lg font-semibold transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                  <span>View Farmers</span>
              </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Auction Participants View Component
const AuctionParticipantsView = ({ auction, participants, onBack, user }) => {
  const [latestCardamomPrice, setLatestCardamomPrice] = useState(null);
  const [participantsList, setParticipantsList] = useState(participants);

  // Fetch latest cardamom price
  useEffect(() => {
    const fetchCardamomPrice = async () => {
      try {
        const priceData = await spicePricesAPI.getLatestCardamomPrice();
        setLatestCardamomPrice(priceData);
      } catch (error) {
        console.error('Error fetching cardamom price:', error);
      }
    };
    fetchCardamomPrice();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate base price for inventory (price per kg * weight)
  const calculateBasePrice = (inventoryItem) => {
    if (!inventoryItem || !latestCardamomPrice) return 0;
    const pricePerKg = latestCardamomPrice.avg_amount || latestCardamomPrice.price || 0;
    const weight = inventoryItem.weight || 0;
    return Math.round(pricePerKg * weight);
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Auctions</span>
        </button>
      </div>

      {/* Auction Info Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">{auction.auctionName || auction.auctionTitle}</h2>
        <div className="flex items-center space-x-4 text-blue-100">
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {auction.spiceName || auction.spiceType}
                    </span>
                  </div>
                </div>

      {/* Participants List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Participating Farmers ({participantsList.length})
          </h3>
                  </div>

        {participantsList.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Participants Yet</h4>
            <p className="text-gray-600">No farmers have joined this auction yet.</p>
          </div>
        ) : (
            <div className="space-y-4">
            {participantsList.map((participant, index) => (
              <div key={participant._id || index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-start space-x-6">
                  {/* Inventory Image */}
                  {participant.inventoryItem?.spiceImage && (
                    <div className="flex-shrink-0">
                      <img
                        src={
                          participant.inventoryItem.spiceImage.startsWith('http')
                            ? participant.inventoryItem.spiceImage
                            : `http://localhost:3001${participant.inventoryItem.spiceImage}`
                        }
                        alt={participant.inventoryItem.spiceName}
                        className="w-32 h-32 object-cover rounded-lg border-2 border-blue-300"
                      />
                    </div>
                  )}

                  {/* Participant Details */}
                    <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">
                          {participant.farmer?.fullName || participant.farmer?.name || 'Unknown Farmer'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {participant.farmer?.emailAddress || participant.farmer?.email || 'No email'}
                        </p>
                        {participant.farmer?.contactNumber && (
                          <p className="text-sm text-gray-600">
                            📞 {participant.farmer.contactNumber}
                          </p>
                    )}
                  </div>
                      {(() => {
                        // Check if current buyer is the highest bidder
                        const buyerId = user?.id || user?._id;
                        const allBids = participant.allBidsForInventory || [];
                        const buyerBid = allBids.find(b => (b.buyerId === buyerId || b.buyerId?.toString() === buyerId?.toString()));
                        const highestBid = allBids.length > 0 
                          ? Math.max(...allBids.map(b => b.currentBidPrice || 0))
                          : 0;
                        const isHighestBidder = buyerBid && buyerBid.currentBidPrice === highestBid && highestBid > 0;

                        if (isHighestBidder) {
                          return (
                            <div className="bg-green-500 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span>You're the Highest Bidder!</span>
                </div>
                          );
                        }

                        return (
                      <button
                        onClick={() => {
                          const basePrice = calculateBasePrice(participant.inventoryItem);
                          const incrementValue = auction.incrementValue || 0;
                          const currentBidAmount = participant.currentBid || 0;
                          
                          // Calculate minimum bid: Current Bid + Increment (or Base Price + Increment if no bids)
                          const minimumBid = currentBidAmount > 0 
                            ? currentBidAmount + incrementValue 
                            : basePrice + incrementValue;

                          Swal.fire({
                            title: '<strong>Place Your Bid</strong>',
                            html: `
                              <div style="text-align: left; padding: 0 10px;">
                                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px; color: white;">
                                  <p style="font-size: 12px; opacity: 0.9; margin: 0 0 5px 0;">Bidding for</p>
                                  <p style="font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">${participant.farmer?.fullName || 'Unknown Farmer'}</p>
                                  <p style="font-size: 13px; opacity: 0.9; margin: 0;">${participant.inventoryItem?.spiceName || 'Spice'} • ${participant.inventoryItem?.weight || 0} kg • Grade ${participant.inventoryItem?.grade || 'N/A'}</p>
              </div>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                                  <div style="background: #f0fdf4; padding: 16px; border-radius: 10px; border: 1px solid #86efac;">
                                    <p style="font-size: 11px; color: #166534; margin: 0 0 6px 0; font-weight: 600;">BASE PRICE</p>
                                    <div style="font-size: 20px; font-weight: bold; color: #16a34a; margin: 0;">₹${basePrice.toLocaleString()}</div>
            </div>
                                  <div style="background: ${currentBidAmount > 0 ? '#eff6ff' : '#f9fafb'}; padding: 16px; border-radius: 10px; border: 1px solid ${currentBidAmount > 0 ? '#93c5fd' : '#e5e7eb'};">
                                    <p style="font-size: 11px; color: ${currentBidAmount > 0 ? '#1e40af' : '#6b7280'}; margin: 0 0 6px 0; font-weight: 600;">CURRENT BID</p>
                                    <div style="font-size: 20px; font-weight: bold; color: ${currentBidAmount > 0 ? '#2563eb' : '#9ca3af'}; margin: 0;">
                                      ${currentBidAmount > 0 ? '₹' + currentBidAmount.toLocaleString() : 'No bids yet'}
          </div>
                  </div>
                </div>
                                
                                <div style="background: #fef3c7; padding: 16px; border-radius: 10px; border: 1px solid #fbbf24; margin-bottom: 16px;">
                                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <span style="font-size: 13px; color: #92400e;">Increment Value:</span>
                                    <span style="font-size: 15px; font-weight: bold; color: #92400e;">₹${incrementValue.toLocaleString()}</span>
      </div>
                                  <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #fbbf24;">
                                    <span style="font-size: 13px; color: #92400e;">Minimum Bid:</span>
                                    <span style="font-size: 16px; font-weight: bold; color: #92400e;">₹${minimumBid.toLocaleString()}</span>
            </div>
          </div>

                                <div>
                                  <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px;">Your Bid Amount (₹)</label>
                                  <input type="number" id="bidAmount" style="width: 100%; padding: 12px; font-size: 18px; font-weight: 600; border: 2px solid #d1d5db; border-radius: 10px; text-align: center;" placeholder="Enter bid amount" min="${minimumBid}" value="${minimumBid}">
            </div>
                    </div>
                            `,
                            width: '550px',
                            showCancelButton: true,
                            confirmButtonText: '💰 Place Bid',
                            cancelButtonText: 'Cancel',
                            confirmButtonColor: '#10b981',
                            cancelButtonColor: '#6b7280',
                            customClass: {
                              container: 'swal-wide',
                              popup: 'swal-popup-rounded'
                            },
                            preConfirm: () => {
                              const bidAmount = document.getElementById('bidAmount').value;
                              if (!bidAmount || parseFloat(bidAmount) < minimumBid) {
                                Swal.showValidationMessage('Bid must be at least ₹' + minimumBid.toLocaleString());
                                return false;
                              }
                              return { bidAmount: parseFloat(bidAmount) };
                            }
                          }).then(async (result) => {
                            if (result.isConfirmed) {
                              try {
                                // Submit bid to backend
                                const bidData = {
                                  buyerId: user?.id || user?._id,
                                  inventoryId: participant.inventoryItem?._id || participant.inventoryId,
                                  farmerId: participant.farmerId,
                                  auctionId: auction._id || auction.id,
                                  currentBidPrice: result.value.bidAmount
                                };

                                console.log('Submitting bid:', bidData);
                                const response = await auctionAPI.createBid(bidData);
                                console.log('Bid response:', response);

                                // Update participant's current bid in local state
                                setParticipantsList(prevList => 
                                  prevList.map(p => 
                                    p._id === participant._id || p.inventoryId === participant.inventoryId
                                      ? { ...p, currentBid: result.value.bidAmount }
                                      : p
                                  )
                                );

                                Swal.fire({
                                  icon: 'success',
                                  title: 'Bid Placed Successfully!',
                                  text: `Your bid of ₹${result.value.bidAmount.toLocaleString()} has been placed for ${participant.farmer?.fullName || 'this farmer'}.`,
                                  confirmButtonColor: '#10b981'
                                });
                              } catch (error) {
                                console.error('Error placing bid:', error);
                                Swal.fire({
                                  icon: 'error',
                                  title: 'Bid Failed',
                                  text: error.response?.data?.message || error.message || 'Failed to place bid. Please try again.',
                                  confirmButtonColor: '#ef4444'
                                });
                              }
                            }
                          });
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Place Bid</span>
                      </button>
                        );
                      })()}
                    </div>

                    {/* Inventory Details */}
                    {participant.inventoryItem && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 p-4 bg-white rounded-lg border border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Spice</p>
                          <p className="font-semibold text-gray-900">{participant.inventoryItem.spiceName}</p>
                </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Weight</p>
                          <p className="font-semibold text-gray-900">{participant.inventoryItem.weight} kg</p>
            </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Grade</p>
                          <p className="font-semibold text-gray-900">{participant.inventoryItem.grade}</p>
          </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Base Price</p>
                          <p className="font-semibold text-green-600">
                            ₹{calculateBasePrice(participant.inventoryItem).toLocaleString()}
                          </p>
        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Current Bid</p>
                          {participant.currentBid ? (
                            <p className="font-semibold text-blue-600">
                              ₹{participant.currentBid.toLocaleString()}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              No bids yet
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Join Date */}
                    <div className="mt-3 flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                      Joined on {formatDate(participant.createdAt || new Date())}
                </div>
              </div>
            </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Your Auctions Page Component - Shows buyer's bids grouped by farmer
const YourAuctionsPage = ({ user }) => {
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedByFarmer, setGroupedByFarmer] = useState({});

  useEffect(() => {
    const fetchMyBids = async () => {
      try {
        setLoading(true);
        const buyerId = user?.id || user?._id;
        console.log('Fetching bids for buyer:', buyerId);

        // Fetch all bids by this buyer
        const bidsResponse = await auctionAPI.getBidsByBuyerId(buyerId);
        console.log('Buyer bids response:', bidsResponse);
        setMyBids(bidsResponse || []);

        // Fetch detailed information for each bid
        const bidsWithDetails = await Promise.all(
          (bidsResponse || []).map(async (bid) => {
            let farmer = null;
            let inventoryItem = null;
            let auction = null;
            let allBidsForInventory = [];

            // Fetch farmer details
            try {
              const farmerResponse = await authAPI.getFarmerById(bid.farmerId);
              if (farmerResponse?.data?.farmer) {
                farmer = farmerResponse.data.farmer;
              }
            } catch (error) {
              console.error('Error fetching farmer:', error);
            }

            // Fetch inventory details
            try {
              inventoryItem = await inventoryAPI.getInventoryItem(bid.inventoryId);
            } catch (error) {
              console.error('Error fetching inventory:', error);
            }

            // Fetch auction details
            try {
              const allAuctions = await auctionAPI.getAllAuctions();
              auction = allAuctions.find(a => (a._id || a.id) === bid.auctionId);
            } catch (error) {
              console.error('Error fetching auction:', error);
            }

            // Fetch all bids for this inventory to show current highest bid
            try {
              const inventoryBids = await auctionAPI.getBidsByInventoryId(bid.inventoryId);
              allBidsForInventory = inventoryBids || [];
            } catch (error) {
              console.error('Error fetching all bids for inventory:', error);
            }

            return {
              ...bid,
              farmer,
              inventoryItem,
              auction,
              allBidsForInventory
            };
          })
        );

        // Group bids by farmer
        const grouped = bidsWithDetails.reduce((acc, bid) => {
          const farmerId = bid.farmerId;
          if (!acc[farmerId]) {
            acc[farmerId] = {
              farmer: bid.farmer,
              bids: []
            };
          }
          acc[farmerId].bids.push(bid);
          return acc;
        }, {});

        console.log('Grouped bids by farmer:', grouped);
        setGroupedByFarmer(grouped);
      } catch (error) {
        console.error('Error fetching buyer bids:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBids();
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
  return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bids...</p>
      </div>
      </div>
    );
  }

  const farmerIds = Object.keys(groupedByFarmer);

  return (
    <div className="space-y-6">
      {/* Header */}
            <div className="flex items-center justify-between">
              <div>
          <h2 className="text-3xl font-bold text-gray-900">Ongoing Auctions</h2>
          <p className="text-gray-600 mt-1">View all your bids organized by farmer</p>
              </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
          {myBids.length} Total Bids
            </div>
      </div>

      {/* No Bids State */}
      {farmerIds.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bids Yet</h3>
          <p className="text-gray-600">You haven't placed any bids yet. Browse active auctions to get started!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Farmers List */}
          {farmerIds.map((farmerId) => {
            const farmerData = groupedByFarmer[farmerId];
            const farmer = farmerData.farmer;
            const bids = farmerData.bids;

            return (
              <div key={farmerId} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Farmer Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{farmer?.fullName || 'Unknown Farmer'}</h3>
                      <p className="text-green-100 text-sm mt-1">
                        {farmer?.emailAddress || 'No email'} • {farmer?.contactNumber || 'No contact'}
                      </p>
                      </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <span className="font-semibold">{bids.length} Bid{bids.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                </div>

                {/* Bids List for this Farmer */}
                <div className="p-6">
                  <div className="space-y-4">
                    {bids.map((bid, index) => {
                      // Calculate current highest bid for this inventory
                      const highestBid = bid.allBidsForInventory.length > 0
                        ? Math.max(...bid.allBidsForInventory.map(b => b.currentBidPrice || 0))
                        : 0;
                      
                      // Check if buyer's bid is the highest
                      const isHighestBidder = bid.currentBidPrice === highestBid && highestBid > 0;
                      const buyerBidAmount = bid.currentBidPrice || 0;

                      return (
                      <div key={bid._id || index} className={`rounded-xl p-5 border-2 transition-colors ${
                        isHighestBidder 
                          ? 'bg-green-50 border-green-300 hover:border-green-400' 
                          : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                      }`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-bold text-gray-900 text-lg">
                                {bid.auction?.auctionName || bid.auction?.auctionTitle || 'Auction'}
                              </h4>
                              {isHighestBidder && (
                                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span>Highest</span>
                      </span>
                              )}
                    </div>
                            <p className="text-sm text-gray-600">
                              {bid.inventoryItem?.spiceName || 'Spice'} • {bid.inventoryItem?.weight || 0} kg • Grade {bid.inventoryItem?.grade || 'N/A'}
                            </p>
                  </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">Your Bid</div>
                            <div className={`text-2xl font-bold ${isHighestBidder ? 'text-green-600' : 'text-blue-600'}`}>
                              ₹{buyerBidAmount.toLocaleString()}
                </div>
            </div>
          </div>

                        {/* Current Highest Bid Info */}
                        {!isHighestBidder && highestBid > buyerBidAmount && (
                          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-orange-800">Current Highest Bid:</span>
                              <span className="text-lg font-bold text-orange-600">₹{highestBid.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-orange-600 mt-1">You've been outbid! Place a higher bid to win.</p>
                          </div>
                        )}

                        {/* Bid Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Auction Status</p>
                            <p className="font-semibold text-gray-900 capitalize">{bid.auction?.status || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Increment</p>
                            <p className="font-semibold text-gray-900">₹{(bid.auction?.incrementValue || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Your Bid Placed</p>
                            <p className="font-semibold text-gray-900 text-xs">{formatDate(bid.createdAt || new Date())}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Auction Ends</p>
                            <p className="font-semibold text-gray-900 text-xs">
                              {bid.auction?.endDate ? formatDate(bid.auction.endDate) : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Total Bidders Count & Actions */}
                        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>{bid.allBidsForInventory.length} total bidder{bid.allBidsForInventory.length !== 1 ? 's' : ''}</span>
                          </div>
                          {isHighestBidder ? (
                            <span className="text-sm font-semibold text-green-600 flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>You're winning!</span>
              </span>
                          ) : (
                            <button
                              onClick={() => {
                                const incrementValue = bid.auction?.incrementValue || 0;
                                const minimumBid = highestBid + incrementValue;

                                Swal.fire({
                                  title: '<strong>Place Higher Bid</strong>',
                                  html: `
                                    <div style="text-align: left; padding: 0 10px;">
                                      <div class="bg-orange-50 p-3 rounded-lg border border-orange-200" style="margin-bottom: 16px;">
                                        <p style="font-size: 13px; color: #92400e; margin: 0;">You've been outbid! Place a higher bid to win this auction.</p>
            </div>
                                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                                        <div style="background: #eff6ff; padding: 16px; border-radius: 10px; border: 1px solid #93c5fd;">
                                          <p style="font-size: 11px; color: #1e40af; margin: 0 0 6px 0; font-weight: 600;">YOUR BID</p>
                                          <div style="font-size: 20px; font-weight: bold; color: #2563eb; margin: 0;">₹${buyerBidAmount.toLocaleString()}</div>
                    </div>
                                        <div style="background: #fef3c7; padding: 16px; border-radius: 10px; border: 1px solid #fbbf24;">
                                          <p style="font-size: 11px; color: #92400e; margin: 0 0 6px 0; font-weight: 600;">CURRENT HIGHEST</p>
                                          <div style="font-size: 20px; font-weight: bold; color: #92400e; margin: 0;">₹${highestBid.toLocaleString()}</div>
                  </div>
                </div>
                                      <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; border: 1px solid #86efac; margin-bottom: 16px;">
                                        <p style="font-size: 12px; color: #166534; margin: 0;"><strong>Minimum Bid:</strong> ₹${minimumBid.toLocaleString()} (Highest + ₹${incrementValue.toLocaleString()})</p>
            </div>
                                      <div>
                                        <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px;">Your New Bid Amount (₹)</label>
                                        <input type="number" id="bidAmount" style="width: 100%; padding: 12px; font-size: 18px; font-weight: 600; border: 2px solid #d1d5db; border-radius: 10px; text-align: center;" placeholder="Enter bid amount" min="${minimumBid}" value="${minimumBid}">
          </div>
        </div>
                                  `,
                                  width: '500px',
                                  showCancelButton: true,
                                  confirmButtonText: '💰 Place Higher Bid',
                                  cancelButtonText: 'Cancel',
                                  confirmButtonColor: '#10b981',
                                  cancelButtonColor: '#6b7280',
                                  preConfirm: () => {
                                    const bidAmount = document.getElementById('bidAmount').value;
                                    if (!bidAmount || parseFloat(bidAmount) < minimumBid) {
                                      Swal.showValidationMessage('Bid must be at least ₹' + minimumBid.toLocaleString());
                                      return false;
                                    }
                                    return { bidAmount: parseFloat(bidAmount) };
                                  }
                                }).then(async (result) => {
                                  if (result.isConfirmed) {
                                    try {
                                      const bidData = {
                                        buyerId: user?.id || user?._id,
                                        inventoryId: bid.inventoryItem?._id || bid.inventoryId,
                                        farmerId: bid.farmerId,
                                        auctionId: bid.auctionId,
                                        currentBidPrice: result.value.bidAmount
                                      };

                                      await auctionAPI.createBid(bidData);
                                      
                                      Swal.fire({
                                        icon: 'success',
                                        title: 'Higher Bid Placed!',
                                        text: `Your new bid of ₹${result.value.bidAmount.toLocaleString()} has been placed successfully.`,
                                        confirmButtonColor: '#10b981'
                                      }).then(() => {
                                        window.location.reload();
                                      });
                                    } catch (error) {
                                      Swal.fire({
                                        icon: 'error',
                                        title: 'Bid Failed',
                                        text: error.response?.data?.message || 'Failed to place bid.',
                                        confirmButtonColor: '#ef4444'
                                      });
                                    }
                                  }
                                });
                              }}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                              <span>Raise Bid</span>
                            </button>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Winning Bids Page Component - Shows only auctions where buyer is winning
const WinningBidsPage = ({ user }) => {
  const [winningBids, setWinningBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinningBids = async () => {
      try {
        setLoading(true);
        const buyerId = user?.id || user?._id;

        // Fetch all bids by this buyer
        const bidsResponse = await auctionAPI.getBidsByBuyerId(buyerId);
        console.log('All buyer bids:', bidsResponse);

        // Fetch detailed information and check if buyer is winning for each bid
        const bidsWithDetails = await Promise.all(
          (bidsResponse || []).map(async (bid) => {
            let farmer = null;
            let inventoryItem = null;
            let auction = null;
            let allBidsForInventory = [];
            let isWinning = false;

            // Fetch farmer details
            try {
              const farmerResponse = await authAPI.getFarmerById(bid.farmerId);
              if (farmerResponse?.data?.farmer) {
                farmer = farmerResponse.data.farmer;
              }
            } catch (error) {
              console.error('Error fetching farmer:', error);
            }

            // Fetch inventory details
            try {
              inventoryItem = await inventoryAPI.getInventoryItem(bid.inventoryId);
            } catch (error) {
              console.error('Error fetching inventory:', error);
            }

            // Fetch auction details
            try {
              const allAuctions = await auctionAPI.getAllAuctions();
              auction = allAuctions.find(a => (a._id || a.id) === bid.auctionId);
            } catch (error) {
              console.error('Error fetching auction:', error);
            }

            // Fetch all bids for this inventory to check if buyer is winning
            try {
              const inventoryBids = await auctionAPI.getBidsByInventoryId(bid.inventoryId);
              allBidsForInventory = inventoryBids || [];
              
              // Check if buyer's bid is the highest
              const highestBid = allBidsForInventory.length > 0
                ? Math.max(...allBidsForInventory.map(b => b.currentBidPrice || 0))
                : 0;
              isWinning = bid.currentBidPrice === highestBid && highestBid > 0;
            } catch (error) {
              console.error('Error fetching all bids for inventory:', error);
            }

            // Check if payment already done for this inventory
            let paymentDone = false;
            try {
              const payments = await auctionAPI.getPaymentsByInventoryId(bid.inventoryId);
              paymentDone = payments && payments.length > 0;
            } catch (error) {
              console.error('Error fetching payment status:', error);
            }

            // Fetch farmer bank details
            let farmerBankDetails = null;
            try {
              const bankResponse = await authAPI.getFarmerBankDetails(bid.farmerId);
              if (bankResponse?.data?.bankDetails) {
                farmerBankDetails = bankResponse.data.bankDetails;
              }
            } catch (error) {
              console.error('Error fetching farmer bank details:', error);
            }

            return {
              ...bid,
              farmer,
              inventoryItem,
              auction,
              allBidsForInventory,
              isWinning,
              paymentDone,
              farmerBankDetails
            };
          })
        );

        // Filter only winning bids from completed/ended auctions
        const winningOnly = bidsWithDetails.filter(bid => {
          if (!bid.isWinning) return false;
          
          // Check if auction is completed/ended
          const auction = bid.auction;
          if (!auction) return false;
          
          // Check if status is 'End Auction' or if end date has passed
          if (auction.status === 'End Auction') return true;
          
          const now = new Date();
          const endDate = new Date(auction.endDate);
          return now > endDate;
        });
        console.log('Winning bids from completed auctions:', winningOnly);
        setWinningBids(winningOnly);
      } catch (error) {
        console.error('Error fetching winning bids:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWinningBids();
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePayment = async (bid) => {
    const amount = bid.currentBidPrice || 0;

    if (amount <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Invalid payment amount',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    // Check if farmer has bank details
    if (!bid.farmerBankDetails) {
      Swal.fire({
        icon: 'warning',
        title: 'Bank Details Not Available',
        text: 'Farmer has not added bank account details yet. Please contact the farmer.',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    // Show confirmation dialog with farmer bank details
    const confirmResult = await Swal.fire({
      title: '<strong>Confirm Payment</strong>',
      html: `
        <div style="text-align: left; padding: 0 10px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px; color: white;">
            <p style="font-size: 12px; opacity: 0.9; margin: 0 0 5px 0;">Payment for</p>
            <p style="font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">${bid.auction?.auctionName || 'Auction'}</p>
            <p style="font-size: 13px; opacity: 0.9; margin: 0;">${bid.inventoryItem?.spiceName || 'Spice'} • ${bid.inventoryItem?.weight || 0} kg from ${bid.farmer?.fullName || 'Farmer'}</p>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; border: 2px solid #86efac; margin-bottom: 16px; text-align: center;">
            <p style="font-size: 13px; color: #166534; margin: 0 0 8px 0; font-weight: 600;">TOTAL AMOUNT TO PAY</p>
            <div style="font-size: 32px; font-weight: bold; color: #16a34a; margin: 0;">₹${amount.toLocaleString()}</div>
          </div>

          <div style="background: #fef3c7; padding: 16px; border-radius: 10px; border: 1px solid #fbbf24; margin-bottom: 16px;">
            <p style="font-size: 13px; color: #92400e; margin: 0 0 10px 0; font-weight: 600;">💰 Farmer Bank Details</p>
            <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
              <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px 0;">Bank Name</p>
              <p style="font-size: 13px; color: #1f2937; margin: 0; font-weight: 600;">${bid.farmerBankDetails.bankName || 'N/A'}</p>
            </div>
            <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
              <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px 0;">Account Holder Name</p>
              <p style="font-size: 13px; color: #1f2937; margin: 0; font-weight: 600;">${bid.farmerBankDetails.accountHolderName || 'N/A'}</p>
            </div>
            <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
              <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px 0;">Account Number</p>
              <p style="font-size: 13px; color: #1f2937; margin: 0; font-weight: 600; letter-spacing: 1px;">${bid.farmerBankDetails.accountNumber || 'N/A'}</p>
            </div>
            <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
              <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px 0;">IFSC Code</p>
              <p style="font-size: 13px; color: #1f2937; margin: 0; font-weight: 600; text-transform: uppercase;">${bid.farmerBankDetails.ifscCode || 'N/A'}</p>
            </div>
            ${bid.farmerBankDetails.upiId ? `
              <div style="background: white; padding: 12px; border-radius: 8px;">
                <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px 0;">UPI ID</p>
                <p style="font-size: 13px; color: #1f2937; margin: 0; font-weight: 600;">${bid.farmerBankDetails.upiId}</p>
              </div>
            ` : ''}
          </div>

          <div style="background: #eff6ff; padding: 16px; border-radius: 10px; border: 1px solid #93c5fd; margin-bottom: 16px;">
            <p style="font-size: 12px; color: #1e40af; margin: 0;"><strong>Farmer:</strong> ${bid.farmer?.fullName || 'N/A'}</p>
            <p style="font-size: 12px; color: #1e40af; margin: 8px 0 0 0;"><strong>Contact:</strong> ${bid.farmer?.contactNumber || 'N/A'}</p>
          </div>

          <p style="font-size: 12px; color: #6b7280; margin: 0; text-align: center;">Transfer the amount to the above bank account and click "Confirm Payment".</p>
        </div>
      `,
      width: '550px',
      showCancelButton: true,
      confirmButtonText: '✓ Confirm Payment',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
    });

    if (!confirmResult.isConfirmed) return;

    // Show processing
    Swal.fire({
      title: 'Processing Payment...',
      html: 'Please wait while we process your payment',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock payment ID
      const mockPaymentId = 'PAY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();

      // Send payment details to backend
      const paymentData = {
        buyerId: user?.id || user?._id,
        auctionId: bid.auctionId,
        farmerId: bid.farmerId,
        inventoryId: bid.inventoryId,
        amount: amount
      };

      await auctionAPI.createPayment(paymentData);

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Payment Successful!',
        html: `
          <div style="text-align: left; padding: 10px;">
            <p style="margin: 8px 0;"><strong>Payment ID:</strong> ${mockPaymentId}</p>
            <p style="margin: 8px 0;"><strong>Amount Paid:</strong> ₹${amount.toLocaleString()}</p>
            <p style="margin: 8px 0;"><strong>Auction:</strong> ${bid.auction?.auctionName || 'N/A'}</p>
            <p style="margin: 8px 0;"><strong>Farmer:</strong> ${bid.farmer?.fullName || 'N/A'}</p>
            <p style="margin: 12px 0 0 0; font-size: 13px; color: #10b981;">✓ Your payment has been processed successfully!</p>
          </div>
        `,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Done'
      });
    } catch (error) {
      console.error('Payment error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        html: `
          <div style="text-align: left; padding: 10px;">
            <p style="margin: 8px 0;"><strong>Error:</strong> ${error.response?.data?.message || 'Payment processing failed'}</p>
            <p style="margin: 12px 0 0 0; font-size: 13px; color: #ef4444;">Please try again or contact support if the issue persists.</p>
          </div>
        `,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Close'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your winning bids...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Winning Bids</h2>
          <p className="text-gray-600 mt-1">Completed auctions where you won with the highest bid</p>
        </div>
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold flex items-center space-x-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
          <span>{winningBids.length} Won</span>
                </div>
      </div>

      {/* No Winning Bids State */}
      {winningBids.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Winning Bids Yet</h3>
          <p className="text-gray-600">You haven't won any completed auctions yet. Keep bidding to win!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {winningBids.map((bid, index) => (
            <div key={bid._id || index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg border-2 border-green-300 overflow-hidden">
              {/* Winning Badge */}
              <div className="bg-green-500 px-4 py-2 flex items-center space-x-2">
                <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-white font-bold text-sm">🎉 YOU WON!</span>
              </div>

              {/* Card Content */}
              <div className="p-6">
                {/* Auction Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {bid.auction?.auctionName || bid.auction?.auctionTitle || 'Auction'}
                </h3>

                {/* Farmer Info */}
                <div className="bg-white rounded-lg p-4 mb-4 border border-green-200">
                  <p className="text-xs text-gray-500 mb-1">Farmer</p>
                  <p className="font-bold text-gray-900">{bid.farmer?.fullName || 'Unknown Farmer'}</p>
                  <p className="text-sm text-gray-600">{bid.farmer?.emailAddress || 'No email'}</p>
                </div>

                {/* Inventory Info */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-500 mb-1">Spice</p>
                    <p className="font-semibold text-gray-900 text-sm">{bid.inventoryItem?.spiceName || 'N/A'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-500 mb-1">Weight</p>
                    <p className="font-semibold text-gray-900 text-sm">{bid.inventoryItem?.weight || 0} kg</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-500 mb-1">Grade</p>
                    <p className="font-semibold text-gray-900 text-sm">{bid.inventoryItem?.grade || 'N/A'}</p>
                  </div>
                </div>

                {/* Your Winning Bid */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white mb-4">
                  <p className="text-green-100 text-sm mb-1">Your Winning Bid</p>
                  <p className="text-3xl font-bold">₹{(bid.currentBidPrice || 0).toLocaleString()}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-gray-500 mb-1">Total Bidders</p>
                    <p className="font-semibold text-gray-900">{bid.allBidsForInventory.length} competed</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Auction Ended</p>
                    <p className="font-semibold text-gray-900 text-xs">
                      {bid.auction?.endDate ? formatDate(bid.auction.endDate) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Success Message */}
                <div className="bg-green-100 border border-green-300 rounded-lg p-3 flex items-center space-x-2 mb-4">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-green-800 font-medium">
                    Congratulations! You won this auction with the highest bid.
                  </p>
                </div>

                {/* Payment Button */}
                {bid.paymentDone ? (
                  <button
                    disabled
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 shadow-md cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Payment Successful</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handlePayment(bid)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Make Payment</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          </div>
        )}
    </div>
  );
};

// Buyer Payments Page Component
const BuyerPaymentsPage = ({ user }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const buyerId = user?.id || user?._id;
        const paymentsData = await auctionAPI.getPaymentsByBuyerId(buyerId);
        
        // Fetch additional details for each payment
        const paymentsWithDetails = await Promise.all(
          (paymentsData || []).map(async (payment) => {
            let farmer = null;
            let auction = null;
            let inventory = null;

            // Fetch farmer details
            try {
              const farmerResponse = await authAPI.getFarmerById(payment.farmerId);
              if (farmerResponse?.data?.farmer) {
                farmer = farmerResponse.data.farmer;
              }
            } catch (error) {
              console.error('Error fetching farmer:', error);
            }

            // Fetch auction details
            try {
              const allAuctions = await auctionAPI.getAllAuctions();
              auction = allAuctions.find(a => (a._id || a.id) === payment.auctionId);
            } catch (error) {
              console.error('Error fetching auction:', error);
            }

            // Fetch inventory details
            try {
              inventory = await inventoryAPI.getInventoryItem(payment.inventoryId);
            } catch (error) {
              console.error('Error fetching inventory:', error);
            }

            return {
              ...payment,
              farmer,
              auction,
              inventory
            };
          })
        );

        setPayments(paymentsWithDetails);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Payment History</h2>
          <p className="text-gray-600 mt-1">View all payments made to farmers</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
          Total: {payments.length} Payment{payments.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* No Payments State */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payments Yet</h3>
          <p className="text-gray-600">You haven't made any payments yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {payments.map((payment, index) => (
            <div key={payment._id || index} className="bg-white rounded-xl shadow-lg border-2 border-blue-200 overflow-hidden hover:shadow-xl transition-shadow">
              {/* Payment Badge */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white font-bold text-sm">✓ PAYMENT COMPLETED</span>
                </div>
                <span className="text-white text-sm opacity-90">{formatDate(payment.createdAt || payment.paymentDate)}</span>
              </div>

              {/* Payment Details */}
              <div className="p-6">
                {/* Amount */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
                  <p className="text-blue-700 text-sm mb-1 font-medium">Amount Paid</p>
                  <p className="text-3xl font-bold text-blue-600">₹{(payment.amount || 0).toLocaleString()}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Farmer Info */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-xs text-green-600 mb-2 font-semibold">FARMER DETAILS</p>
                    <p className="font-bold text-gray-900">{payment.farmer?.fullName || 'Unknown Farmer'}</p>
                    <p className="text-sm text-gray-600">{payment.farmer?.contactNumber || 'No contact'}</p>
                  </div>

                  {/* Auction Info */}
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-xs text-purple-600 mb-2 font-semibold">AUCTION DETAILS</p>
                    <p className="font-bold text-gray-900">{payment.auction?.auctionName || payment.auction?.auctionTitle || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Status: {payment.auction?.status || 'Completed'}</p>
                  </div>
                </div>

                {/* Inventory Info */}
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <p className="text-xs text-amber-700 mb-2 font-semibold">PRODUCT DETAILS</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{payment.inventory?.spiceName || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Grade: {payment.inventory?.grade || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-700">{payment.inventory?.weight || 0} kg</p>
                    </div>
                  </div>
                </div>

                {/* Payment ID */}
                {payment.paymentId && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Payment ID</p>
                    <p className="text-sm font-mono text-gray-700">{payment.paymentId}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
