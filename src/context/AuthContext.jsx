import { createContext, useState, useEffect, useContext } from 'react';
import { useUser, useClerk } from '@clerk/react';

const AuthContext = createContext();

// Simulated secure password hashing for demo / mock authentication
const hashPassword = async (password) => {
  try {
    const msgBuffer = new TextEncoder().encode(password + 'civic_secret_salt_99');
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return btoa(password).split('').reverse().join('');
  }
};

// Component that connects to Clerk hooks when ClerkProvider is active
const ClerkBridgeConsumer = ({ children }) => {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  const [overrideRole, setOverrideRole] = useState(null);
  const [mockUser, setMockUser] = useState(null);

  // Restore mock user if any
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const decoded = JSON.parse(atob(parts[1]));
          if (!decoded.exp || Date.now() <= decoded.exp) {
            setMockUser({ username: decoded.username, role: decoded.role, isClerk: false });
          } else {
            localStorage.removeItem('jwt_token');
          }
        }
      } catch (err) {
        localStorage.removeItem('jwt_token');
      }
    }
  }, []);

  // Sync role override from localStorage for Clerk user
  useEffect(() => {
    if (clerkUser?.id) {
      const savedRole = localStorage.getItem(`civicbridge_role_${clerkUser.id}`);
      if (savedRole) {
        setOverrideRole(savedRole);
      }
    }
  }, [clerkUser?.id]);

  let activeUser = null;

  if (isSignedIn && clerkUser) {
    const email = clerkUser.primaryEmailAddress?.emailAddress || '';
    const name = clerkUser.fullName || 
      (clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : null) ||
      clerkUser.username || 
      email.split('@')[0] || 
      'Citizen';

    const defaultRole = (
      clerkUser.publicMetadata?.role ||
      (email.toLowerCase().includes('admin') || clerkUser.username === 'esha' ? 'admin' : 'citizen')
    );

    activeUser = {
      id: clerkUser.id,
      username: name,
      fullName: clerkUser.fullName || name,
      firstName: clerkUser.firstName || name,
      email: email,
      imageUrl: clerkUser.imageUrl,
      role: overrideRole || defaultRole,
      isClerk: true,
      raw: clerkUser,
    };
  } else if (mockUser) {
    activeUser = mockUser;
  }

  const setRole = (newRole) => {
    if (clerkUser?.id) {
      localStorage.setItem(`civicbridge_role_${clerkUser.id}`, newRole);
      setOverrideRole(newRole);
    } else if (mockUser) {
      setMockUser(prev => ({ ...prev, role: newRole }));
    }
  };

  const login = async (username, password) => {
    return new Promise(async (resolve, reject) => {
      try {
        const hashedInput = await hashPassword(password);
        const expectedAdminHash = await hashPassword('opensource');

        setTimeout(() => {
          if (username === 'esha' && hashedInput === expectedAdminHash) {
            const role = 'admin';
            const exp = Date.now() + 60 * 60 * 1000;
            const payload = btoa(JSON.stringify({ username, role, exp }));
            const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.X_Secure_Signature_Mock_${hashedInput.substring(0, 10)}`;
            localStorage.setItem('jwt_token', token);
            setMockUser({ username, role, isClerk: false });
            resolve({ success: true, role });
          } else if (username && password) {
            const role = 'citizen';
            const exp = Date.now() + 24 * 60 * 60 * 1000;
            const payload = btoa(JSON.stringify({ username, role, exp }));
            const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.X_Citizen_Signature_Mock`;
            localStorage.setItem('jwt_token', token);
            setMockUser({ username, role, isClerk: false });
            resolve({ success: true, role });
          } else {
            reject(new Error('Invalid credentials'));
          }
        }, 500);
      } catch (e) {
        reject(new Error('Authentication service error'));
      }
    });
  };

  const logout = async () => {
    if (isSignedIn && clerk) {
      try {
        await clerk.signOut();
      } catch (err) {
        console.error('Clerk sign out error:', err);
      }
    }
    localStorage.removeItem('jwt_token');
    setMockUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        loading: !isClerkLoaded,
        login,
        logout,
        setRole,
        isClerkConfigured: true,
        isClerkLoaded,
        clerk,
      }}
    >
      {isClerkLoaded ? children : (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
          <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid var(--border-light)', borderTopColor: 'var(--accent-main)', borderRadius: '50%' }} />
        </div>
      )}
    </AuthContext.Provider>
  );
};

// Fallback provider when Clerk Publishable Key is not yet configured in .env
const LocalAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const decoded = JSON.parse(atob(parts[1]));
          if (!decoded.exp || Date.now() <= decoded.exp) {
            setUser({ username: decoded.username, role: decoded.role, isClerk: false });
          } else {
            localStorage.removeItem('jwt_token');
          }
        }
      } catch (e) {
        localStorage.removeItem('jwt_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    return new Promise(async (resolve, reject) => {
      try {
        const hashedInput = await hashPassword(password);
        const expectedAdminHash = await hashPassword('opensource');

        setTimeout(() => {
          if (username === 'esha' && hashedInput === expectedAdminHash) {
            const role = 'admin';
            const exp = Date.now() + 60 * 60 * 1000;
            const payload = btoa(JSON.stringify({ username, role, exp }));
            const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.X_Secure_Signature_Mock_${hashedInput.substring(0, 10)}`;
            localStorage.setItem('jwt_token', token);
            setUser({ username, role, isClerk: false });
            resolve({ success: true, role });
          } else if (username && password) {
            const role = 'citizen';
            const exp = Date.now() + 24 * 60 * 60 * 1000;
            const payload = btoa(JSON.stringify({ username, role, exp }));
            const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.X_Citizen_Signature_Mock`;
            localStorage.setItem('jwt_token', token);
            setUser({ username, role, isClerk: false });
            resolve({ success: true, role });
          } else {
            reject(new Error('Invalid credentials'));
          }
        }, 500);
      } catch (e) {
        reject(new Error('Authentication service error'));
      }
    });
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
  };

  const setRole = (role) => {
    if (user) setUser(prev => ({ ...prev, role }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        setRole,
        isClerkConfigured: false,
        isClerkLoaded: true,
        clerk: null,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Main AuthProvider exported to wrap the application tree
export const AuthProvider = ({ children }) => {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const isKeyConfigured = Boolean(
    publishableKey &&
    (publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_'))
  );

  if (!isKeyConfigured) {
    return <LocalAuthProvider>{children}</LocalAuthProvider>;
  }

  return <ClerkBridgeConsumer>{children}</ClerkBridgeConsumer>;
};

export const useAuth = () => useContext(AuthContext);
