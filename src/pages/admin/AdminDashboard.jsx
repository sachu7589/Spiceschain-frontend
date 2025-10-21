import React, { useState, useEffect } from 'react';
import { FaCog, FaSignOutAlt, FaUser, FaUsers, FaChartBar, FaShieldAlt, FaLeaf, FaBuilding, FaClipboardList, FaExclamationTriangle, FaCheckCircle, FaClock, FaDollarSign, FaBell, FaEye, FaEdit, FaTrash, FaWeight, FaRupeeSign, FaTimesCircle, FaRobot, FaGavel, FaTrophy, FaHistory, FaChartLine, FaTimes, FaRedo, FaBox, FaExclamationTriangle as FaWarning } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { authAPI, inventoryAPI, auctionAPI } from '../../services/api';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', animating: false });

  // Function to show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type, animating: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, animating: false }));
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success', animating: false });
      }, 300);
    }, 4000);
  };

  // Function to dismiss toast
  const dismissToast = () => {
    setToast(prev => ({ ...prev, animating: false }));
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success', animating: false });
    }, 300);
  };

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
        return <AuctionManagement onMenuClick={handleMenuClick} showToast={showToast} />;
      case 'create-auction':
        return <CreateAuction showToast={showToast} />;
      case 'ongoing-auctions':
        return <OngoingAuctions />;
      case 'auction-results':
        return <AuctionResults />;
      case 'auction-history':
        return <AuctionHistory />;
      case 'payments':
        return <PaymentManagementView />;
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
    { id: 'payments', label: 'Payment Management', icon: 'payment' },
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
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 transform transition-all duration-500 ease-out"
             style={{
               animation: toast.animating ? 'slideInFromRight 0.5s ease-out forwards' : 'slideOutToRight 0.3s ease-in forwards'
             }}>
          <div className={`flex items-center space-x-3 px-6 py-4 rounded-lg shadow-xl border-l-4 backdrop-blur-sm ${
            toast.type === 'success' 
              ? 'bg-green-50/95 border-green-500 text-green-800' 
              : 'bg-red-50/95 border-red-500 text-red-800'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {toast.type === 'success' ? (
                <FaCheckCircle className="w-4 h-4 text-white" />
              ) : (
                <FaTimesCircle className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={dismissToast}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
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
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [farmersResponse, buyersResponse, auctionsResponse] = await Promise.all([
        authAPI.getAllFarmers(),
        authAPI.getAllBuyers(),
        fetch('http://localhost:3002/api/auctions').then(res => res.json())
      ]);
      
      setFarmers(farmersResponse.data.farmers || []);
      setBuyers(buyersResponse.data.buyers || []);
      setAuctions(auctionsResponse || []);
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

  // Calculate auction metrics
  const now = new Date();
  const activeAuctions = auctions.filter(auction => {
    const startDate = new Date(auction.startDate);
    const endDate = new Date(auction.endDate);
    return now >= startDate && now <= endDate && auction.status !== 'End Auction';
  });

  const upcomingAuctions = auctions.filter(auction => {
    const startDate = new Date(auction.startDate);
    const endDate = new Date(auction.endDate);
    return startDate > now && auction.status !== 'End Auction' && endDate >= now;
  });

  const completedAuctions = auctions.filter(auction => {
    const endDate = new Date(auction.endDate);
    return auction.status === 'End Auction' || endDate < now;
  });

  const recentCompletedAuctions = completedAuctions
    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
    .slice(0, 5);


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
    { label: 'Total Buyers', value: buyers.length.toLocaleString(), icon: FaBuilding, color: 'blue' },
    { label: 'Active Auctions', value: activeAuctions.length.toLocaleString(), icon: FaGavel, color: 'blue' },
    { label: 'Upcoming Auctions', value: upcomingAuctions.length.toLocaleString(), icon: FaClock, color: 'orange' },
    { label: 'Completed Auctions', value: completedAuctions.length.toLocaleString(), icon: FaTrophy, color: 'green' },
    { label: 'Total Auctions', value: auctions.length.toLocaleString(), icon: FaChartBar, color: 'purple' }
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
            <h3 className="text-xl font-bold text-gray-900">Active Auctions ({activeAuctions.length})</h3>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activeAuctions.length === 0 ? (
              <div className="text-center py-8">
                <FaGavel className="text-gray-400 text-4xl mx-auto mb-2" />
                <p className="text-gray-500">No active auctions</p>
              </div>
            ) : (
              activeAuctions.slice(0, 4).map((auction) => {
                const endDate = new Date(auction.endDate);
                const timeLeft = endDate - now;
                const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                
                return (
                  <div key={auction._id || auction.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{auction.auctionTitle}</h4>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Type: {auction.spiceType}</span>
                      <span>{auction.bidders || 0} bidders</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-green-600">₹{(auction.currentBid || 0).toLocaleString()}</span>
                      <span className="text-sm text-gray-500">
                        {timeLeft > 0 ? `${hoursLeft}h ${minutesLeft}m left` : 'Ending soon'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {activeAuctions.length === 0 && (
            <>
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Upcoming Auctions ({upcomingAuctions.length})</h3>
                </div>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {upcomingAuctions.slice(0, 3).map((auction) => (
                    <div key={auction._id || auction.id} className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{auction.auctionTitle}</h4>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Upcoming
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Type: {auction.spiceType}</span>
                        <span>Starts: {new Date(auction.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium text-blue-600">Increment: ₹{auction.incrementValue}</span>
                      </div>
                    </div>
                  ))}
                  {upcomingAuctions.length === 0 && (
                    <div className="text-center py-4">
                      <FaClock className="text-gray-400 text-3xl mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No upcoming auctions</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Recent Completed ({recentCompletedAuctions.length})</h3>
                </div>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {recentCompletedAuctions.map((auction) => (
                    <div key={auction._id || auction.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{auction.auctionTitle}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          auction.status === 'End Auction' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {auction.status === 'End Auction' ? 'Ended Early' : 'Completed'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Type: {auction.spiceType}</span>
                        <span>Ended: {new Date(auction.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-gray-900">₹{(auction.currentBid || 0).toLocaleString()}</span>
                        <span className="text-sm text-gray-500">{auction.bidders || 0} bidders</span>
                      </div>
                    </div>
                  ))}
                  {recentCompletedAuctions.length === 0 && (
                    <div className="text-center py-4">
                      <FaTrophy className="text-gray-400 text-3xl mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No completed auctions yet</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
    setSelectedItem(item);
    setShowDetailsModal(true);
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
  const pendingAuctionItems = allInventory.filter(item => item.status === 'Pending Auction').length;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
              <p className="text-emerald-100 text-sm font-medium">Available</p>
              <p className="text-3xl font-bold">{availableItems}</p>
            </div>
            <FaCheckCircle className="w-8 h-8 text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending Auction</p>
              <p className="text-3xl font-bold">{pendingAuctionItems}</p>
            </div>
            <FaClock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm font-medium">Sold</p>
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
              <option value="Pending Auction">Pending Auction</option>
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
                      item.status === 'Pending Auction' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'available' ? 'Available' :
                       item.status === 'sold' ? 'Sold' :
                       item.status === 'Pending Auction' ? 'Pending Auction' :
                       item.status || 'Unknown'}
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

      {/* Inventory Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Inventory Item Details</h2>
                  <p className="text-blue-50 mt-1">Complete information</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:text-blue-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* Image */}
                {selectedItem.spiceImage && (
                  <div className="flex justify-center">
                    <img
                      src={
                        selectedItem.spiceImage.startsWith('http')
                          ? selectedItem.spiceImage
                          : `http://localhost:3001${selectedItem.spiceImage}`
                      }
                      alt={selectedItem.spiceName}
                      className="w-48 h-48 object-cover rounded-lg border-2 border-blue-300"
                    />
                  </div>
                )}

                {/* Item Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Item Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Spice Name:</span>
                      <p className="font-medium text-gray-900">{selectedItem.spiceName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Weight:</span>
                      <p className="font-medium text-gray-900">{selectedItem.weight} kg</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Grade:</span>
                      <p className="font-medium text-emerald-700">{selectedItem.grade}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedItem.status === 'available' ? 'bg-green-100 text-green-800' :
                        selectedItem.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                        selectedItem.status === 'Pending Auction' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedItem.status === 'available' ? 'Available' :
                         selectedItem.status === 'sold' ? 'Sold' :
                         selectedItem.status === 'Pending Auction' ? 'Pending Auction' :
                         selectedItem.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Farmer Details */}
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Farmer Information</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <span className="text-sm text-gray-600">Name:</span>
                      <p className="font-medium text-gray-900">{selectedItem.farmerName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <p className="font-medium text-gray-900">{selectedItem.farmerEmail}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Location:</span>
                      <p className="font-medium text-gray-900">{selectedItem.farmerLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                {selectedItem.createdAt && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Added On:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedItem.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      {selectedItem.updatedAt && (
                        <div>
                          <span className="text-gray-600">Last Updated:</span>
                          <p className="font-medium text-gray-900">
                            {new Date(selectedItem.updatedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

// Auction Management Components
const AuctionManagement = ({ onMenuClick, showToast }) => {
  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showParticipantsView, setShowParticipantsView] = useState(false);
  const [participants, setParticipants] = useState([]);
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
      
      // Filter upcoming auctions (start date in future, not ended, and not marked as "End Auction")
      const upcoming = data.filter(auction => {
        const now = new Date();
        const startDateTime = new Date(auction.startDate);
        const endDateTime = new Date(auction.endDate);
        
        // Exclude if status is "End Auction" or if end date has passed
        if (auction.status === 'End Auction' || endDateTime < now) {
          return false;
        }
        
        // Include if start date is in future
        return startDateTime > now;
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

  const handleViewParticipants = async (auction) => {
    try {
      setSelectedAuction(auction);
      const auctionId = auction._id || auction.id;
      
      // Fetch participants for this auction
      const joinData = await auctionAPI.getJoinAuctionsByAuctionId(auctionId);
      
      // Fetch all farmers and buyers once
      let allFarmersData = [];
      let allBuyersData = [];
      try {
        const farmersResponse = await authAPI.getAllFarmers();
        allFarmersData = farmersResponse.data.farmers || [];
        console.log('Fetched farmers:', allFarmersData);
        
        const buyersResponse = await authAPI.getAllBuyers();
        allBuyersData = buyersResponse.data?.buyers || buyersResponse.data || buyersResponse || [];
      } catch (error) {
        console.error('Error fetching farmers/buyers:', error);
      }
      
      // Fetch inventory, farmer details, and bids for each participant
      const participantsWithInventory = await Promise.all(
        joinData.map(async (join) => {
          let inventoryItem = null;
          let farmer = null;
          let bids = [];
          let winner = null;
          
          // Fetch inventory item
          try {
            inventoryItem = await inventoryAPI.getInventoryItem(join.inventoryId);
          } catch (error) {
            console.error('Error fetching inventory for participant:', error);
          }
          
          // Find farmer from the pre-fetched list
          if (Array.isArray(allFarmersData) && allFarmersData.length > 0) {
            farmer = allFarmersData.find(f => f._id === join.farmerId || f.id === join.farmerId);
          }
          
          if (!farmer) {
            console.log('Farmer not found for ID:', join.farmerId);
          }

          // Fetch bids for this inventory
          try {
            const bidsResponse = await auctionAPI.getBidsByInventoryId(join.inventoryId);
            bids = bidsResponse || [];
            
            // Fetch buyer details for each bid
            const bidsWithBuyers = await Promise.all(
              bids.map(async (bid) => {
                const buyer = allBuyersData.find(b => (b._id || b.id) === bid.buyerId);
                return { ...bid, buyer };
              })
            );
            bids = bidsWithBuyers.sort((a, b) => (b.currentBidPrice || 0) - (a.currentBidPrice || 0));

            // Find winner (highest bid)
            if (bids.length > 0) {
              winner = bids[0].buyer;
              if (winner) {
                winner = { ...winner, bidAmount: bids[0].currentBidPrice };
              }
            }
          } catch (error) {
            console.error('Error fetching bids for inventory:', error);
          }
          
          return {
            ...join,
            inventoryItem,
            farmer,
            bids,
            winner,
            totalBids: bids.length
          };
        })
      );
      
      setParticipants(participantsWithInventory);
      setShowParticipantsView(true);
    } catch (error) {
      console.error('Error fetching participants:', error);
      Swal.fire('Error', 'Failed to load participants', 'error');
    }
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
    // Check if auction is active/ongoing
    const now = new Date();
    const startDateTime = new Date(`${auction.startDate}T${auction.startTime}`);
    const endDateTime = new Date(`${auction.endDate}T${auction.endTime}`);
    
    if (now >= startDateTime && now <= endDateTime) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Delete Active Auction',
        text: 'This auction is currently active and cannot be deleted. Please wait for it to end.',
        confirmButtonText: 'Understood',
        confirmButtonColor: '#f59e0b',
        customClass: {
          popup: 'swal2-error-popup',
          title: 'swal2-title',
          content: 'swal2-content'
        }
      });
      return;
    }

    // Custom SweetAlert2 modal for delete confirmation
    const result = await Swal.fire({
      title: 'Delete Auction',
      html: `
        <div class="text-center">
          <div class="mb-4">
            <div class="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">${auction.auctionTitle}</h3>
            <p class="text-sm text-gray-600 mb-4">${auction.spiceType}</p>
          </div>
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-sm font-medium text-red-800">This action cannot be undone</span>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete Auction',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'swal2-popup-custom',
        title: 'swal2-title-custom',
        content: 'swal2-content-custom',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      }
    });

    if (result.isConfirmed) {
      // Show loading state
      Swal.fire({
        title: 'Deleting Auction...',
        text: 'Please wait while we delete the auction',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        console.log('Deleting auction:', auction._id);
        const response = await fetch(`http://localhost:3002/api/auctions/${auction._id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          console.log('Auction deleted successfully');
          
          // Close loading modal and show success
          Swal.close();
          showToast('Auction deleted successfully!', 'success');
          fetchUpcomingAuctions(); // Refresh the list
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete auction');
        }
      } catch (error) {
        console.error('Error deleting auction:', error);
        Swal.close();
        showToast(`Error deleting auction: ${error.message}`, 'error');
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

  // Helper function to check if auction is active/ongoing
  const isAuctionActive = (auction) => {
    const now = new Date();
    const startDateTime = new Date(`${auction.startDate}T${auction.startTime}`);
    const endDateTime = new Date(`${auction.endDate}T${auction.endTime}`);
    return now >= startDateTime && now <= endDateTime;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAuction) return;

    // Validate form data - at least one field must have a value
    if (!editFormData.description.trim() && (!editFormData.incrementValue || editFormData.incrementValue <= 0)) {
      alert('Please provide at least one field to update (description or increment value)');
      return;
    }

    // Validate increment value if provided
    if (editFormData.incrementValue && editFormData.incrementValue <= 0) {
      alert('Increment value must be a positive number');
      return;
    }

    // Show confirmation modal for update
    const updateResult = await Swal.fire({
      title: 'Update Auction',
      html: `
        <div class="text-center">
          <div class="mb-4">
            <div class="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">${selectedAuction.auctionTitle}</h3>
            <p class="text-sm text-gray-600 mb-4">Update auction details</p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Yes, Update Auction',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'swal2-popup-custom',
        title: 'swal2-title-custom',
        content: 'swal2-content-custom',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      }
    });

    if (!updateResult.isConfirmed) {
      return;
    }

    try {
      // Prepare update data - only include fields that have values
      const updateData = {};
      
      if (editFormData.description.trim()) {
        updateData.description = editFormData.description.trim();
      }
      
      if (editFormData.incrementValue && editFormData.incrementValue > 0) {
        updateData.incrementValue = parseInt(editFormData.incrementValue);
      }

      // Ensure at least one field is being updated
      if (Object.keys(updateData).length === 0) {
        showToast('Please provide at least one field to update', 'error');
        return;
      }

      console.log('Updating auction with data:', updateData);

      // Show loading state
      Swal.fire({
        title: 'Updating Auction...',
        text: 'Please wait while we update the auction',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch(`http://localhost:3002/api/auctions/${selectedAuction._id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        console.log('Auction updated successfully');
        Swal.close();
        showToast('Auction updated successfully!', 'success');
        setEditModalOpen(false);
        fetchUpcomingAuctions(); // Refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update auction');
      }
    } catch (error) {
      console.error('Error updating auction:', error);
      Swal.close();
      showToast(`Error updating auction: ${error.message}`, 'error');
    }
  };

  // If showing participants view, render that instead
  if (showParticipantsView && selectedAuction) {
    return (
      <AuctionParticipantsView
        auction={selectedAuction}
        participants={participants}
        onBack={() => setShowParticipantsView(false)}
      />
    );
  }

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
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(auction)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleViewParticipants(auction)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        View Participants
                      </button>
                    </div>
                    <div className="flex space-x-2 justify-end">
                      <button
                        onClick={() => handleEditAuction(auction)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Auction"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAuction(auction)}
                        className={`p-2 rounded-lg transition-colors ${
                          isAuctionActive(auction)
                            ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                            : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title={isAuctionActive(auction) ? 'Cannot delete active auction' : 'Delete Auction'}
                        disabled={isAuctionActive(auction)}
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
                  className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    isAuctionActive(selectedAuction)
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  disabled={isAuctionActive(selectedAuction)}
                  title={isAuctionActive(selectedAuction) ? 'Cannot delete active auction' : 'Delete Auction'}
                >
                  <FaTrash className="w-4 h-4" />
                  <span>{isAuctionActive(selectedAuction) ? 'Cannot Delete (Active)' : 'Delete Auction'}</span>
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You can update the description and/or increment value. At least one field must be provided. 
                    The auction must not be active/ongoing to be updated.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {/* Description Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-gray-500">(optional)</span>
                    </label>
                    <textarea
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditFormChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Enter auction description..."
                    />
                  </div>

                  {/* Increment Value Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Increment Value (₹) <span className="text-gray-500">(optional)</span>
                    </label>
                    <input
                      type="number"
                      name="incrementValue"
                      value={editFormData.incrementValue}
                      onChange={handleEditFormChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter minimum bid increment..."
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

// Auction Participants View Component
const AuctionParticipantsView = ({ auction, participants, onBack }) => {
  const formatDate = (dateString, timeString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      let dateStr = date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      if (timeString) {
        dateStr += ` at ${timeString}`;
      }
      return dateStr;
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auction Participants</h1>
          <p className="text-gray-600">View all farmers who joined this auction</p>
        </div>
      </div>

      {/* Auction Details Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <FaGavel className="mr-2 text-emerald-600" />
          Auction Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Auction Title</label>
            <p className="text-lg font-semibold text-gray-900">{auction.auctionTitle}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Spice Type</label>
            <p className="text-lg font-semibold text-gray-900">{auction.spiceType}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Start Date</label>
            <p className="text-lg font-semibold text-gray-900">{formatDate(auction.startDate, auction.startTime)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">End Date</label>
            <p className="text-lg font-semibold text-gray-900">{formatDate(auction.endDate, auction.endTime)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Current Bid</label>
            <p className="text-lg font-semibold text-blue-600">₹{auction.currentBid?.toLocaleString() || '0'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Increment Value</label>
            <p className="text-lg font-semibold text-emerald-600">₹{auction.incrementValue?.toLocaleString()}</p>
          </div>
        </div>
        {auction.description && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-600">Description</label>
            <p className="text-gray-900 mt-2">{auction.description}</p>
          </div>
        )}
      </div>

      {/* Participants List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FaUsers className="mr-2 text-emerald-600" />
            Participants ({participants.length})
          </h2>
        </div>

        {participants.length === 0 ? (
          <div className="text-center py-12">
            <FaUsers className="text-gray-400 text-5xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Participants Yet</h3>
            <p className="text-gray-600">No farmers have joined this auction yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {participants.map((participant, index) => (
              <div key={participant._id || index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
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
                        className="w-32 h-32 object-cover rounded-lg border-2 border-emerald-300"
                      />
                    </div>
                  )}

                  {/* Participant Details */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Farmer Information */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <FaUser className="mr-2 text-emerald-600" />
                        Farmer Details
                      </h3>
                      {participant.farmer ? (
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Name:</span>
                            <p className="font-medium text-gray-900">
                              {participant.farmer.fullName || participant.farmer.name || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <p className="font-medium text-gray-900">
                              {participant.farmer.emailAddress || participant.farmer.email || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Phone:</span>
                            <p className="font-medium text-gray-900">
                              {participant.farmer.contactNumber || participant.farmer.phoneNumber || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Location:</span>
                            <p className="font-medium text-gray-900">
                              {participant.farmer.district && participant.farmer.state 
                                ? `${participant.farmer.district}, ${participant.farmer.state} - ${participant.farmer.pincode || ''}`
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Verification:</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full font-medium ${
                              participant.farmer.isVerified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {participant.farmer.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Farmer details not available</p>
                      )}
                    </div>

                    {/* Inventory Information */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <FaBox className="mr-2 text-emerald-600" />
                        Inventory Details
                      </h3>
                      {participant.inventoryItem ? (
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Spice Name:</span>
                            <p className="font-medium text-gray-900">{participant.inventoryItem.spiceName}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Weight:</span>
                            <p className="font-medium text-gray-900">{participant.inventoryItem.weight} kg</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Grade:</span>
                            <p className="font-medium text-emerald-700">{participant.inventoryItem.grade}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                              {participant.inventoryItem.status}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Inventory details not available</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Winner & Bidding History Section */}
                {participant.totalBids > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-300">
                    {/* Winner Info */}
                    {participant.winner && (
                      <div className="mb-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm mb-1">🏆 Winner</p>
                            <p className="text-xl font-bold">{participant.winner.fullName || participant.winner.name || 'Unknown Buyer'}</p>
                            <p className="text-green-100 text-sm">{participant.winner.emailAddress || participant.winner.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-green-100 text-sm mb-1">Winning Bid</p>
                            <p className="text-2xl font-bold">₹{(participant.winner.bidAmount || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bidding History */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Bidding History ({participant.totalBids} bid{participant.totalBids !== 1 ? 's' : ''})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {participant.bids.map((bid, bidIdx) => (
                          <div key={bidIdx} className={`p-3 rounded-lg border ${bidIdx === 0 ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {bid.buyer?.fullName || bid.buyer?.name || 'Anonymous Buyer'}
                                </p>
                                <p className="text-xs text-gray-600">{bid.buyer?.emailAddress || bid.buyer?.email}</p>
                              </div>
                              <div className="text-right">
                                <p className={`text-lg font-bold ${bidIdx === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                                  ₹{(bid.currentBidPrice || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">{bid.createdAt ? new Date(bid.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                              </div>
                            </div>
                            {bidIdx === 0 && (
                              <div className="mt-2 text-xs text-green-700 font-medium flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Winning Bid
                              </div>
                            )}
              </div>
            ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Create Auction Component
const CreateAuction = ({ showToast }) => {
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
      
      showToast('Auction created successfully!', 'success');
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
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showParticipantsView, setShowParticipantsView] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3002/api/auctions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch auctions');
      }
      
      const data = await response.json();
      
      // Filter only active/ongoing auctions based on current time (exclude "End Auction" status)
      const activeAuctions = data.filter(auction => {
        const now = new Date();
        const startDate = new Date(auction.startDate);
        const endDate = new Date(auction.endDate);
        
        return now >= startDate && now <= endDate && auction.status !== 'End Auction';
      });
      
      setAuctions(activeAuctions);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      setError('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAuctions();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const calculateTimeLeft = (endDate) => {
    const now = new Date();
    const endDateTime = new Date(endDate);
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

  const formatDateTime = (dateString) => {
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

  const handleViewDetails = (auction) => {
    setSelectedAuction(auction);
    setModalOpen(true);
  };

  const handleViewParticipants = async (auction) => {
    try {
      setSelectedAuction(auction);
      const auctionId = auction._id || auction.id;
      
      // Fetch participants for this auction
      const joinData = await auctionAPI.getJoinAuctionsByAuctionId(auctionId);
      
      // Fetch all farmers and buyers once
      let allFarmersData = [];
      let allBuyersData = [];
      try {
        const farmersResponse = await authAPI.getAllFarmers();
        allFarmersData = farmersResponse.data.farmers || [];
        
        const buyersResponse = await authAPI.getAllBuyers();
        allBuyersData = buyersResponse.data?.buyers || buyersResponse.data || buyersResponse || [];
      } catch (error) {
        console.error('Error fetching farmers/buyers:', error);
      }
      
      // Fetch inventory, farmer details, and bids for each participant
      const participantsWithInventory = await Promise.all(
        joinData.map(async (join) => {
          let inventoryItem = null;
          let farmer = null;
          let bids = [];
          let winner = null;
          
          // Fetch inventory item
          try {
            inventoryItem = await inventoryAPI.getInventoryItem(join.inventoryId);
          } catch (error) {
            console.error('Error fetching inventory for participant:', error);
          }
          
          // Find farmer from the pre-fetched list
          if (Array.isArray(allFarmersData) && allFarmersData.length > 0) {
            farmer = allFarmersData.find(f => f._id === join.farmerId || f.id === join.farmerId);
          }

          // Fetch bids for this inventory
          try {
            const bidsResponse = await auctionAPI.getBidsByInventoryId(join.inventoryId);
            bids = bidsResponse || [];
            
            // Fetch buyer details for each bid
            const bidsWithBuyers = await Promise.all(
              bids.map(async (bid) => {
                const buyer = allBuyersData.find(b => (b._id || b.id) === bid.buyerId);
                return { ...bid, buyer };
              })
            );
            bids = bidsWithBuyers.sort((a, b) => (b.currentBidPrice || 0) - (a.currentBidPrice || 0));

            // Find winner (highest bid)
            if (bids.length > 0) {
              winner = bids[0].buyer;
              if (winner) {
                winner = { ...winner, bidAmount: bids[0].currentBidPrice };
              }
            }
          } catch (error) {
            console.error('Error fetching bids for inventory:', error);
          }
          
          return {
            ...join,
            inventoryItem,
            farmer,
            bids,
            winner,
            totalBids: bids.length
          };
        })
      );
      
      setParticipants(participantsWithInventory);
      setShowParticipantsView(true);
    } catch (error) {
      console.error('Error fetching participants:', error);
      Swal.fire('Error', 'Failed to load participants', 'error');
    }
  };

  const handleIntervene = async (auctionId) => {
    const result = await Swal.fire({
      title: 'Intervene in Auction?',
      text: 'Are you sure you want to intervene in this auction?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d97706',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, intervene',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        console.log('Updating auction status to "Intervene" for ID:', auctionId);
        await auctionAPI.updateAuctionStatus(auctionId, 'Intervene');
        Swal.fire('Success!', 'Auction status updated to Intervene', 'success');
        fetchAuctions(); // Refresh the auctions list
      } catch (error) {
        console.error('Error intervening in auction:', error);
        console.error('Error response:', error.response?.data);
        const errorMsg = error.response?.data?.error || 'Failed to intervene in auction';
        Swal.fire('Error!', errorMsg, 'error');
      }
    }
  };

  const handleEndAuction = async (auctionId) => {
    const result = await Swal.fire({
      title: 'End Auction?',
      text: 'Are you sure you want to end this auction early?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, end it',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        console.log('Updating auction status to "End Auction" for ID:', auctionId);
        await auctionAPI.updateAuctionStatus(auctionId, 'End Auction');
        Swal.fire('Success!', 'Auction status updated to End Auction', 'success');
        fetchAuctions(); // Refresh the auctions list
      } catch (error) {
        console.error('Error ending auction:', error);
        console.error('Error response:', error.response?.data);
        const errorMsg = error.response?.data?.error || 'Failed to end auction';
        Swal.fire('Error!', errorMsg, 'error');
      }
    }
  };

  const handleRestartAuction = async (auctionId) => {
    const result = await Swal.fire({
      title: 'Restart Auction?',
      text: 'This will remove the Intervene status and allow the auction to continue.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, restart',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        console.log('Restarting auction (removing Intervene status) for ID:', auctionId);
        await auctionAPI.updateAuctionStatus(auctionId, null);
        Swal.fire('Success!', 'Auction has been restarted', 'success');
        fetchAuctions(); // Refresh the auctions list
      } catch (error) {
        console.error('Error restarting auction:', error);
        console.error('Error response:', error.response?.data);
        const errorMsg = error.response?.data?.error || 'Failed to restart auction';
        Swal.fire('Error!', errorMsg, 'error');
      }
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

  // If showing participants view, render that instead
  if (showParticipantsView && selectedAuction) {
    return (
      <AuctionParticipantsView
        auction={selectedAuction}
        participants={participants}
        onBack={() => setShowParticipantsView(false)}
      />
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
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {auctions.length} active auction{auctions.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={fetchAuctions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Refresh
          </button>
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
                  {!auction.status || auction.status === null ? (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : auction.status === 'Intervene' ? (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 flex items-center space-x-1">
                      <FaExclamationTriangle className="w-3 h-3" />
                      <span>Intervene</span>
                    </span>
                  ) : auction.status === 'End Auction' ? (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      End Auction
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <span>Spice: {auction.spiceType}</span>
                  <span>Increment: ₹{auction.incrementValue}</span>
                  <span>Ends: {formatDateTime(auction.endDate)}</span>
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
                  {calculateTimeLeft(auction.endDate)}
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
                {auction.status === 'Intervene' ? (
                  <button
                    onClick={() => handleRestartAuction(auction._id || auction.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <FaRedo className="w-4 h-4" />
                    <span>Restart</span>
                  </button>
                ) : auction.status === 'End Auction' ? null : (
                  <>
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
                  </>
                )}
              </div>
              {auction.status !== 'End Auction' && (
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleViewParticipants(auction)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <FaUsers className="w-4 h-4" />
                    <span>View Participants</span>
                  </button>
                  <button 
                    onClick={() => handleViewDetails(auction)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <FaEye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              )}
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

      {/* Auction Details Modal */}
      {modalOpen && selectedAuction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Auction Details</h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Auction Title</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedAuction.auctionTitle}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Spice Type</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedAuction.spiceType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Current Bid</label>
                    <p className="text-lg font-semibold text-blue-600">₹{selectedAuction.currentBid || '0'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Increment Value</label>
                    <p className="text-lg font-semibold text-emerald-600">₹{selectedAuction.incrementValue}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                    <p className="text-gray-900">{formatDateTime(selectedAuction.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">End Date</label>
                    <p className="text-gray-900">{formatDateTime(selectedAuction.endDate)}</p>
                  </div>
                </div>
                {selectedAuction.description && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-gray-900 mt-2">{selectedAuction.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Auction Results Component
const AuctionResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showParticipantsView, setShowParticipantsView] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchCompletedAuctions();
  }, []);

  const fetchCompletedAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3002/api/auctions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch auctions');
      }
      
      const data = await response.json();
      
      // Filter completed auctions (end date passed or status "End Auction")
      const completed = data.filter(auction => {
        const now = new Date();
        const endDateTime = new Date(auction.endDate);
        
        return auction.status === 'End Auction' || endDateTime < now;
      });
      
      setResults(completed);
    } catch (error) {
      console.error('Error fetching completed auctions:', error);
      setError('Failed to load completed auctions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
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

  const handleViewDetails = (auction) => {
    setSelectedAuction(auction);
    setModalOpen(true);
  };

  const handleViewParticipants = async (auction) => {
    try {
      setSelectedAuction(auction);
      const auctionId = auction._id || auction.id;
      
      // Fetch participants for this auction
      const joinData = await auctionAPI.getJoinAuctionsByAuctionId(auctionId);
      
      // Fetch all farmers and buyers once
      let allFarmersData = [];
      let allBuyersData = [];
      try {
        const farmersResponse = await authAPI.getAllFarmers();
        allFarmersData = farmersResponse.data.farmers || [];
        
        const buyersResponse = await authAPI.getAllBuyers();
        allBuyersData = buyersResponse.data?.buyers || buyersResponse.data || buyersResponse || [];
      } catch (error) {
        console.error('Error fetching farmers/buyers:', error);
      }
      
      // Fetch inventory, farmer details, and bids for each participant
      const participantsWithInventory = await Promise.all(
        joinData.map(async (join) => {
          let inventoryItem = null;
          let farmer = null;
          let bids = [];
          let winner = null;
          
          // Fetch inventory item
          try {
            inventoryItem = await inventoryAPI.getInventoryItem(join.inventoryId);
          } catch (error) {
            console.error('Error fetching inventory for participant:', error);
          }
          
          // Find farmer from the pre-fetched list
          if (Array.isArray(allFarmersData) && allFarmersData.length > 0) {
            farmer = allFarmersData.find(f => f._id === join.farmerId || f.id === join.farmerId);
          }

          // Fetch bids for this inventory
          try {
            const bidsResponse = await auctionAPI.getBidsByInventoryId(join.inventoryId);
            bids = bidsResponse || [];
            
            // Fetch buyer details for each bid
            const bidsWithBuyers = await Promise.all(
              bids.map(async (bid) => {
                const buyer = allBuyersData.find(b => (b._id || b.id) === bid.buyerId);
                return { ...bid, buyer };
              })
            );
            bids = bidsWithBuyers.sort((a, b) => (b.currentBidPrice || 0) - (a.currentBidPrice || 0));

            // Find winner (highest bid)
            if (bids.length > 0) {
              winner = bids[0].buyer;
              if (winner) {
                winner = { ...winner, bidAmount: bids[0].currentBidPrice };
              }
            }
          } catch (error) {
            console.error('Error fetching bids for inventory:', error);
          }
          
          return {
            ...join,
            inventoryItem,
            farmer,
            bids,
            winner,
            totalBids: bids.length
          };
        })
      );
      
      setParticipants(participantsWithInventory);
      setShowParticipantsView(true);
    } catch (error) {
      console.error('Error fetching participants:', error);
      Swal.fire('Error', 'Failed to load participants', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading completed auctions...</p>
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
            onClick={fetchCompletedAuctions}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
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
        onBack={() => setShowParticipantsView(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auction Results</h1>
          <p className="text-gray-600">View winners and manage settlement status</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {results.length} completed auctions
          </div>
          <button
            onClick={fetchCompletedAuctions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Completed</p>
              <p className="text-3xl font-bold">{results.length}</p>
            </div>
            <FaTrophy className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Ended Early</p>
              <p className="text-3xl font-bold">{results.filter(r => r.status === 'End Auction').length}</p>
            </div>
            <FaTimesCircle className="w-8 h-8 text-red-200" />
          </div>
        </div>


        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Total Value</p>
              <p className="text-3xl font-bold">₹{results.reduce((sum, r) => sum + (r.currentBid || 0), 0).toLocaleString()}</p>
            </div>
            <FaChartBar className="w-8 h-8 text-emerald-200" />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spice Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Increment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((auction) => (
                <tr key={auction._id || auction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{auction.auctionTitle}</div>
                      <div className="text-sm text-gray-500">{auction.description || 'No description'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                      {auction.spiceType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{auction.incrementValue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      auction.status === 'End Auction' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {auction.status === 'End Auction' ? 'Ended Early' : 'Completed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(auction.endDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewDetails(auction)}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <FaEye className="w-4 h-4" />
                        <span>Details</span>
                      </button>
                      <button 
                        onClick={() => handleViewParticipants(auction)}
                        className="text-emerald-600 hover:text-emerald-900 flex items-center space-x-1"
                      >
                        <FaUsers className="w-4 h-4" />
                        <span>Participants</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {results.length === 0 && (
          <div className="text-center py-12">
            <FaTrophy className="text-gray-400 text-5xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Completed Auctions</h3>
            <p className="text-gray-600">There are no completed auctions to display yet.</p>
          </div>
        )}
      </div>

      {/* Auction Details Modal */}
      {modalOpen && selectedAuction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Auction Details</h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Auction Title</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedAuction.auctionTitle}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Spice Type</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedAuction.spiceType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Final Bid</label>
                    <p className="text-lg font-semibold text-blue-600">₹{(selectedAuction.currentBid || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Increment Value</label>
                    <p className="text-lg font-semibold text-emerald-600">₹{selectedAuction.incrementValue}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                    <p className="text-gray-900">{formatDateTime(selectedAuction.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">End Date</label>
                    <p className="text-gray-900">{formatDateTime(selectedAuction.endDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      selectedAuction.status === 'End Auction' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedAuction.status === 'End Auction' ? 'Ended Early' : 'Completed'}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Bidders</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedAuction.bidders || 0}</p>
                  </div>
                </div>
                {selectedAuction.description && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-gray-900 mt-2">{selectedAuction.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Auction History Component
const AuctionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showParticipantsView, setShowParticipantsView] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchCompletedAuctions();
  }, []);

  const fetchCompletedAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3002/api/auctions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch auctions');
      }
      
      const data = await response.json();
      
      // Filter completed auctions (end date passed or status "End Auction")
      const completed = data.filter(auction => {
        const now = new Date();
        const endDateTime = new Date(auction.endDate);
        
        return auction.status === 'End Auction' || endDateTime < now;
      });
      
      setHistory(completed);
    } catch (error) {
      console.error('Error fetching completed auctions:', error);
      setError('Failed to load completed auctions');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(auction => {
    if (filter === 'all') return true;
    if (filter === 'high-value') return (auction.currentBid || 0) > 3000;
    if (filter === 'recent') return new Date(auction.endDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return true;
  });

  const totalRevenue = history.reduce((sum, auction) => sum + (auction.currentBid || 0), 0);
  const totalBids = history.reduce((sum, auction) => sum + (auction.bidders || 0), 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
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

  const handleViewDetails = (auction) => {
    setSelectedAuction(auction);
    setModalOpen(true);
  };

  const handleViewParticipants = async (auction) => {
    try {
      setSelectedAuction(auction);
      const auctionId = auction._id || auction.id;
      
      // Fetch participants for this auction
      const joinData = await auctionAPI.getJoinAuctionsByAuctionId(auctionId);
      
      // Fetch all farmers and buyers once
      let allFarmersData = [];
      let allBuyersData = [];
      try {
        const farmersResponse = await authAPI.getAllFarmers();
        allFarmersData = farmersResponse.data.farmers || [];
        
        const buyersResponse = await authAPI.getAllBuyers();
        allBuyersData = buyersResponse.data?.buyers || buyersResponse.data || buyersResponse || [];
      } catch (error) {
        console.error('Error fetching farmers/buyers:', error);
      }
      
      // Fetch inventory, farmer details, and bids for each participant
      const participantsWithInventory = await Promise.all(
        joinData.map(async (join) => {
          let inventoryItem = null;
          let farmer = null;
          let bids = [];
          let winner = null;
          
          // Fetch inventory item
          try {
            inventoryItem = await inventoryAPI.getInventoryItem(join.inventoryId);
          } catch (error) {
            console.error('Error fetching inventory for participant:', error);
          }
          
          // Find farmer from the pre-fetched list
          if (Array.isArray(allFarmersData) && allFarmersData.length > 0) {
            farmer = allFarmersData.find(f => f._id === join.farmerId || f.id === join.farmerId);
          }

          // Fetch bids for this inventory
          try {
            const bidsResponse = await auctionAPI.getBidsByInventoryId(join.inventoryId);
            bids = bidsResponse || [];
            
            // Fetch buyer details for each bid
            const bidsWithBuyers = await Promise.all(
              bids.map(async (bid) => {
                const buyer = allBuyersData.find(b => (b._id || b.id) === bid.buyerId);
                return { ...bid, buyer };
              })
            );
            bids = bidsWithBuyers.sort((a, b) => (b.currentBidPrice || 0) - (a.currentBidPrice || 0));

            // Find winner (highest bid)
            if (bids.length > 0) {
              winner = bids[0].buyer;
              if (winner) {
                winner = { ...winner, bidAmount: bids[0].currentBidPrice };
              }
            }
          } catch (error) {
            console.error('Error fetching bids for inventory:', error);
          }
          
          return {
            ...join,
            inventoryItem,
            farmer,
            bids,
            winner,
            totalBids: bids.length
          };
        })
      );
      
      setParticipants(participantsWithInventory);
      setShowParticipantsView(true);
    } catch (error) {
      console.error('Error fetching participants:', error);
      Swal.fire('Error', 'Failed to load participants', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading auction history...</p>
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
            onClick={fetchCompletedAuctions}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
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
        onBack={() => setShowParticipantsView(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auction History & Reports</h1>
          <p className="text-gray-600">Analytics and insights from past auctions</p>
        </div>
        <button
          onClick={fetchCompletedAuctions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <p className="text-3xl font-bold">₹{totalRevenue > 100000 ? (totalRevenue / 100000).toFixed(1) + 'L' : totalRevenue.toLocaleString()}</p>
            </div>
            <FaRupeeSign className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Bidders</p>
              <p className="text-3xl font-bold">{totalBids}</p>
            </div>
            <FaChartLine className="w-8 h-8 text-purple-200" />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Increment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.map((auction) => (
                <tr key={auction._id || auction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{auction.auctionTitle}</div>
                      <div className="text-sm text-gray-500">{auction.spiceType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      auction.status === 'End Auction' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {auction.status === 'End Auction' ? 'Ended Early' : 'Completed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{auction.incrementValue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(auction.startDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(auction.endDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewDetails(auction)}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <FaEye className="w-4 h-4" />
                        <span>Details</span>
                      </button>
                      <button 
                        onClick={() => handleViewParticipants(auction)}
                        className="text-emerald-600 hover:text-emerald-900 flex items-center space-x-1"
                      >
                        <FaUsers className="w-4 h-4" />
                        <span>Participants</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <FaHistory className="text-gray-400 text-5xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Auction History</h3>
            <p className="text-gray-600">There are no completed auctions to display yet.</p>
          </div>
        )}
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

      {/* Auction Details Modal */}
      {modalOpen && selectedAuction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Auction Details</h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Auction Title</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedAuction.auctionTitle}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Spice Type</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedAuction.spiceType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Final Bid</label>
                    <p className="text-lg font-semibold text-blue-600">₹{(selectedAuction.currentBid || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Increment Value</label>
                    <p className="text-lg font-semibold text-emerald-600">₹{selectedAuction.incrementValue}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                    <p className="text-gray-900">{formatDateTime(selectedAuction.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">End Date</label>
                    <p className="text-gray-900">{formatDateTime(selectedAuction.endDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      selectedAuction.status === 'End Auction' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedAuction.status === 'End Auction' ? 'Ended Early' : 'Completed'}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Bidders</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedAuction.bidders || 0}</p>
                  </div>
                </div>
                {selectedAuction.description && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-gray-900 mt-2">{selectedAuction.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Payment Management View Component
const PaymentManagementView = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllPayments = async () => {
      try {
        setLoading(true);
        // Fetch all payments using the dedicated endpoint
        const response = await auctionAPI.getAllPayments();
        const allPayments = response.data || response || [];

        // Fetch additional details for each payment
        const paymentsWithDetails = await Promise.all(
          allPayments.map(async (payment) => {
            let farmer = null;
            let buyer = null;
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

            // Fetch buyer details
            try {
              const buyerResponse = await authAPI.getBuyerById(payment.buyerId);
              if (buyerResponse?.data?.buyer) {
                buyer = buyerResponse.data.buyer;
              }
            } catch (error) {
              console.error('Error fetching buyer:', error);
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
              buyer,
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

    fetchAllPayments();
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

  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.farmer?.fullName?.toLowerCase().includes(searchLower) ||
      payment.buyer?.fullName?.toLowerCase().includes(searchLower) ||
      payment.buyer?.name?.toLowerCase().includes(searchLower) ||
      payment.auction?.auctionName?.toLowerCase().includes(searchLower) ||
      payment.inventory?.spiceName?.toLowerCase().includes(searchLower) ||
      payment.amount?.toString().includes(searchLower)
    );
  });

  const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Payment Management</h2>
          <p className="text-gray-600 mt-1">Monitor all platform payments</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full font-semibold">
            {payments.length} Payment{payments.length !== 1 ? 's' : ''}
          </div>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
            ₹{totalAmount.toLocaleString()} Total
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <input
          type="text"
          placeholder="Search by farmer, buyer, auction, spice, or amount..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* No Payments State */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No Matching Payments' : 'No Payments Yet'}
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try a different search term' : 'No payments have been recorded yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Farmer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Buyer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Auction</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Product</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment, index) => (
                  <tr key={payment._id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(payment.createdAt || payment.paymentDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{payment.farmer?.fullName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{payment.farmer?.contactNumber || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{payment.buyer?.fullName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{payment.buyer?.contactNumber || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{payment.auction?.auctionName || payment.auction?.auctionTitle || 'N/A'}</div>
                      <div className="text-xs text-gray-500">
                        Status: {payment.auction?.status || 'Completed'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{payment.inventory?.spiceName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">
                        Grade: {payment.inventory?.grade || 'N/A'} • {payment.inventory?.weight || 0} kg
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="text-lg font-bold text-green-600">₹{(payment.amount || 0).toLocaleString()}</div>
                      {payment.paymentId && (
                        <div className="text-xs text-gray-400 font-mono">{payment.paymentId.substring(0, 10)}...</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
