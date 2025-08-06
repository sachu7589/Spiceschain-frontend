import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './components/LandingPage'
import Login from './pages/Login'
import FarmerRegister from './pages/register/FarmerRegister'
import BuyerRegister from './pages/register/BuyerRegister'
import FarmerRegisterGoogle from './pages/register/FarmerRegisterGoogle'
import BuyerRegisterGoogle from './pages/register/BuyerRegisterGoogle'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import AuthRedirect from './components/AuthRedirect'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          } />
          <Route path="/register/farmer" element={
            <AuthRedirect>
              <FarmerRegister />
            </AuthRedirect>
          } />
          <Route path="/register/farmer/google" element={
            <AuthRedirect>
              <FarmerRegisterGoogle />
            </AuthRedirect>
          } />
          <Route path="/register/buyer" element={
            <AuthRedirect>
              <BuyerRegister />
            </AuthRedirect>
          } />
          <Route path="/register/buyer/google" element={
            <AuthRedirect>
              <BuyerRegisterGoogle />
            </AuthRedirect>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
