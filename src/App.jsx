import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Login from './pages/Login'
import FarmerRegister from './pages/register/FarmerRegister'
import BuyerRegister from './pages/register/BuyerRegister'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/farmer" element={<FarmerRegister />} />
        <Route path="/register/buyer" element={<BuyerRegister />} />
      </Routes>
    </Router>
  )
}

export default App
