import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLeaf, FaBuilding, FaSignOutAlt, FaUser } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const storedUserData = localStorage.getItem('userData');

    if (!token) {
      navigate('/login');
      return;
    }

    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  if (!userData) {
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
                <span className="text-gray-700 font-medium">{userData.fullName}</span>
              </div>
              <button
                onClick={handleLogout}
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
            {userData.userType === 'farmer' ? (
              <FaLeaf className="text-green-600 text-2xl" />
            ) : (
              <FaBuilding className="text-blue-600 text-2xl" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {userData.fullName}!
              </h1>
              <p className="text-gray-600">
                You are registered as a {userData.userType}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Account Status</h3>
              <p className="text-green-100">
                {userData.isVerified ? 'Verified' : 'Pending Verification'}
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">User Type</h3>
              <p className="text-blue-100 capitalize">{userData.userType}</p>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">User ID</h3>
              <p className="text-purple-100 text-sm font-mono">{userData.id}</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
            <div className="space-y-3">
              <p className="text-gray-600">
                • Complete your profile information
              </p>
              <p className="text-gray-600">
                • {userData.userType === 'farmer' ? 'List your spices for sale' : 'Browse available spices'}
              </p>
              <p className="text-gray-600">
                • Connect with {userData.userType === 'farmer' ? 'buyers' : 'farmers'}
              </p>
              <p className="text-gray-600">
                • Start trading on the platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 