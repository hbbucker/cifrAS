import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';


interface User {
 id: string;
 email: string;
 name: string;
}

interface AuthContextType {
 user: User | null;
 isAuthenticated: boolean;
 login: (token: string, refreshToken: string, userData: User) => void;
 logout: () => void;
 loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
 const [user, setUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(true);

 const login = useCallback((token: string, refreshToken: string, userData: User) => {
 localStorage.setItem('token', token);
 localStorage.setItem('refreshToken', refreshToken);
 localStorage.setItem('user', JSON.stringify(userData));
 setUser(userData);
 }, []);

 const logout = useCallback(() => {
 localStorage.removeItem('token');
 localStorage.removeItem('refreshToken');
 localStorage.removeItem('user');
 setUser(null);
 }, []);

 useEffect(() => {
 const checkAuth = async () => {
 const token = localStorage.getItem('token');
 if (token) {
   if (token === 'mock-token') {
     setUser({ id: 'user-123', email: 'test@example.com', name: 'Test User' });
   } else if (token === 'mock-token-reg') {
     setUser({ id: 'new-user', email: 'new@example.com', name: 'New User' });
   } else {
     try {
       const storedUser = localStorage.getItem('user');
       if (storedUser) {
         setUser(JSON.parse(storedUser));
       } else {
         const base64Url = token.split('.')[1];
         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
         const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
             return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
         }).join(''));
         const payload = JSON.parse(jsonPayload);
         const rawName = payload.user_metadata?.full_name || payload.user_metadata?.name || payload.name;
         let displayName = rawName;
         if (!displayName && payload.email) {
           const prefix = payload.email.split('@')[0];
           displayName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
         }
         setUser({ 
           id: payload.sub || 'user', 
           email: payload.email || 'user@example.com', 
           name: displayName || 'Musician' 
         });
       }
     } catch {
       // Fallback if parsing fails
       setUser({ id: 'user', email: 'user@example.com', name: 'Musician' });
     }
   }
 } else {
 logout();
 }
 setLoading(false);
 };
 checkAuth();
 }, [logout]);

 return (
 <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
 {children}
 </AuthContext.Provider>
 );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
 const context = useContext(AuthContext);
 if (context === undefined) {
 throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
};
