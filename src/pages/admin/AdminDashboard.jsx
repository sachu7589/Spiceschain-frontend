import React, { useState, useEffect } from 'react';
import { FaCog, FaSignOutAlt, FaUser, FaUsers, FaChartBar, FaShieldAlt, FaLeaf, FaBuilding, FaClipboardList, FaExclamationTriangle, FaCheckCircle, FaClock, FaDollarSign, FaBell, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

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
        return <AdminDashboardOverview user={user} />;
      case 'farmers':
        return <ManageFarmers />;
      case 'buyers':
        return <ManageBuyers />;
      default:
        return <AdminDashboardOverview user={user} />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid', active: true },
    { id: 'farmers', label: 'Manage Farmers', icon: 'leaf' },
    { id: 'buyers', label: 'Manage Buyers', icon: 'building' },
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
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.action ? item.action() : handleMenuClick(item.id)}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-4'} ${sidebarCollapsed ? 'px-2 py-3' : 'px-4 py-3'} rounded-xl transition-all duration-200 group ${
                activeMenu === item.id
                  ? 'bg-blue-50 text-blue-800 border border-blue-200 shadow-sm'
                  : 'text-gray-600 hover:bg-white/80 hover:text-gray-900 hover:shadow-md'
              }`}
            >
              <span className={`flex-shrink-0 ${sidebarCollapsed ? 'p-2' : 'p-2'} rounded-lg transition-all duration-200 ${
                activeMenu === item.id
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'bg-gray-100 group-hover:bg-blue-50 group-hover:shadow-sm'
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
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
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
const AdminDashboardOverview = ({ user }) => {
  // User metrics data
  const userMetrics = [
    { 
      label: 'Total Users', 
      value: '1,247', 
      icon: FaUsers, 
      bgColor: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    { 
      label: 'Total Farmers', 
      value: '892', 
      icon: FaLeaf, 
      bgColor: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    { 
      label: 'Total Buyers', 
      value: '355', 
      icon: FaBuilding, 
      bgColor: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    }
  ];

  // Auction details
  const auctionDetails = [
    { id: 'A001', product: 'Premium Turmeric', farmer: 'Rajesh Kumar', currentBid: '₹2,450/kg', timeLeft: '2h 15m', bidders: 12, status: 'active' },
    { id: 'A002', product: 'Organic Cardamom', farmer: 'Priya Sharma', currentBid: '₹1,850/kg', timeLeft: '45m', bidders: 8, status: 'active' },
    { id: 'A003', product: 'Black Pepper', farmer: 'Amit Patel', currentBid: '₹3,200/kg', timeLeft: '5h 30m', bidders: 15, status: 'active' },
    { id: 'A004', product: 'Cinnamon Sticks', farmer: 'Suresh Reddy', currentBid: '₹1,200/kg', timeLeft: 'Ended', bidders: 6, status: 'completed' }
  ];

  // Recent registrations
  const recentRegistrations = [
    { id: 'F001', name: 'Vikram Singh', type: 'Farmer', email: 'vikram@example.com', registered: '2 hours ago', status: 'verified' },
    { id: 'B001', name: 'Neha Gupta', type: 'Buyer', email: 'neha@example.com', registered: '4 hours ago', status: 'verified' },
    { id: 'F002', name: 'Arjun Mehta', type: 'Farmer', email: 'arjun@example.com', registered: '6 hours ago', status: 'pending' },
    { id: 'B002', name: 'Kavya Nair', type: 'Buyer', email: 'kavya@example.com', registered: '1 day ago', status: 'verified' },
    { id: 'F003', name: 'Rohit Verma', type: 'Farmer', email: 'rohit@example.com', registered: '1 day ago', status: 'pending' }
  ];

  // Pending verifications
  const pendingVerifications = [
    { id: 'V001', name: 'Rajesh Kumar', type: 'Farmer', submitted: '2 hours ago', status: 'pending', documents: 'Aadhaar, Land Certificate' },
    { id: 'V002', name: 'Priya Sharma', type: 'Buyer', submitted: '4 hours ago', status: 'pending', documents: 'PAN, Business License' },
    { id: 'V003', name: 'Amit Patel', type: 'Farmer', submitted: '6 hours ago', status: 'under_review', documents: 'Aadhaar, Bank Statement' },
    { id: 'V004', name: 'Suresh Reddy', type: 'Buyer', submitted: '1 day ago', status: 'pending', documents: 'GST Certificate, PAN' }
  ];

  // System stats
  const systemStats = [
    { label: 'Active Auctions', value: '12', icon: FaChartBar, color: 'blue' },
    { label: 'Pending Verifications', value: '8', icon: FaShieldAlt, color: 'orange' },
    { label: 'Total Revenue', value: '₹2.4M', icon: FaDollarSign, color: 'green' },
    { label: 'Platform Uptime', value: '99.9%', icon: FaCheckCircle, color: 'purple' }
  ];

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
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className={`bg-gradient-to-br ${metric.bgColor} rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-102`}>
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 ${metric.iconBg} rounded-xl mb-4 shadow-md`}>
                  <IconComponent className={`text-2xl ${metric.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-1">{metric.value}</h3>
                <p className="text-sm text-white/90 font-medium">{metric.label}</p>
              </div>
            </div>
          );
        })}
      </div>

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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Auctions */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Active Auctions</h3>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {auctionDetails.map((auction) => (
              <div key={auction.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{auction.product}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(auction.status)}`}>
                    {auction.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Farmer: {auction.farmer}</span>
                  <span>{auction.bidders} bidders</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold text-green-600">{auction.currentBid}</span>
                  <span className="text-sm text-gray-500">{auction.timeLeft}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Registrations</h3>
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              View All
            </button>
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
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Review All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingVerifications.map((verification) => (
                <tr key={verification.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{verification.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{verification.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      verification.type === 'Farmer' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {verification.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{verification.documents}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{verification.submitted}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(verification.status)}`}>
                      {verification.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <FaEye className="inline mr-1" />
                      Review
                    </button>
                    <button className="text-green-600 hover:text-green-900 mr-3">
                      <FaCheckCircle className="inline mr-1" />
                      Approve
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <FaTrash className="inline mr-1" />
                      Reject
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

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

  const handleViewClick = async (farmer) => {
    setSelectedUser(farmer);
    setModalOpen(true);
    setVerificationData(null);
    
    if (farmer.isVerified) {
      try {
        setModalLoading(true);
        const response = await authAPI.getAadhaarVerification(farmer._id);
        setVerificationData(response.data.verification);
      } catch (error) {
        console.error('Error fetching Aadhaar verification:', error);
        // Set a special error state to show API error message
        setVerificationData('API_ERROR');
      } finally {
        setModalLoading(false);
      }
    }
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
                    <button 
                      onClick={() => handleViewClick(farmer)}
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
        {filteredFarmers.length === 0 && (
          <div className="text-center py-8">
            <FaLeaf className="text-gray-400 text-4xl mx-auto mb-2" />
            <p className="text-gray-500">No farmers found</p>
          </div>
        )}
      </div>

      {/* Aadhaar Modal */}
      <AadhaarModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        verificationData={verificationData}
        loading={modalLoading}
      />
    </div>
  );
};

// Manage Buyers Component
const ManageBuyers = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

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

  const handleViewClick = async (buyer) => {
    setSelectedUser(buyer);
    setModalOpen(true);
    setVerificationData(null);
    
    if (buyer.isVerified) {
      try {
        setModalLoading(true);
        const response = await authAPI.getAadhaarVerification(buyer._id);
        setVerificationData(response.data.verification);
      } catch (error) {
        console.error('Error fetching Aadhaar verification:', error);
        // Set a special error state to show API error message
        setVerificationData('API_ERROR');
      } finally {
        setModalLoading(false);
      }
    }
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
                    <button 
                      onClick={() => handleViewClick(buyer)}
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
        {filteredBuyers.length === 0 && (
          <div className="text-center py-8">
            <FaBuilding className="text-gray-400 text-4xl mx-auto mb-2" />
            <p className="text-gray-500">No buyers found</p>
          </div>
        )}
      </div>

      {/* Aadhaar Modal */}
      <AadhaarModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        verificationData={verificationData}
        loading={modalLoading}
      />
    </div>
  );
};

export default AdminDashboard;
