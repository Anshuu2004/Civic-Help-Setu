import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

// Simulated secure password hashing
const hashPassword = async (password) => {
  try {
    const msgBuffer = new TextEncoder().encode(password + 'civic_secret_salt_99');
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Fallback for older browsers
    return btoa(password).split('').reverse().join('');
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        // Validate Token format and Expiration
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error("Invalid token format");
        
        const decoded = JSON.parse(atob(parts[1]));
        if (decoded.exp && Date.now() > decoded.exp) {
          throw new Error("Token expired");
        }
        setUser({ username: decoded.username, role: decoded.role });
      } catch (e) {
        console.error("Auth validation failed:", e.message);
        localStorage.removeItem('jwt_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // Simulate fetching user from secure DB
    return new Promise(async (resolve, reject) => {
      try {
        const hashedInput = await hashPassword(password);
        const expectedAdminHash = await hashPassword('opensource');

        setTimeout(() => {
          if (username === 'esha' && hashedInput === expectedAdminHash) {
            const role = 'admin';
            const exp = Date.now() + 60 * 60 * 1000; // 1 hour expiration
            const payload = btoa(JSON.stringify({ username, role, exp }));
            
            // Mocking a signed JWT structure: Header.Payload.Signature
            const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.X_Secure_Signature_Mock_${hashedInput.substring(0,10)}`;
            
            localStorage.setItem('jwt_token', token);
            setUser({ username, role });
            resolve({ success: true, role });
          } else if (username && password) {
            // General Citizen Login
            const role = 'citizen';
            const exp = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiration
            const payload = btoa(JSON.stringify({ username, role, exp }));
            
            const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.X_Citizen_Signature_Mock`;
            
            localStorage.setItem('jwt_token', token);
            setUser({ username, role });
            resolve({ success: true, role });
          } else {
            reject(new Error('Invalid credentials'));
          }
        }, 600); // simulate secure network verification delay
      } catch (e) {
        reject(new Error('Authentication service error'));
      }
    });
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
