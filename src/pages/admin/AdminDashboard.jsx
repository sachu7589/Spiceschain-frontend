import React, { useState, useEffect } from 'react';
import { FaCog, FaSignOutAlt, FaUser, FaUsers, FaChartBar, FaShieldAlt, FaLeaf, FaBuilding, FaClipboardList, FaExclamationTriangle, FaCheckCircle, FaClock, FaDollarSign, FaBell, FaEye, FaEdit, FaTrash, FaWeight, FaRupeeSign, FaTimesCircle, FaRobot, FaGavel, FaTrophy, FaHistory, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { authAPI, inventoryAPI } from '../../services/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
        return <AdminDashboardOverview />;
      case 'farmers':
        return <ManageFarmers />;
      case 'buyers':
        return <ManageBuyers />;
      case 'inventory':
        return <InventoryOversight />;
      case 'auction-management':
        return <AuctionManagement onMenuClick={handleMenuClick} />;
      case 'create-auction':
        return <CreateAuction />;
      case 'ongoing-auctions':
        return <OngoingAuctions />;
      case 'auction-results':
        return <AuctionResults />;
      case 'auction-history':
        return <AuctionHistory />;
      default:
        return <AdminDashboardOverview user={user} />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { id: 'farmers', label: 'Manage Farmers', icon: 'leaf' },
    { id: 'buyers', label: 'Manage Buyers', icon: 'building' },
    { id: 'inventory', label: 'Inventory Oversight', icon: 'inventory' },
    { id: 'auction-management', label: 'Auction Management', icon: 'gavel' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      grid: (
        <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      leaf: <FaLeaf className="w-5 h-5" />,
      building: <FaBuilding className="w-5 h-5" />,
      inventory: <FaClipboardList className="w-5 h-5" />,
      gavel: <FaGavel className="w-5 h-5" />,
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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <FaCog className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  SpicesChain
                </span>
                <p className="text-xs text-gray-500 -mt-1">Admin Panel</p>
              </div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-white/60 hover:shadow-md transition-all duration-200 group"
          >
            <svg className={`w-5 h-5 transition-colors duration-200 ${
              sidebarCollapsed ? 'text-blue-600' : 'text-gray-600'
            } group-hover:text-blue-700`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className={`${sidebarCollapsed ? 'p-4' : 'p-6'} space-y-2`}>
          {menuItems.map((item) => {
            // Check if current menu should be active
            const isActive = activeMenu === item.id || 
              (item.id === 'auction-management' && ['create-auction', 'ongoing-auctions', 'auction-results', 'auction-history'].includes(activeMenu));
            
            return (
              <button
                key={item.id}
                onClick={() => item.action ? item.action() : handleMenuClick(item.id)}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-4'} ${sidebarCollapsed ? 'px-2 py-3' : 'px-4 py-3'} rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-50 text-blue-800 border border-blue-200 shadow-sm'
                    : 'text-gray-600 hover:bg-white/80 hover:text-gray-900 hover:shadow-md'
                }`}
              >
                <span className={`flex-shrink-0 ${sidebarCollapsed ? 'p-2' : 'p-2'} rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'bg-gray-100 group-hover:bg-blue-50 group-hover:shadow-sm'
                }`}>
                  {getIcon(item.icon)}
                </span>
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
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
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                {user.email ? user.email.charAt(0).toUpperCase() : 'A'}
              </div>
              {/* Admin Status Indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full flex items-center justify-center bg-blue-500">
                <FaCog className="w-2 h-2 text-white" />
              </div>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  Admin
                </p>
                <div className="flex items-center mt-1 space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    admin
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
                Welcome back, <span className="font-semibold text-gray-900">{user.email}</span>! 👋
              </p>
            </div>
            <div className="flex items-center space-x-6">
              {/* Refresh Button */}
              {activeMenu === 'dashboard' && (
                <button 
                  onClick={() => window.location.reload()}
                  className="p-3 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:bg-white/60 rounded-xl"
                  title="Refresh Dashboard"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
              
              {/* Notifications */}
              <button className="relative p-3 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:bg-white/60 rounded-xl">
                <FaBell className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              
              {/* User Menu */}
              <div className="flex items-center space-x-4 p-3 bg-white/60 rounded-xl border border-white/30">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Admin
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'A'}
                  </div>
                  {/* Admin Status Indicator */}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full flex items-center justify-center bg-blue-500">
                    <FaCog className="w-1.5 h-1.5 text-white" />
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

// Admin Dashboard Content Components
const AdminDashboardOverview = () => {
  const [farmers, setFarmers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [farmersResponse, buyersResponse] = await Promise.all([
        authAPI.getAllFarmers(),
        authAPI.getAllBuyers()
      ]);
      
      setFarmers(farmersResponse.data.farmers || []);
      setBuyers(buyersResponse.data.buyers || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate real metrics from fetched data
  const verifiedFarmers = farmers.filter(farmer => farmer.isVerified).length;
  const verifiedBuyers = buyers.filter(buyer => buyer.isVerified).length;
  const totalVerified = verifiedFarmers + verifiedBuyers;
  const pendingVerificationsCount = farmers.filter(f => !f.isVerified).length + buyers.filter(b => !b.isVerified).length;


  // Get recent registrations (last 5 from both farmers and buyers)
  const getRecentRegistrations = () => {
    const allUsers = [
      ...farmers.map(farmer => ({
        id: farmer._id,
        name: farmer.fullName,
        type: 'Farmer',
        email: farmer.emailAddress,
        registered: farmer.createdAt,
        status: farmer.isVerified ? 'verified' : 'pending'
      })),
      ...buyers.map(buyer => ({
        id: buyer._id,
        name: buyer.fullName,
        type: 'Buyer',
        email: buyer.emailAddress,
        registered: buyer.createdAt,
        status: buyer.isVerified ? 'verified' : 'pending'
      }))
    ];
    
    return allUsers
      .sort((a, b) => new Date(b.registered) - new Date(a.registered))
      .slice(0, 5)
      .map(user => ({
        ...user,
        registered: getTimeAgo(new Date(user.registered))
      }));
  };

  // Get pending verifications
  const getPendingVerifications = () => {
    const unverifiedFarmers = farmers
      .filter(farmer => !farmer.isVerified)
      .map(farmer => ({
        id: farmer._id,
        name: farmer.fullName,
        email: farmer.emailAddress,
        phone: farmer.contactNumber,
        type: 'Farmer',
        submitted: getTimeAgo(new Date(farmer.createdAt)),
        status: 'pending',
        documents: 'Aadhaar, Land Certificate',
        userData: farmer
      }));

    const unverifiedBuyers = buyers
      .filter(buyer => !buyer.isVerified)
      .map(buyer => ({
        id: buyer._id,
        name: buyer.fullName,
        email: buyer.emailAddress,
        phone: buyer.contactNumber,
        type: 'Buyer',
        submitted: getTimeAgo(new Date(buyer.createdAt)),
        status: 'pending',
        documents: 'PAN, Business License',
        userData: buyer
      }));

    return [...unverifiedFarmers, ...unverifiedBuyers]
      .sort((a, b) => new Date(b.submitted) - new Date(a.submitted))
      .slice(0, 4);
  };

  // Helper function to get time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  };

  // System stats with real data
  const systemStats = [
    { label: 'Verified Users', value: totalVerified.toLocaleString(), icon: FaCheckCircle, color: 'green' },
    { label: 'Pending Verifications', value: pendingVerificationsCount.toLocaleString(), icon: FaShieldAlt, color: 'orange' },
    { label: 'Total Farmers', value: farmers.length.toLocaleString(), icon: FaLeaf, color: 'green' },
    { label: 'Total Buyers', value: buyers.length.toLocaleString(), icon: FaBuilding, color: 'blue' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }


  const recentRegistrations = getRecentRegistrations();
  const pendingVerifications = getPendingVerifications();

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                  <IconComponent className={`text-2xl text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verification Status */}
      <div className="space-y-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900">Verification Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Verified Users Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-green-100">
                <FaCheckCircle className="text-2xl text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">Verified Users</h4>
                <p className="text-3xl font-bold text-green-600 mt-1">{totalVerified}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span>Farmers: {verifiedFarmers}</span>
                  <span>Buyers: {verifiedBuyers}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Verification Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-yellow-100">
                <FaShieldAlt className="text-2xl text-yellow-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">Pending Verification</h4>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingVerificationsCount}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span>Farmers: {farmers.filter(f => !f.isVerified).length}</span>
                  <span>Buyers: {buyers.filter(b => !b.isVerified).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Auction Details */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Active Auctions</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Premium Turmeric</h4>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Farmer: Rajesh Kumar</span>
                <span>12 bidders</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-bold text-green-600">₹2,450/kg</span>
                <span className="text-sm text-gray-500">2h 15m left</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Organic Cardamom</h4>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Farmer: Priya Sharma</span>
                <span>8 bidders</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-bold text-green-600">₹1,850/kg</span>
                <span className="text-sm text-gray-500">45m left</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Black Pepper</h4>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Farmer: Amit Patel</span>
                <span>15 bidders</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-bold text-green-600">₹3,200/kg</span>
                <span className="text-sm text-gray-500">5h 30m left</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Cinnamon Sticks</h4>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Completed
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Farmer: Suresh Reddy</span>
                <span>6 bidders</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-bold text-green-600">₹1,200/kg</span>
                <span className="text-sm text-gray-500">Ended</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Registrations</h3>
          </div>
          <div className="space-y-4">
            {recentRegistrations.map((registration) => (
              <div key={registration.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  registration.type === 'Farmer' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {registration.type === 'Farmer' ? 
                    <FaLeaf className="text-green-600" /> : 
                    <FaBuilding className="text-blue-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{registration.name}</p>
                  <p className="text-sm text-gray-600">{registration.email}</p>
                  <p className="text-xs text-gray-500">{registration.registered}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                  {registration.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Verifications */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Pending Verifications</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingVerifications.map((verification) => (
                <tr key={verification.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{verification.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{verification.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{verification.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      verification.type === 'Farmer' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {verification.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{verification.submitted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

// Aadhaar Details Modal Component
const AadhaarModal = ({ isOpen, onClose, user, verificationData, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Aadhaar Verification Details</h2>
              <p className="text-gray-600">{user?.fullName} ({user?.userType})</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : verificationData ? (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-gray-900">{verificationData.userId.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{verificationData.userId.emailAddress}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Contact</label>
                    <p className="text-gray-900">{verificationData.userId.contactNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">User Type</label>
                    <p className="text-gray-900 capitalize">{verificationData.userId.userType}</p>
                  </div>
                </div>
              </div>

              {/* Aadhaar Data */}
              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Aadhaar Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Aadhaar Number</label>
                    <p className="text-gray-900 font-mono">{verificationData.aadhaarData.aadhaar_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900">{verificationData.aadhaarData.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Father's Name</label>
                    <p className="text-gray-900">{verificationData.aadhaarData.father_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Mother's Name</label>
                    <p className="text-gray-900">{verificationData.aadhaarData.mother_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                    <p className="text-gray-900">{verificationData.aadhaarData.date_of_birth}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Gender</label>
                    <p className="text-gray-900">{verificationData.aadhaarData.gender}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-gray-900">{verificationData.aadhaarData.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pin Code</label>
                    <p className="text-gray-900">{verificationData.aadhaarData.pin_code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">State</label>
                    <p className="text-gray-900">{verificationData.aadhaarData.state}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">District</label>
                    <p className="text-gray-900">{verificationData.aadhaarData.district}</p>
                  </div>
                </div>
              </div>

              {/* Verification Info */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Verification Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created At</label>
                    <p className="text-gray-900">{new Date(verificationData.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Updated At</label>
                    <p className="text-gray-900">{new Date(verificationData.updatedAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Verified At</label>
                    <p className="text-gray-900">{new Date(verificationData.verifiedAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : verificationData === 'API_ERROR' ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">API Error</h3>
              <p className="text-gray-600 mb-4">Unable to fetch Aadhaar verification details due to a server error.</p>
              <p className="text-sm text-gray-500">Please try again later or contact the administrator.</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unverified</h3>
              <p className="text-gray-600">This user has not completed Aadhaar verification yet.</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Manage Farmers Component
const ManageFarmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAllFarmers();
      setFarmers(response.data.farmers);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = farmer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farmer.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farmer.contactNumber.includes(searchTerm);
    
    const matchesVerification = verificationFilter === 'all' || 
                               (verificationFilter === 'verified' && farmer.isVerified) ||
                               (verificationFilter === 'unverified' && !farmer.isVerified);
    
    return matchesSearch && matchesVerification;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading farmers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Farmers</h1>
          <p className="text-gray-600">View and manage all registered farmers</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {farmers.length} farmers
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Farmers</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Farmers Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFarmers.map((farmer) => (
                <tr key={farmer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FaLeaf className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{farmer.fullName}</div>
                        <div className="text-sm text-gray-500">{farmer.emailAddress}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{farmer.contactNumber}</div>
                    <div className="text-sm text-gray-500">WhatsApp: {farmer.whatsappNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{farmer.district}, {farmer.state}</div>
                    <div className="text-sm text-gray-500">{farmer.pincode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {farmer.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(farmer.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      farmer.isVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {farmer.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className="text-gray-400">-</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredFarmers.length === 0 && (
          <div className="text-center py-8">
            <FaLeaf className="text-gray-400 text-4xl mx-auto mb-2" />
            <p className="text-gray-500">No farmers found</p>
          </div>
        )}
      </div>

    </div>
  );
};

// Manage Buyers Component
const ManageBuyers = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');

  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAllBuyers();
      setBuyers(response.data.buyers);
    } catch (error) {
      console.error('Error fetching buyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBuyers = buyers.filter(buyer => {
    const matchesSearch = buyer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         buyer.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         buyer.contactNumber.includes(searchTerm) ||
                         buyer.businessName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVerification = verificationFilter === 'all' || 
                               (verificationFilter === 'verified' && buyer.isVerified) ||
                               (verificationFilter === 'unverified' && !buyer.isVerified);
    
    return matchesSearch && matchesVerification;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading buyers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Buyers</h1>
          <p className="text-gray-600">View and manage all registered buyers</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {buyers.length} buyers
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, email, phone, or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Buyers</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Buyers Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBuyers.map((buyer) => (
                <tr key={buyer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaBuilding className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{buyer.fullName}</div>
                        <div className="text-sm text-gray-500">{buyer.emailAddress}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{buyer.businessName}</div>
                    <div className="text-sm text-gray-500 capitalize">{buyer.businessType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {buyer.contactNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{buyer.city}, {buyer.state}</div>
                    <div className="text-sm text-gray-500">{buyer.pincode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {buyer.yearsInBusiness} years
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(buyer.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      buyer.isVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {buyer.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className="text-gray-400">-</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBuyers.length === 0 && (
          <div className="text-center py-8">
            <FaBuilding className="text-gray-400 text-4xl mx-auto mb-2" />
            <p className="text-gray-500">No buyers found</p>
          </div>
        )}
      </div>

    </div>
  );
};

// Inventory Oversight Component
const InventoryOversight = () => {
  const [allInventory, setAllInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [farmerFilter, setFarmerFilter] = useState('all');

  useEffect(() => {
    fetchAllInventory();
  }, []);

  const fetchAllInventory = async () => {
    try {
      setLoading(true);
      // Fetch all farmers first to get their inventory
      const farmersResponse = await authAPI.getAllFarmers();
      const farmers = farmersResponse.data.farmers || [];
      
      // Fetch inventory for each farmer
      const allInventoryData = [];
      for (const farmer of farmers) {
        try {
          const inventoryResponse = await inventoryAPI.getInventoryByUser(farmer._id);
          if (inventoryResponse && inventoryResponse.length > 0) {
            const inventoryWithFarmer = inventoryResponse.map(item => ({
              ...item,
              farmerName: farmer.fullName,
              farmerEmail: farmer.emailAddress,
              farmerId: farmer._id,
              farmerLocation: `${farmer.district}, ${farmer.state}`
            }));
            allInventoryData.push(...inventoryWithFarmer);
          }
        } catch (error) {
          console.error(`Error fetching inventory for farmer ${farmer.fullName}:`, error);
        }
      }
      
      setAllInventory(allInventoryData);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = allInventory.filter(item => {
    const matchesSearch = (item.spiceName || item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.farmerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (item.status || 'available') === statusFilter;
    const matchesFarmer = farmerFilter === 'all' || item.farmerId === farmerFilter;
    
    return matchesSearch && matchesStatus && matchesFarmer;
  });


  const handleViewDetails = (item) => {
    console.log('View details for item:', item);
  };

  // Calculate total inventory metrics
  const totalWeight = allInventory.reduce((sum, item) => sum + (item.weight || 0), 0);
  const totalValue = allInventory.reduce((sum, item) => {
    if (item.status === 'sold' || !item.grade || !item.weight) return sum;
    // Simple price calculation based on grade
    let pricePerKg = 0;
    switch (item.grade?.toUpperCase()) {
      case 'A': pricePerKg = 2600; break;
      case 'B': pricePerKg = 2583; break;
      case 'C': pricePerKg = 2565; break;
      default: pricePerKg = 2583;
    }
    return sum + (pricePerKg * item.weight);
  }, 0);
  
  const availableItems = allInventory.filter(item => item.status === 'available').length;
  const soldItems = allInventory.filter(item => item.status === 'sold').length;

  // Get unique farmers for filter
  const uniqueFarmers = [...new Set(allInventory.map(item => item.farmerId))]
    .map(farmerId => {
      const item = allInventory.find(i => i.farmerId === farmerId);
      return { id: farmerId, name: item?.farmerName || 'Unknown' };
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Oversight</h1>
          <p className="text-gray-600">View and manage all farmers' submitted stock</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {allInventory.length} items from {uniqueFarmers.length} farmers
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Weight</p>
              <p className="text-3xl font-bold">{totalWeight.toFixed(1)} kg</p>
            </div>
            <FaWeight className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Value</p>
              <p className="text-3xl font-bold">₹{totalValue.toLocaleString()}</p>
            </div>
            <FaRupeeSign className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Available Items</p>
              <p className="text-3xl font-bold">{availableItems}</p>
            </div>
            <FaCheckCircle className="w-8 h-8 text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm font-medium">Sold Items</p>
              <p className="text-3xl font-bold">{soldItems}</p>
            </div>
            <FaTimesCircle className="w-8 h-8 text-gray-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by spice name or farmer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Farmer</label>
            <select
              value={farmerFilter}
              onChange={(e) => setFarmerFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Farmers</option>
              {uniqueFarmers.map(farmer => (
                <option key={farmer.id} value={farmer.id}>{farmer.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item._id || item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FaLeaf className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.spiceName || item.name}</div>
                        {item.spiceImage && (
                          <img 
                            src={item.spiceImage.startsWith('http') ? item.spiceImage : `http://localhost:3001${item.spiceImage}`}
                            alt={item.spiceName}
                            className="w-8 h-8 object-cover rounded mt-1"
                          />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.farmerName}</div>
                    <div className="text-sm text-gray-500">{item.farmerEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.weight} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.grade === 'A' ? 'bg-green-100 text-green-800' :
                      item.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                      item.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      Grade {item.grade || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.farmerLocation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'available' ? 'bg-green-100 text-green-800' :
                      item.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'available' ? 'Available' :
                       item.status === 'sold' ? 'Sold' :
                       'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FaEye className="inline mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredInventory.length === 0 && (
          <div className="text-center py-8">
            <FaClipboardList className="text-gray-400 text-4xl mx-auto mb-2" />
            <p className="text-gray-500">No inventory items found</p>
          </div>
        )}
      </div>

    </div>
  );
};

// Auction Management Components
const AuctionManagement = ({ onMenuClick }) => {
  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    description: '',
    incrementValue: ''
  });

  const subMenus = [
    { id: 'create-auction', label: 'Create Auction', icon: FaGavel, description: 'Set spice type, schedule, minimum bid price, and rules' },
    { id: 'ongoing-auctions', label: 'Ongoing Auctions', icon: FaClock, description: 'Monitor live bids and intervene if needed' },
    { id: 'auction-results', label: 'Auction Results', icon: FaTrophy, description: 'View winners and settlement status' },
    { id: 'auction-history', label: 'Auction History & Reports', icon: FaHistory, description: 'All past auctions with analytics' },
  ];

  useEffect(() => {
    fetchUpcomingAuctions();
  }, []);

  const fetchUpcomingAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3002/api/auctions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch auctions');
      }
      
      const data = await response.json();
      
      // Filter upcoming auctions (status: upcoming or start date in future)
      const upcoming = data.filter(auction => {
        const now = new Date();
        const startDateTime = new Date(auction.startDate);
        return auction.status === 'upcoming' || startDateTime > now;
      });
      
      setUpcomingAuctions(upcoming);
    } catch (error) {
      console.error('Error fetching upcoming auctions:', error);
      setError('Failed to load upcoming auctions');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString, timeString) => {
    // Parse the date string directly without timezone conversion
    const date = new Date(dateString);
    const time = timeString || '00:00';
    const [hours, minutes] = time.split(':');
    
    // Create a new date with the correct date and time
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    
    const localDate = new Date(year, month, day, parseInt(hours), parseInt(minutes));
    
    return localDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilStart = (startDate, startTime) => {
    const now = new Date();
    const date = new Date(startDate);
    const [hours, minutes] = (startTime || '00:00').split(':');
    
    // Create a new date with the correct date and time (UTC to local)
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    
    const startDateTime = new Date(year, month, day, parseInt(hours), parseInt(minutes));
    
    const diff = startDateTime - now;
    
    if (diff <= 0) return 'Starting soon';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hoursLeft}h`;
    } else if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m`;
    } else {
      return `${minutesLeft}m`;
    }
  };

  const handleViewDetails = (auction) => {
    setSelectedAuction(auction);
    setModalOpen(true);
  };

  const handleEditAuction = (auction) => {
    setSelectedAuction(auction);
    setEditFormData({
      description: auction.description || '',
      incrementValue: auction.incrementValue || ''
    });
    setEditModalOpen(true);
    setModalOpen(false); // Close details modal if open
  };

  const handleDeleteAuction = async (auction) => {
    if (confirm(`Are you sure you want to delete the auction "${auction.auctionTitle}"?`)) {
      try {
        const response = await fetch(`http://localhost:3002/api/auctions/${auction._id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert('Auction deleted successfully!');
          fetchUpcomingAuctions(); // Refresh the list
        } else {
          throw new Error('Failed to delete auction');
        }
      } catch (error) {
        console.error('Error deleting auction:', error);
        alert('Error deleting auction. Please try again.');
      }
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAuction) return;

    try {
      const response = await fetch(`http://localhost:3002/api/auctions/${selectedAuction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: editFormData.description,
          incrementValue: parseInt(editFormData.incrementValue)
        })
      });

      if (response.ok) {
        alert('Auction updated successfully!');
        setEditModalOpen(false);
        fetchUpcomingAuctions(); // Refresh the list
      } else {
        throw new Error('Failed to update auction');
      }
    } catch (error) {
      console.error('Error updating auction:', error);
      alert('Error updating auction. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auction Management</h1>
          <p className="text-gray-600">Manage spice auctions, monitor bids, and track results</p>
        </div>
      </div>

      {/* Sub-menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subMenus.map((menu) => {
          const IconComponent = menu.icon;
          return (
            <button
              key={menu.id}
              onClick={() => onMenuClick(menu.id)}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left group"
            >
              <div className="flex items-start space-x-4">
                <div className="p-4 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <IconComponent className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{menu.label}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{menu.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>


      {/* Upcoming Auctions Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Upcoming Auctions</h2>
            <p className="text-gray-600">Auctions scheduled to start soon</p>
          </div>
          <button
            onClick={fetchUpcomingAuctions}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading upcoming auctions...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchUpcomingAuctions}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        ) : upcomingAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingAuctions.map((auction) => (
              <div key={auction._id || auction.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{auction.auctionTitle}</h3>
                    <p className="text-sm text-gray-600 mb-2">{auction.description}</p>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {auction.spiceType}
                      </span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                        {auction.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Starts:</span>
                    <span className="font-medium">{formatDateTime(auction.startDate, auction.startTime)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ends:</span>
                    <span className="font-medium">{formatDateTime(auction.endDate, auction.endTime)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Increment:</span>
                    <span className="font-medium text-green-600">₹{auction.incrementValue}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Time until start:</span>
                    <span className="font-medium text-orange-600">{getTimeUntilStart(auction.startDate, auction.startTime)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleViewDetails(auction)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors mr-2"
                    >
                      View Details
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditAuction(auction)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Auction"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAuction(auction)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Auction"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaClock className="text-gray-400 text-4xl mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Upcoming Auctions</h3>
            <p className="text-gray-600">There are no auctions scheduled to start soon.</p>
          </div>
        )}
      </div>

      {/* Auction Details Modal */}
      {modalOpen && selectedAuction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Auction Details</h2>
                  <p className="text-gray-600">{selectedAuction.auctionTitle}</p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Auction Title:</span>
                        <span className="font-medium">{selectedAuction.auctionTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Spice Type:</span>
                        <span className="font-medium">{selectedAuction.spiceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                          {selectedAuction.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Increment Value:</span>
                        <span className="font-medium text-green-600">₹{selectedAuction.incrementValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Bid:</span>
                        <span className="font-medium text-blue-600">₹{selectedAuction.currentBid || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">{formatDateTime(selectedAuction.startDate, selectedAuction.startTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium">{formatDateTime(selectedAuction.endDate, selectedAuction.endTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Until Start:</span>
                        <span className="font-medium text-orange-600">{getTimeUntilStart(selectedAuction.startDate, selectedAuction.startTime)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-6">
                  <div className="bg-green-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                    <p className="text-gray-700">{selectedAuction.description}</p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600 text-sm">Blockchain Hash:</span>
                        <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                          {selectedAuction.blockchainHash || 'Not available'}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium text-sm">
                          {new Date(selectedAuction.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Auction Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Winner:</span>
                        <span className="font-medium">{selectedAuction.winner || 'Not determined'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Bids:</span>
                        <span className="font-medium">{selectedAuction.totalBids || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleEditAuction(selectedAuction)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <FaEdit className="w-4 h-4" />
                  <span>Edit Auction</span>
                </button>
                <button
                  onClick={() => handleDeleteAuction(selectedAuction)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <FaTrash className="w-4 h-4" />
                  <span>Delete Auction</span>
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Auction Modal */}
      {editModalOpen && selectedAuction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Auction</h2>
                  <p className="text-gray-600">{selectedAuction.auctionTitle}</p>
                </div>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Description Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditFormChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Enter auction description..."
                      required
                    />
                  </div>

                  {/* Increment Value Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Increment Value (₹)
                    </label>
                    <input
                      type="number"
                      name="incrementValue"
                      value={editFormData.incrementValue}
                      onChange={handleEditFormChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter minimum bid increment..."
                      required
                    />
                  </div>
                </div>

                {/* Read-only Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Auction Information (Read-only)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Auction Title:</span>
                      <p className="font-medium">{selectedAuction.auctionTitle}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Spice Type:</span>
                      <p className="font-medium">{selectedAuction.spiceType}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Start Date:</span>
                      <p className="font-medium">{formatDateTime(selectedAuction.startDate, selectedAuction.startTime)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">End Date:</span>
                      <p className="font-medium">{formatDateTime(selectedAuction.endDate, selectedAuction.endTime)}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <FaEdit className="w-4 h-4" />
                    <span>Update Auction</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Create Auction Component
const CreateAuction = () => {
  const [formData, setFormData] = useState({
    spiceType: 'Cardamom',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    incrementValue: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const spiceTypes = ['Cardamom']; // Only Cardamom for first phase

  // Get tomorrow's date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum end date (3 days after start date)
  const getMaxEndDate = (startDate) => {
    if (!startDate) return '';
    const maxDate = new Date(startDate);
    maxDate.setDate(maxDate.getDate() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  // Validation functions
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'title':
        if (!value.trim()) {
          newErrors.title = 'Auction title is required';
        } else if (value.trim().length < 5) {
          newErrors.title = 'Title must be at least 5 characters';
        } else {
          delete newErrors.title;
        }
        break;
        
      case 'description':
        if (!value.trim()) {
          newErrors.description = 'Description is required';
        } else if (value.trim().length < 10) {
          newErrors.description = 'Description must be at least 10 characters';
        } else {
          delete newErrors.description;
        }
        break;
        
      case 'startDate':
        if (!value) {
          newErrors.startDate = 'Start date is required';
        } else {
          const tomorrow = getTomorrowDate();
          if (value < tomorrow) {
            newErrors.startDate = 'Start date must be tomorrow or later';
          } else {
            delete newErrors.startDate;
          }
        }
        break;
        
      case 'endDate':
        if (!value) {
          newErrors.endDate = 'End date is required';
        } else if (formData.startDate && value < formData.startDate) {
          newErrors.endDate = 'End date cannot be before start date';
        } else if (formData.startDate) {
          const maxDate = getMaxEndDate(formData.startDate);
          if (value > maxDate) {
            newErrors.endDate = 'End date cannot be more than 3 days after start date';
          } else {
            delete newErrors.endDate;
          }
        } else {
          delete newErrors.endDate;
        }
        break;
        
      case 'startTime':
        if (!value) {
          newErrors.startTime = 'Start time is required';
        } else {
          delete newErrors.startTime;
        }
        break;
        
      case 'endTime':
        if (!value) {
          newErrors.endTime = 'End time is required';
        } else if (formData.startDate === formData.endDate && formData.startTime && value <= formData.startTime) {
          newErrors.endTime = 'End time must be after start time';
        } else {
          delete newErrors.endTime;
        }
        break;
        
      case 'incrementValue':
        if (!value) {
          newErrors.incrementValue = 'Increment value is required';
        } else if (isNaN(value) || parseFloat(value) <= 0) {
          newErrors.incrementValue = 'Increment value must be a positive number';
        } else if (parseFloat(value) < 10) {
          newErrors.incrementValue = 'Increment value must be at least ₹10';
        } else {
          delete newErrors.incrementValue;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate all fields before submission
      const requiredFields = ['title', 'description', 'startDate', 'endDate', 'startTime', 'endTime', 'incrementValue'];
      let hasErrors = false;
      
      requiredFields.forEach(field => {
        if (!formData[field]) {
          validateField(field, formData[field]);
          hasErrors = true;
        }
      });
      
      if (hasErrors) {
        setLoading(false);
        return;
      }

      // Prepare data for API call
      const auctionData = {
        spiceType: formData.spiceType,
        auctionTitle: formData.title,
        startDate: formData.startDate,
        startTime: formData.startTime,
        endDate: formData.endDate,
        endTime: formData.endTime,
        incrementValue: parseInt(formData.incrementValue),
        description: formData.description
      };

      console.log('Creating auction:', auctionData);

      // Make API call to create auction
      const response = await fetch('http://localhost:3002/api/auctions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auctionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create auction');
      }

      const result = await response.json();
      console.log('Auction created successfully:', result);
      
      alert('Auction created successfully!');
      setFormData({
        spiceType: 'Cardamom',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        incrementValue: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating auction:', error);
      alert(`Error creating auction: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Auction</h1>
          <p className="text-gray-600">Set up a new spice auction with all necessary details</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Spice Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Spice Type *</label>
              <select
                name="spiceType"
                value={formData.spiceType}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {spiceTypes.map(spice => (
                  <option key={spice} value={spice}>{spice}</option>
                ))}
              </select>
            </div>

            {/* Auction Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Auction Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., Premium Cardamom - Grade A"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Start Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                onBlur={handleBlur}
                min={getTomorrowDate()}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.startTime ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
              )}
            </div>

            {/* End Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                onBlur={handleBlur}
                min={formData.startDate || getTomorrowDate()}
                max={formData.startDate ? getMaxEndDate(formData.startDate) : ''}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.endTime ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
              )}
            </div>

            {/* Increment Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Increment Value (₹) *</label>
              <input
                type="number"
                name="incrementValue"
                value={formData.incrementValue}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="50"
                min="10"
                step="1"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.incrementValue ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.incrementValue && (
                <p className="mt-1 text-sm text-red-600">{errors.incrementValue}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Describe the spice quality, origin, and any special features..."
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>{loading ? 'Creating...' : 'Create Auction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Ongoing Auctions Component
const OngoingAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3002/api/auctions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch auctions');
      }
      
      const data = await response.json();
      
      // Filter only active/ongoing auctions
      const activeAuctions = data.filter(auction => {
        const now = new Date();
        const startDateTime = new Date(`${auction.startDate}T${auction.startTime}`);
        const endDateTime = new Date(`${auction.endDate}T${auction.endTime}`);
        
        return now >= startDateTime && now <= endDateTime;
      });
      
      setAuctions(activeAuctions);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      setError('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeLeft = (endDate, endTime) => {
    const now = new Date();
    const endDateTime = new Date(`${endDate}T${endTime}`);
    const diff = endDateTime - now;
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const handleIntervene = (auctionId) => {
    if (confirm('Are you sure you want to intervene in this auction?')) {
      console.log('Intervening in auction:', auctionId);
      // Implement intervention logic
    }
  };

  const handleEndAuction = (auctionId) => {
    if (confirm('Are you sure you want to end this auction early?')) {
      console.log('Ending auction:', auctionId);
      // Implement end auction logic
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading auctions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Auctions</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchAuctions}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ongoing Auctions</h1>
          <p className="text-gray-600">Monitor live bids and manage active auctions</p>
        </div>
        <div className="text-sm text-gray-500">
          {auctions.length} active auctions
        </div>
      </div>

      {/* Auctions List */}
      <div className="space-y-4">
        {auctions.map((auction) => (
          <div key={auction._id || auction.id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{auction.auctionTitle}</h3>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <span>Spice: {auction.spiceType}</span>
                  <span>Increment: ₹{auction.incrementValue}</span>
                  <span>Ends: {new Date(`${auction.endDate}T${auction.endTime}`).toLocaleString()}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">₹{auction.currentBid || '0'}</div>
                <div className="text-sm text-gray-500">Current Bid</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Time Left</div>
                <div className="text-lg font-semibold text-orange-600">
                  {calculateTimeLeft(auction.endDate, auction.endTime)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Bidders</div>
                <div className="text-lg font-semibold text-blue-600">{auction.bidders || 0}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Increment</div>
                <div className="text-lg font-semibold text-gray-900">₹{auction.incrementValue}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Spice Type</div>
                <div className="text-lg font-semibold text-purple-600">{auction.spiceType}</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleIntervene(auction._id || auction.id)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                >
                  <FaExclamationTriangle className="w-4 h-4" />
                  <span>Intervene</span>
                </button>
                <button
                  onClick={() => handleEndAuction(auction._id || auction.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <FaTimesCircle className="w-4 h-4" />
                  <span>End Auction</span>
                </button>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <FaEye className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {auctions.length === 0 && (
        <div className="text-center py-12">
          <FaClock className="text-gray-400 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Auctions</h3>
          <p className="text-gray-600">There are currently no ongoing auctions.</p>
        </div>
      )}
    </div>
  );
};

// Auction Results Component
const AuctionResults = () => {
  const [results, setResults] = useState([
    {
      id: 1,
      title: 'Premium Cardamom - Grade A',
      farmer: 'Rajesh Kumar',
      winner: 'Spice Traders Ltd',
      finalBid: 3200,
      quantity: '50 kg',
      status: 'settled',
      endDate: '2024-01-15',
      commission: 160
    },
    {
      id: 2,
      title: 'Organic Turmeric',
      farmer: 'Priya Sharma',
      winner: 'Organic Foods Co',
      finalBid: 2100,
      quantity: '100 kg',
      status: 'pending',
      endDate: '2024-01-14',
      commission: 105
    },
    {
      id: 3,
      title: 'Black Pepper - Premium',
      farmer: 'Amit Patel',
      winner: 'Export House',
      finalBid: 3800,
      quantity: '75 kg',
      status: 'settled',
      endDate: '2024-01-13',
      commission: 190
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'settled': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSettle = (resultId) => {
    if (confirm('Mark this auction as settled?')) {
      setResults(results.map(r => 
        r.id === resultId ? {...r, status: 'settled'} : r
      ));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auction Results</h1>
          <p className="text-gray-600">View winners and manage settlement status</p>
        </div>
        <div className="text-sm text-gray-500">
          {results.length} completed auctions
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Settled</p>
              <p className="text-3xl font-bold">{results.filter(r => r.status === 'settled').length}</p>
            </div>
            <FaCheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold">{results.filter(r => r.status === 'pending').length}</p>
            </div>
            <FaClock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold">₹{results.reduce((sum, r) => sum + r.finalBid, 0).toLocaleString()}</p>
            </div>
            <FaRupeeSign className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Commission</p>
              <p className="text-3xl font-bold">₹{results.reduce((sum, r) => sum + r.commission, 0).toLocaleString()}</p>
            </div>
            <FaChartBar className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Winner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Bid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{result.title}</div>
                      <div className="text-sm text-gray-500">Farmer: {result.farmer}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.winner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{result.finalBid}</div>
                    <div className="text-sm text-gray-500">Commission: ₹{result.commission}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                      {result.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(result.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {result.status === 'pending' && (
                      <button
                        onClick={() => handleSettle(result.id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Settle
                      </button>
                    )}
                    <button className="text-blue-600 hover:text-blue-900">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Auction History Component
const AuctionHistory = () => {
  const [history] = useState([
    {
      id: 1,
      title: 'Premium Cardamom - Grade A',
      farmer: 'Rajesh Kumar',
      winner: 'Spice Traders Ltd',
      finalBid: 3200,
      quantity: '50 kg',
      endDate: '2024-01-15',
      duration: '24h',
      totalBids: 45,
      revenue: 160000
    },
    {
      id: 2,
      title: 'Organic Turmeric',
      farmer: 'Priya Sharma',
      winner: 'Organic Foods Co',
      finalBid: 2100,
      quantity: '100 kg',
      endDate: '2024-01-14',
      duration: '18h',
      totalBids: 32,
      revenue: 210000
    },
    {
      id: 3,
      title: 'Black Pepper - Premium',
      farmer: 'Amit Patel',
      winner: 'Export House',
      finalBid: 3800,
      quantity: '75 kg',
      endDate: '2024-01-13',
      duration: '36h',
      totalBids: 67,
      revenue: 285000
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'high-value') return item.finalBid > 3000;
    if (filter === 'recent') return new Date(item.endDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return true;
  });

  const totalRevenue = history.reduce((sum, item) => sum + item.revenue, 0);
  const totalBids = history.reduce((sum, item) => sum + item.totalBids, 0);
  const averageBid = totalBids > 0 ? (totalRevenue / totalBids).toFixed(0) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auction History & Reports</h1>
          <p className="text-gray-600">Analytics and insights from past auctions</p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Auctions</p>
              <p className="text-3xl font-bold">{history.length}</p>
            </div>
            <FaGavel className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold">₹{(totalRevenue / 100000).toFixed(1)}L</p>
            </div>
            <FaRupeeSign className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Bids</p>
              <p className="text-3xl font-bold">{totalBids}</p>
            </div>
            <FaChartLine className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Avg Bid</p>
              <p className="text-3xl font-bold">₹{averageBid}</p>
            </div>
            <FaChartBar className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Auctions</option>
                <option value="high-value">High Value (&gt;₹3000)</option>
              <option value="recent">Last 7 Days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Winner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Bid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bids</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500">Farmer: {item.farmer}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.winner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{item.finalBid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.totalBids}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ₹{item.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.endDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FaChartLine className="w-12 h-12 mx-auto mb-2" />
              <p>Chart visualization would go here</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spice Type Distribution</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FaChartBar className="w-12 h-12 mx-auto mb-2" />
              <p>Pie chart visualization would go here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
