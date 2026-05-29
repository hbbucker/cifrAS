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
 setUser(userData);
 }, []);

 const logout = useCallback(() => {
 localStorage.removeItem('token');
 localStorage.removeItem('refreshToken');
 setUser(null);
 }, []);

 useEffect(() => {
 const checkAuth = async () => {
 const token = localStorage.getItem('token');
 if (token && token !== 'mock-token' && token !== 'mock-token-reg') {
 try {
 const payload = JSON.parse(atob(token.split('.')[1]));
 setUser({ 
 id: payload.sub || 'user', 
 email: payload.email || 'user@example.com', 
 name: payload.user_metadata?.full_name || payload.email || 'Musician' 
 });
 } catch {
 // Fallback if parsing fails
 setUser({ id: 'user', email: 'user@example.com', name: 'Musician' });
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
