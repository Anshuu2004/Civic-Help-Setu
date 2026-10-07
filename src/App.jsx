import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Home from './pages/Home';
import Assistant from './pages/Assistant';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import Saved from './pages/Saved';
import OpenSource from './pages/OpenSource';
import Privacy from './pages/Privacy';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Track from './pages/Track';
import Vault from './pages/Vault';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetails />} />
              <Route path="/track" element={<Track />} />
              
              <Route path="/saved" element={
                <ProtectedRoute>
                  <Saved />
                </ProtectedRoute>
              } />
              
              <Route path="/vault" element={
                <ProtectedRoute>
                  <Vault />
                </ProtectedRoute>
              } />
              
              <Route path="/open-source" element={<OpenSource />} />
              <Route path="/privacy" element={<Privacy />} />
              
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <Admin />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
