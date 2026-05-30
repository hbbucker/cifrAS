import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // If not authenticated, default to light
    if (!isAuthenticated || !user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme('light');
      setIsLoaded(true);
      return;
    }

    const fetchTheme = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/users/preferences', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.theme === 'dark' || data.theme === 'light') {
            setTheme(data.theme);
          }
          if (data.language) {
            i18n.changeLanguage(data.language);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user preferences', err);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated]);

  useEffect(() => {
    console.log('ThemeContext effect:', { theme, isLoaded });
    if (isLoaded) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        console.log('Added dark class');
      } else {
        document.documentElement.classList.remove('dark');
        console.log('Removed dark class');
      }
    }
  }, [theme, isLoaded]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme); // Optimistic UI update
    if (isAuthenticated) {
      try {
        const token = localStorage.getItem('token');
        await fetch('/api/users/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ theme: newTheme })
        });
      } catch (err) {
        console.error('Failed to update theme preference', err);
        // Fallback?
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
