/**
 * Main Application Component
 * Sets up routing and authentication context
 */
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RutaProtegida } from './components/common/RutaProtegida';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import './App.css';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Route (Login) */}
      <Route path="/" element={<Login />} />

      {/* Protected Route (Dashboard) */}
      <Route
        path="/dashboard"
        element={
          <RutaProtegida>
            <Dashboard />
          </RutaProtegida>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;