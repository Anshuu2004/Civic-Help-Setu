import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ThemeProvider } from './context/ThemeContext';
import { NetworkProvider } from './context/NetworkContext';

import SkipToContent from './components/common/SkipToContent';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import ProtectedRoute from './components/ProtectedRoute';
import OfflineBanner from './components/common/OfflineBanner';

import Home from './pages/Home';
import Login from './pages/Login';
import SignUpPage from './pages/SignUp';
import SSOCallback from './pages/SSOCallback';
import Assistant from './pages/Assistant';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import Eligibility from './pages/Eligibility';
import NearbyOffices from './pages/NearbyOffices';
import Track from './pages/Track';
import Saved from './pages/Saved';
import Vault from './pages/Vault';
import Profile from './pages/Profile';
import OpenSource from './pages/OpenSource';
import Privacy from './pages/Privacy';
import Admin from './pages/Admin';

function App() {
  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <ToastProvider>
          <AuthProvider>
            <LanguageProvider>
              <NetworkProvider>
                <BrowserRouter>
                  <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                    <OfflineBanner />
                    <SkipToContent />
                    <Navbar />
                  <main id="main-content" style={{ flex: 1 }} tabIndex="-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login/*" element={<Login />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup/*" element={<SignUpPage />} />
                      <Route path="/signup" element={<SignUpPage />} />
                      <Route path="/sso-callback" element={<SSOCallback />} />
                      <Route path="/signup/sso-callback" element={<SSOCallback />} />
                      <Route path="/assistant" element={<Assistant />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/services/:id" element={<ServiceDetails />} />
                      <Route path="/eligibility" element={<Eligibility />} />
                      <Route path="/nearby" element={<NearbyOffices />} />
                      <Route path="/nearby-offices" element={<NearbyOffices />} />
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

                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />

                      <Route path="/open-source" element={<OpenSource />} />
                      <Route path="/privacy" element={<Privacy />} />

                      <Route path="/admin" element={
                        <ProtectedRoute requiredRole="admin">
                          <Admin />
                        </ProtectedRoute>
                      } />

                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                  <Footer />
                  <ToastContainer />
                  <AccessibilityToolbar />
                </div>
              </BrowserRouter>
            </NetworkProvider>
          </LanguageProvider>
          </AuthProvider>
        </ToastProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}

export default App;
