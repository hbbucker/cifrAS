import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Sparkles } from 'lucide-react';

export const PaywallModal: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onQuotaExceeded = () => {
      setIsOpen(true);
    };
    window.addEventListener('quota_exceeded', onQuotaExceeded);
    return () => {
      window.removeEventListener('quota_exceeded', onQuotaExceeded);
    };
  }, []);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-bg-card rounded-[32px] max-w-md w-full p-6 text-center border border-border-main mx-auto relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#aa3bff] rounded-full opacity-10 blur-3xl"></div>
        
        <div className="w-16 h-16 bg-[#aa3bff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-[#aa3bff]" />
        </div>
        
        <h3 className="text-2xl font-bold mb-3 text-text-main">{t('pricing.modal.title')}</h3>
        <p className="text-sm sm:text-base text-text-mute mb-8">{t('pricing.modal.message')}</p>
        
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => {
              setIsOpen(false);
              navigate('/pricing');
            }}
            className="w-full py-3.5 rounded-[16px] bg-[#aa3bff] hover:bg-[#9630e6] text-white font-bold text-base"
          >
            {t('pricing.modal.upgradeButton')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsOpen(false)}
            className="w-full py-3.5 rounded-[16px] font-medium text-base"
          >
            {t('pricing.modal.maybeLater')}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
