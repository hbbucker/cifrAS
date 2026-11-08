import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface OnboardingTooltipProps {
  children: React.ReactNode;
  tooltipId: string;
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({ children, tooltipId }) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(`tooltip_seen_${tooltipId}`);
    if (!hasSeen) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [tooltipId]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`tooltip_seen_${tooltipId}`, 'true');
  };

  return (
    <div className="relative inline-block">
      {children}
      {isVisible && (
        <div className="absolute right-0 top-full mt-3 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative bg-[#aa3bff] text-white p-4 rounded-lg shadow-xl shadow-[#aa3bff]/20">
            <div className="absolute -top-2 right-4 w-4 h-4 bg-[#aa3bff] rotate-45" />
            
            <div className="relative flex justify-between items-start mb-2">
              <h4 className="font-bold text-sm">{t('onboarding.tooltipTitle')}</h4>
              <button onClick={handleDismiss} className="text-white/80 hover:text-white p-1 -mr-1 -mt-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-white/90 mb-3">{t('onboarding.tooltipDesc')}</p>
            <button 
              onClick={handleDismiss}
              className="text-xs font-bold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded transition-colors w-full"
            >
              {t('onboarding.gotIt')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
