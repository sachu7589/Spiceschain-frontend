import React from 'react';
import { useAuth } from '../context/AuthContext';
import FarmerDashboard from './FarmerDashboard';
import BuyerDashboard from './BuyerDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

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

  // Route to appropriate dashboard based on user type
  if (user.userType === 'farmer') {
    return <FarmerDashboard />;
  } else if (user.userType === 'buyer') {
    return <BuyerDashboard />;
  }

  // Fallback for unknown user types
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Unknown User Type</h2>
        <p className="text-gray-600">Please contact support for assistance.</p>
      </div>
    </div>
  );
};

export default DashboardRouter;
