import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthFallbackBanner from './components/AuthFallbackBanner';
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
import SignUpPage from './pages/SignUp';
import SSOCallback from './pages/SSOCallback';
import Track from './pages/Track';
import Vault from './pages/Vault';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid var(--border-light)', borderTopColor: 'var(--accent-main)', borderRadius: '50%' }} />
      </div>
    );
  }

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
            <AuthFallbackBanner />
            <main style={{ flex: 1 }}>
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
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
