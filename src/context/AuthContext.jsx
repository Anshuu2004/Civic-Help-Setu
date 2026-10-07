import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        // Mock decoding token
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: decoded.username, role: decoded.role });
      } catch (e) {
        localStorage.removeItem('jwt_token');
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === 'esha' && password === 'opensource') {
          const role = 'admin';
          const payload = btoa(JSON.stringify({ username, role }));
          const token = `mockJwtHeader.${payload}.mockSignature`;
          localStorage.setItem('jwt_token', token);
          setUser({ username, role });
          resolve({ success: true, role });
        } else if (username && password) {
          const role = 'citizen';
          const payload = btoa(JSON.stringify({ username, role }));
          const token = `mockJwtHeader.${payload}.mockSignature`;
          localStorage.setItem('jwt_token', token);
          setUser({ username, role });
          resolve({ success: true, role });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500); // simulate network latency
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
