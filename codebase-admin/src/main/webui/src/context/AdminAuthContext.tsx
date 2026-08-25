import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AdminUserSession,
  isTokenAdmin,
  extractUserFromToken,
} from '../utils/adminAuthUtils';

export type { AdminUserSession };

interface AdminAuthContextType {
  token: string | null;
  user: AdminUserSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const saved = localStorage.getItem('admin_token');
    if (saved && isTokenAdmin(saved)) {
      return saved;
    }
    if (saved) {
      localStorage.removeItem('admin_token');
    }
    return null;
  });

  const [user, setUser] = useState<AdminUserSession | null>(() => {
    const saved = localStorage.getItem('admin_token');
    if (saved && isTokenAdmin(saved)) {
      return extractUserFromToken(saved);
    }
    return null;
  });

  const login = useCallback((newToken: string): boolean => {
    if (!isTokenAdmin(newToken)) {
      localStorage.removeItem('admin_token');
      setToken(null);
      setUser(null);
      return false;
    }
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
    setUser(extractUserFromToken(newToken));
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const current = localStorage.getItem('admin_token');
      if (current && isTokenAdmin(current)) {
        setToken(current);
        setUser(extractUserFromToken(current));
      } else {
        setToken(null);
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isAuthenticated = !!token && isTokenAdmin(token);

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isAdmin: isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
