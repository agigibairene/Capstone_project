// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import ProtectedRoute from './Utils/ProtectedRoute';
import Signup from './components/Signup';
import Login from './components/Login';
// import InvestorDashboard from './components/dashboard/InvestorDashboard';
// import FarmerDashboard from './components/dashboard/FarmerDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      
      </Routes>
    </Router>
  );
}

export default App;