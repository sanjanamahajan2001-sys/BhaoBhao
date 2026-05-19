import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import GroomerForm from './components/GroomerForm';
import GroomerList from './components/GroomerList';
import { checkTokenExpiry } from './utils/checkLogoutTime';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const token = localStorage.getItem('adminToken');
  //   setIsAuthenticated(!!token);
  //   setIsLoading(false);
  // }, []);
  useEffect(() => {
    // const token = localStorage.getItem('adminToken');
    const token = sessionStorage.getItem('adminToken');

    if (token && !checkTokenExpiry()) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    setIsLoading(false);
  }, []);
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Private route */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <HomePage onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Create Groomer Route */}
        <Route
          path="/create-groomer"
          element={
            isAuthenticated ? (
              <GroomerForm onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Edit Groomer Route */}
        <Route
          path="/edit-groomer/:id"
          element={
            isAuthenticated ? (
              <GroomerForm onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Groomer List Route */}
        <Route
          path="/groomers"
          element={
            isAuthenticated ? (
              <GroomerList onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Catch-all redirect */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />}
        />
      </Routes>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Router>
  );
}

export default App;
