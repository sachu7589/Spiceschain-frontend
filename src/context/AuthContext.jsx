import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('userType');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userType', userData.userType);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  const refreshUserData = async () => {
    const token = localStorage.getItem('token');
    console.log('🔄 Refreshing user data...');
    console.log('🔑 Token exists:', !!token);
    
    if (!token) {
      console.log('❌ No token found, skipping refresh');
      return;
    }

    try {
      console.log('📡 Fetching user data from: http://localhost:3000/api/auth/me');
      const response = await fetch('http://localhost:3000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Fresh user data from backend:', userData);
        console.log('🔍 isVerified from backend:', userData.isVerified);
        console.log('🔍 typeof isVerified:', typeof userData.isVerified);
        
        setUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('💾 Updated localStorage with fresh data');
        return userData;
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to refresh user data. Status:', response.status);
        console.error('❌ Error response:', errorText);
        return null;
      }
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
      return null;
    }
  };

  const updateUserData = (updatedData) => {
    console.log('🔄 Updating user data directly:', updatedData);
    setUser(updatedData);
    localStorage.setItem('userData', JSON.stringify(updatedData));
    console.log('💾 Updated user data in state and localStorage');
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    refreshUserData,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 