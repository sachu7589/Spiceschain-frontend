import React from 'react';
import { FaLeaf, FaBuilding, FaSignOutAlt, FaUser, FaSearch, FaShoppingCart, FaHeart, FaHistory } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const BuyerDashboard = () => {
  const { user, logout } = useAuth();

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <FaBuilding className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold text-gray-900">SpicesChain</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaUser className="text-gray-600" />
                <span className="text-gray-700 font-medium">{user.fullName}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-6">
            <FaBuilding className="text-blue-600 text-2xl" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user.fullName}!
              </h1>
              <p className="text-gray-600">
                You are registered as a Buyer
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2 transition-colors">
              <FaSearch className="text-xl" />
              <span className="font-medium">Browse Spices</span>
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2 transition-colors">
              <FaShoppingCart className="text-xl" />
              <span className="font-medium">My Orders</span>
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2 transition-colors">
              <FaHeart className="text-xl" />
              <span className="font-medium">Wishlist</span>
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2 transition-colors">
              <FaHistory className="text-xl" />
              <span className="font-medium">Order History</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
              <p className="text-blue-100 text-3xl font-bold">0</p>
              <p className="text-blue-100 text-sm">No orders yet</p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Account Status</h3>
              <p className="text-green-100">
                {user.isVerified ? 'Verified' : 'Pending Verification'}
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">User ID</h3>
              <p className="text-purple-100 text-sm font-mono">{user.id}</p>
            </div>
          </div>

          {/* Buyer-specific content */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
            <div className="space-y-3">
              <p className="text-gray-600">
                • Complete your buyer profile information
              </p>
              <p className="text-gray-600">
                • Browse available spices from verified farmers
              </p>
              <p className="text-gray-600">
                • Place your first order for quality spices
              </p>
              <p className="text-gray-600">
                • Build relationships with trusted farmers
              </p>
              <p className="text-gray-600">
                • Track your orders and delivery status
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="text-center py-8">
              <FaLeaf className="text-gray-400 text-4xl mx-auto mb-2" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-gray-400 text-sm">Start exploring spices to see your activity here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
