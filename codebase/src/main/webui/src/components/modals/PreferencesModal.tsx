import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import authClient from '../../services/authService';
import { useToast } from '../../context/ToastContext';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose }) => {
  const { user, login } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(user.name);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await authClient.put('/profile', { name });
      toast(t('userMenu.preferencesSaved') || 'Preferences saved successfully', 'success');
      
      // Update local context
      const token = localStorage.getItem('token') || '';
      const refresh = localStorage.getItem('refreshToken') || '';
      if (user) {
        login(token, refresh, { ...user, name });
      }
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast(t('userMenu.preferencesError') || 'Failed to update preferences', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-card border border-border-main rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border-main">
          <h2 className="text-xl font-bold text-text-main">{t('userMenu.preferences') || 'Preferences'}</h2>
          <button
            onClick={onClose}
            className="p-2 text-text-mute hover:text-text-main hover:bg-bg-elevated rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              {t('userMenu.name') || 'Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-text-main focus:ring-2 focus:ring-[#aa3bff] focus:border-transparent transition-all outline-none"
              placeholder="Your name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              {t('userMenu.email') || 'Email'}
            </label>
            <input
              type="email"
              value={user?.email || ''}
              className="w-full px-4 py-3 bg-bg-elevated border border-border-main rounded-xl text-text-mute opacity-70 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-text-mute mt-1">{t('userMenu.emailNotEditable') || 'Email cannot be altered.'}</p>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-main hover:bg-bg-elevated rounded-xl font-medium transition-colors"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isLoading || name === user?.name || !name.trim()}
              className="px-6 py-2 bg-[#aa3bff] hover:bg-[#902be6] text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t('common.save') || 'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
