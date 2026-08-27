import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Moon, Sun, Settings, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { PreferencesModal } from '../modals/PreferencesModal';
import { FeedbackModal } from '../modals/FeedbackModal';

export interface UserMenuProps {
  direction?: 'up' | 'down';
}

export const UserMenu: React.FC<UserMenuProps> = ({ direction = 'down' }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (e) {
      console.error('Logout request failed', e);
    }
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
        aria-label="User menu"
        data-testid="user-menu-btn"
      >
        <div className="w-8 h-8 rounded-full bg-[#8629cc] flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-[#8629cc] hover:ring-offset-2 transition-all">
          {user?.name?.charAt(0) || 'U'}
        </div>
      </button>

      {isOpen && (
        <div className={`absolute w-48 bg-bg-card rounded-xl shadow-lg py-1 border border-border-main z-50 ${direction === 'up' ? 'bottom-full mb-2 left-0' : 'top-full mt-2 right-0'}`}>
          <div className="px-4 py-2 border-b border-border-main">
            <p className="text-sm font-medium text-text-main truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-text-mute truncate">{user?.email || ''}</p>
          </div>
          <div className="px-4 py-2 border-b border-border-main flex flex-col gap-2">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsPreferencesOpen(true);
              }}
              className="w-full flex items-center gap-2 text-sm text-text-main hover:text-[#8629cc] transition-colors focus:outline-none text-left"
              data-testid="preferences-btn"
            >
              <Settings className="w-4 h-4" />
              {t('userMenu.preferences') || 'Preferences'}
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsFeedbackOpen(true);
              }}
              className="w-full flex items-center gap-2 text-sm text-text-main hover:text-[#8629cc] transition-colors focus:outline-none text-left"
              data-testid="feedback-btn"
            >
              <MessageSquare className="w-4 h-4" />
              Enviar Feedback
            </button>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between text-sm text-text-main hover:text-[#8629cc] transition-colors focus:outline-none"
              data-testid="theme-toggle-btn"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                {t('userMenu.darkMode')}
              </span>
              <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-[#8629cc]' : 'bg-bg-elevated'}`}>
                <div className={`bg-bg-card w-3 h-3 rounded-full shadow-md transform transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
            <div className="-mx-2">
              <LanguageSelector direction={direction} />
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-bg-elevated flex items-center gap-2 transition-colors"
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4" />
            {t('userMenu.logout')}
          </button>
        </div>
      )}
      
      <PreferencesModal 
        isOpen={isPreferencesOpen} 
        onClose={() => setIsPreferencesOpen(false)} 
      />
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
};
