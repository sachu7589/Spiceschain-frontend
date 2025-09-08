import React, { useEffect } from 'react';
import { FaLeaf, FaBuilding, FaSignOutAlt, FaUser, FaPlus, FaBox, FaChartLine, FaUsers, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const FarmerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Debug: Log user object to see verification status
  console.log('🏠 Farmer Dashboard - User object:', user);
  console.log('🏠 Farmer Dashboard - isVerified:', user?.isVerified);
  console.log('🏠 Farmer Dashboard - typeof isVerified:', typeof user?.isVerified);
  console.log('🏠 Farmer Dashboard - isVerified === true:', user?.isVerified === true);
  console.log('🏠 Farmer Dashboard - isVerified !== true:', user?.isVerified !== true);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
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
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <FaLeaf className="text-white text-sm" />
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
            <FaLeaf className="text-green-600 text-2xl" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user.fullName}!
              </h1>
              <p className="text-gray-600">
                You are registered as a Farmer
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2 transition-colors">
              <FaPlus className="text-xl" />
              <span className="font-medium">Add Spices</span>
            </button>
            <button 
              onClick={() => navigate('/farmer/inventory')}
              className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2 transition-colors"
            >
              <FaBox className="text-xl" />
              <span className="font-medium">My Inventory</span>
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2 transition-colors">
              <FaChartLine className="text-xl" />
              <span className="font-medium">Analytics</span>
            </button>
            <button className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2 transition-colors">
              <FaUsers className="text-xl" />
              <span className="font-medium">Customers</span>
            </button>
          </div>

          {/* Verify Account Button - Only show if not verified */}
          {(() => {
            const shouldShow = user.isVerified !== true;
            console.log('🔍 Verification section check:');
            console.log('🔍 user.isVerified:', user.isVerified);
            console.log('🔍 user.isVerified !== true:', shouldShow);
            console.log('🔍 Should show verification section:', shouldShow);
            return shouldShow;
          })() && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FaShieldAlt className="text-3xl" />
                    <div>
                      <h3 className="text-xl font-bold">Account Verification Required</h3>
                      <p className="text-orange-100">Complete verification to access all features</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/farmer/verification')}
                    className="bg-white text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <FaShieldAlt />
                    <span>Verify Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Total Spices</h3>
              <p className="text-green-100 text-3xl font-bold">0</p>
              <p className="text-green-100 text-sm">No spices listed yet</p>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
              <p className="text-blue-100 text-3xl font-bold">0</p>
              <p className="text-blue-100 text-sm">No orders received</p>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Account Status</h3>
              <p className="text-purple-100">
                {user.isVerified ? 'Verified' : 'Pending Verification'}
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">User ID</h3>
              <p className="text-orange-100 text-sm font-mono">{user.id}</p>
            </div>
          </div>

          {/* Farmer-specific content */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
            <div className="space-y-3">
              <p className="text-gray-600">
                • Complete your farmer profile information
              </p>
              <p className="text-gray-600">
                • List your spices for sale with detailed descriptions
              </p>
              <p className="text-gray-600">
                • Set competitive prices and manage inventory
              </p>
              <p className="text-gray-600">
                • Connect with potential buyers and build trust
              </p>
              <p className="text-gray-600">
                • Track sales and manage orders efficiently
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="text-center py-8">
              <FaLeaf className="text-gray-400 text-4xl mx-auto mb-2" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-gray-400 text-sm">Start listing your spices to see your activity here</p>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Quick Tips for Success</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-blue-800 text-sm">
                  • Use high-quality images of your spices
                </p>
                <p className="text-blue-800 text-sm">
                  • Provide accurate weight and quality information
                </p>
                <p className="text-blue-800 text-sm">
                  • Respond quickly to buyer inquiries
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-blue-800 text-sm">
                  • Maintain consistent product quality
                </p>
                <p className="text-blue-800 text-sm">
                  • Build a positive reputation through reviews
                </p>
                <p className="text-blue-800 text-sm">
                  • Keep your inventory updated regularly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
