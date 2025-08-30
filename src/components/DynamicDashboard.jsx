import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DynamicDashboard = () => {
  const { user, logout } = useAuth();
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
        return <DashboardOverview user={user} />;
      case 'products':
        return <ProductsSection user={user} />;
      case 'orders':
        return <OrdersSection user={user} />;
      case 'analytics':
        return <AnalyticsSection user={user} />;
      case 'reports':
        return <ReportsSection user={user} />;
      case 'users':
        return <UsersSection user={user} />;
      case 'settings':
        return <SettingsSection user={user} />;
      default:
        return <DashboardOverview user={user} />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid', active: true },
    { id: 'products', label: 'Products', icon: 'package' },
    { id: 'orders', label: 'Orders', icon: 'shopping-cart' },
    { id: 'analytics', label: 'Analytics', icon: 'bar-chart' },
    { id: 'reports', label: 'Reports', icon: 'file-text' },
    { id: 'users', label: 'Users', icon: 'users' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'logout', label: 'Logout', icon: 'logout', action: logout },
  ];

  const getIcon = (iconName) => {
    const icons = {
             grid: (
         <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
         </svg>
       ),
             package: (
         <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
         </svg>
       ),
       'shopping-cart': (
         <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
         </svg>
       ),
       'bar-chart': (
         <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
         </svg>
       ),
       'file-text': (
         <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
         </svg>
       ),
       users: (
         <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
         </svg>
       ),
       settings: (
         <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
                 item.id === 'logout' 
                   ? 'text-red-600 hover:bg-red-50 hover:text-red-700 hover:shadow-md'
                   : activeMenu === item.id
                   ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                   : 'text-gray-600 hover:bg-white/80 hover:text-gray-900 hover:shadow-md'
               }`}
             >
               <span className={`flex-shrink-0 ${sidebarCollapsed ? 'p-2' : 'p-2'} rounded-lg transition-all duration-200 ${
                 item.id === 'logout' 
                   ? 'bg-red-100 group-hover:bg-red-200'
                   : activeMenu === item.id
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

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/20 bg-white/40 backdrop-blur-sm">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-4'}`}>
            <div className="relative">
                             <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                 {(user.fullName || user.name) ? (user.fullName || user.name).charAt(0).toUpperCase() : ''}
               </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-semibold text-gray-900 truncate">
                   {user.fullName || user.name}
                 </p>
                 <p className="text-xs text-gray-600 truncate">
                   {user.email || user.contactNumber}
                 </p>
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    {user.userType}
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
                  <p className="text-xs text-gray-600 capitalize">{user.userType}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {(user.fullName || user.name) ? (user.fullName || user.name).charAt(0).toUpperCase() : ''}
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

// Dashboard Content Components
const DashboardOverview = () => {
  const stats = [
    { label: 'Total Products', value: '156', change: '+12%', changeType: 'positive', icon: '📦' },
    { label: 'Active Orders', value: '23', change: '+5%', changeType: 'positive', icon: '🛒' },
    { label: 'Revenue', value: '₹45,230', change: '+18%', changeType: 'positive', icon: '💰' },
    { label: 'Customers', value: '89', change: '+2%', changeType: 'positive', icon: '👥' },
  ];

  const recentOrders = [
    { id: '#1234', customer: 'John Doe', product: 'Black Pepper', amount: '₹2,400', status: 'completed' },
    { id: '#1235', customer: 'Jane Smith', product: 'Cardamom', amount: '₹1,800', status: 'pending' },
    { id: '#1236', customer: 'Mike Johnson', product: 'Cinnamon', amount: '₹3,200', status: 'processing' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                stat.changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Sales Overview</h3>
          <div className="h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200">
            <div className="text-center text-gray-500">
              <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg font-medium">Chart visualization coming soon</p>
              <p className="text-sm text-gray-400">Interactive charts and analytics</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h3>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{order.customer}</p>
                  <p className="text-xs text-gray-600">{order.product}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{order.amount}</p>
                  <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductsSection = () => (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Products</h2>
      <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
        Add Product
      </button>
    </div>
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-12">
      <div className="text-center text-gray-500">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Products Management</h3>
        <p className="text-gray-500">Manage your spice products inventory</p>
      </div>
    </div>
  </div>
);

const OrdersSection = () => (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Orders</h2>
      <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
        View All Orders
      </button>
    </div>
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-12">
      <div className="text-center text-gray-500">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Orders Management</h3>
        <p className="text-gray-500">Track and manage customer orders</p>
      </div>
    </div>
  </div>
);

const AnalyticsSection = () => (
  <div className="space-y-8">
    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Analytics</h2>
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-12">
      <div className="text-center text-gray-500">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Analytics Dashboard</h3>
        <p className="text-gray-500">Comprehensive insights and metrics</p>
      </div>
    </div>
  </div>
);

const ReportsSection = () => (
  <div className="space-y-8">
    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Reports</h2>
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-12">
      <div className="text-center text-gray-500">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Reports Generation</h3>
        <p className="text-gray-500">Generate detailed business reports</p>
      </div>
    </div>
  </div>
);

const UsersSection = () => (
  <div className="space-y-8">
    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Users</h2>
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-12">
      <div className="text-center text-gray-500">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">User Management</h3>
        <p className="text-gray-500">Manage platform users and permissions</p>
      </div>
    </div>
  </div>
);

const SettingsSection = () => (
  <div className="space-y-8">
    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Settings</h2>
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-12">
      <div className="text-center text-gray-500">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Settings Configuration</h3>
        <p className="text-gray-500">Customize your platform preferences</p>
      </div>
    </div>
  </div>
);

export default DynamicDashboard;
