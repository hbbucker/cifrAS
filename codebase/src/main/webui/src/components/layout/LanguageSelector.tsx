import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Loader2 } from 'lucide-react';

export const LanguageSelector: React.FC<{ direction?: 'up' | 'down'; compact?: boolean }> = ({ direction = 'up', compact = false }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const changeLanguage = async (lng: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    i18n.changeLanguage(lng);
    setIsOpen(false);
    
    try {
      await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ language: lng })
      });
    } catch (e) {
      console.error('Failed to save language preference', e);
    } finally {
      setIsLoading(false);
    }
  };

  const languages = [
    { code: 'pt-BR', label: t('lang.pt-BR') },
    { code: 'en', label: t('lang.en') },
    { code: 'es', label: t('lang.es') }
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        disabled={isLoading}
        className="flex items-center gap-2 p-2 rounded-lg text-text-mute hover:text-[#8629cc] hover:bg-bg-elevated transition-colors focus:outline-none disabled:opacity-50"
        aria-label="Select Language"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
        {!compact && <span className="text-sm font-medium">{t('userMenu.language')}</span>}
      </button>

      {isOpen && (
        <div 
          className={`absolute w-40 bg-bg-card rounded-xl shadow-lg py-1 border border-border-main z-50 ${
            direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${compact ? 'left-0' : 'left-0'}`}
        >
          {languages.map((lng) => (
            <button
              key={lng.code}
              onClick={(e) => changeLanguage(lng.code, e)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                i18n.language === lng.code || (i18n.language && i18n.language.startsWith(lng.code.split('-')[0]) && i18n.language.includes(lng.code))
                  ? 'text-[#8629cc] bg-[#8629cc]/10' 
                  : 'text-text-main hover:bg-bg-elevated'
              }`}
            >
              {lng.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
