import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Radio, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DISMISSED_STORAGE_KEY = 'cifras_pedal_banner_dismissed';

export const PedalFeatureBanner: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_STORAGE_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
    } catch {
      // ignore storage write errors
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="relative mb-6 rounded-lg bg-gradient-to-r from-[#aa3bff]/15 via-bg-card to-bg-card border border-[#aa3bff]/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
      data-testid="pedal-feature-banner"
    >
      <div className="flex items-start gap-3.5 max-w-2xl">
        <div className="w-10 h-10 rounded-md bg-[#aa3bff] text-white flex items-center justify-center shrink-0 mt-0.5">
          <Radio className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-[#aa3bff] text-white">
              {t('pedal.badgeNew', 'NOVIDADE DE PALCO')}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-text-main">
              {t('pedal.bannerTitle', 'Controle o Modo Teatro com Pedais Bluetooth')}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-text-mute leading-relaxed">
            {t(
              'pedal.bannerDesc',
              'Role cifras e passe músicas do setlist com os pés sem tirar as mãos do violão ou guitarra. Compatível com PageFlip, AirTurn, Donner e outros.'
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#aa3bff] hover:bg-[#9926f0] text-white px-4 py-2.5 min-h-[40px] rounded-md font-bold text-xs sm:text-sm transition-colors shadow-xs"
        >
          <span>{t('pedal.bannerCta', 'Configurar e Testar')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-2 rounded-md hover:bg-bg-elevated text-text-mute hover:text-text-main transition-colors"
          title={t('common.close', 'Fechar')}
          aria-label={t('common.close', 'Fechar')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
