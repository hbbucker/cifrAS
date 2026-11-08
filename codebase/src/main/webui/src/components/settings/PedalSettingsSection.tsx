import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Radio, RotateCcw, HelpCircle } from 'lucide-react';
import {
  type PedalKeyConfig,
  DEFAULT_PEDAL_CONFIG,
  getStoredPedalConfig,
  saveStoredPedalConfig,
} from '../../hooks/usePedalController';
import { PedalSimulator } from './PedalSimulator';
import { CoachMark } from '../ui/CoachMark';
import { useTour } from '../../context/TourContext';

export const PedalSettingsSection: React.FC = () => {
  const { t } = useTranslation();
  const { startTour } = useTour();
  const [config, setConfig] = useState<PedalKeyConfig>(() => getStoredPedalConfig());
  const [listeningAction, setListeningAction] = useState<string | null>(null);

  const handleUpdateConfig = (partial: Partial<PedalKeyConfig>) => {
    const updated = { ...config, ...partial };
    setConfig(updated);
    saveStoredPedalConfig(updated);
  };

  const handleResetDefaults = () => {
    setConfig(DEFAULT_PEDAL_CONFIG);
    saveStoredPedalConfig(DEFAULT_PEDAL_CONFIG);
  };

  const startKeyListening = (actionKey: 'downKeys' | 'upKeys' | 'toggleScrollKeys') => {
    setListeningAction(actionKey);

    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const pressedKey = e.key;

      setConfig((prev) => {
        const next = {
          ...prev,
          profile: 'custom' as const,
          [actionKey]: [pressedKey],
        };
        saveStoredPedalConfig(next);
        return next;
      });

      setListeningAction(null);
      window.removeEventListener('keydown', onKeyDown);
    };

    window.addEventListener('keydown', onKeyDown, { once: true });
  };

  return (
    <div className="bg-bg-card rounded-lg border border-border-main p-4 sm:p-6 shadow-xs mt-6" data-testid="pedal-settings-section">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border-main">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-[#aa3bff]/15 flex items-center justify-center text-[#aa3bff]">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text-main flex items-center gap-2">
              {t('pedal.settingsTitle', 'Pedais Bluetooth & Controle por Pé')}
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-[#aa3bff] text-white">
                {t('pedal.badgeNew', 'NOVO')}
              </span>
            </h2>
            <p className="text-xs text-text-mute">
              {t('pedal.settingsSubtitle', 'Passe páginas e controle o Modo Teatro usando os pés sem tirar as mãos do instrumento.')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => startTour('pedal-settings-tour')}
          className="inline-flex items-center gap-1.5 text-xs text-[#aa3bff] hover:text-[#9926f0] font-semibold transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          {t('pedal.viewTour', 'Ver Guia Rápido')}
        </button>
      </div>

      {/* Split Grid: Left Settings / Right Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Settings & Mapping */}
        <div className="lg:col-span-6 space-y-5">
          {/* Preset Profile Selector with CoachMark */}
          <CoachMark
            tourId="pedal-tour-presets"
            title={t('pedal.tourStep1Title', 'Pronto para Usar (Plug-and-Play)')}
            description={t(
              'pedal.tourStep1Desc',
              'Os pedais mais populares (PageFlip, AirTurn, Donner, Lekato) já funcionam direto da caixa sem configuração extra!'
            )}
            nextTourId="pedal-tour-mapping"
          >
            <div>
              <label className="block text-xs sm:text-sm font-medium text-text-main mb-2">
                {t('pedal.profileLabel', 'Perfil de Conexão do Pedal')}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer min-h-[40px]">
                  <input
                    type="radio"
                    name="pedalProfile"
                    value="default"
                    checked={config.profile === 'default'}
                    onChange={() => handleUpdateConfig({ profile: 'default' })}
                    className="w-4 h-4 text-[#aa3bff] focus:ring-[#aa3bff]"
                  />
                  <span className="text-xs sm:text-sm text-text-main">
                    {t('pedal.profileDefault', 'Automático (Plug-and-Play)')}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer min-h-[40px]">
                  <input
                    type="radio"
                    name="pedalProfile"
                    value="custom"
                    checked={config.profile === 'custom'}
                    onChange={() => handleUpdateConfig({ profile: 'custom' })}
                    className="w-4 h-4 text-[#aa3bff] focus:ring-[#aa3bff]"
                  />
                  <span className="text-xs sm:text-sm text-text-main">
                    {t('pedal.profileCustom', 'Personalizado')}
                  </span>
                </label>
              </div>
            </div>
          </CoachMark>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-text-main mb-2">
              {t('pedal.modeLabel', 'Comportamento Principal no Palco')}
            </label>
            <select
              value={config.mode}
              onChange={(e) =>
                handleUpdateConfig({
                  mode: e.target.value as PedalKeyConfig['mode'],
                })
              }
              className="w-full bg-bg-elevated border border-border-main rounded-md px-3 py-2 text-xs sm:text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
            >
              <option value="page_scroll">
                {t('pedal.modePageScroll', 'Rolagem por Páginas / Blocos (Recomendado)')}
              </option>
              <option value="autoscroll_toggle">
                {t('pedal.modeAutoScrollToggle', 'Ligar/Pausar AutoScroll Contínuo')}
              </option>
              <option value="song_navigation">
                {t('pedal.modeSongNavigation', 'Navegar Diretamente Entre Músicas do Setlist')}
              </option>
            </select>
          </div>

          {/* Scroll Step Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs sm:text-sm font-medium text-text-main">
                {t('pedal.scrollStepTitle', 'Salto de Rolagem por Pisada')}
              </label>
              <span className="text-xs font-bold text-[#aa3bff]">
                {config.scrollStepPercentage}% da tela
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="90"
              step="5"
              value={config.scrollStepPercentage}
              onChange={(e) =>
                handleUpdateConfig({
                  scrollStepPercentage: Number(e.target.value),
                })
              }
              className="w-full accent-[#aa3bff] h-2 bg-bg-elevated rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-text-mute mt-1">
              {t(
                'pedal.scrollStepHelper',
                'Define quanto da cifra é avançada em cada toque. 65% mantém o contexto visual da estrofe anterior.'
              )}
            </p>
          </div>

          {/* Action Mapping Box with CoachMark */}
          <CoachMark
            tourId="pedal-tour-mapping"
            title={t('pedal.tourStep2Title', 'Personalize as Teclas')}
            description={t(
              'pedal.tourStep2Desc',
              'Clique em "Aprender Tecla" e pise no pedal para associar botões customizados aos comandos.'
            )}
            nextTourId="pedal-tour-simulator"
          >
            <div className="p-3.5 rounded-md border border-border-main bg-bg-elevated/40 space-y-3">
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">
                {t('pedal.mappingTitle', 'Teclas Mapeadas')}
              </h4>

              {/* Pedal 1 / Down */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-text-main font-medium">
                  {t('pedal.keyNextLabel', 'Avançar / Rolar para Baixo')}:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-bg-card border border-border-main font-mono text-[11px] text-text-main">
                    {config.downKeys.join(', ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => startKeyListening('downKeys')}
                    className="px-2 py-1 rounded bg-[#aa3bff]/15 text-[#aa3bff] hover:bg-[#aa3bff]/25 font-bold transition-colors text-[11px]"
                  >
                    {listeningAction === 'downKeys'
                      ? t('pedal.listening', 'Pise agora...')
                      : t('pedal.learnKey', 'Aprender')}
                  </button>
                </div>
              </div>

              {/* Pedal 2 / Up */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-text-main font-medium">
                  {t('pedal.keyPrevLabel', 'Voltar / Rolar para Cima')}:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-bg-card border border-border-main font-mono text-[11px] text-text-main">
                    {config.upKeys.join(', ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => startKeyListening('upKeys')}
                    className="px-2 py-1 rounded bg-[#aa3bff]/15 text-[#aa3bff] hover:bg-[#aa3bff]/25 font-bold transition-colors text-[11px]"
                  >
                    {listeningAction === 'upKeys'
                      ? t('pedal.listening', 'Pise agora...')
                      : t('pedal.learnKey', 'Aprender')}
                  </button>
                </div>
              </div>

              {/* Pedal 3 / Toggle Scroll */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-text-main font-medium">
                  {t('pedal.keyToggleLabel', 'Ligar/Pausar AutoScroll')}:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-bg-card border border-border-main font-mono text-[11px] text-text-main">
                    {config.toggleScrollKeys.join(', ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => startKeyListening('toggleScrollKeys')}
                    className="px-2 py-1 rounded bg-[#aa3bff]/15 text-[#aa3bff] hover:bg-[#aa3bff]/25 font-bold transition-colors text-[11px]"
                  >
                    {listeningAction === 'toggleScrollKeys'
                      ? t('pedal.listening', 'Pise agora...')
                      : t('pedal.learnKey', 'Aprender')}
                  </button>
                </div>
              </div>
            </div>
          </CoachMark>

          {/* Reset button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 text-xs text-text-mute hover:text-text-main transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t('pedal.resetDefaults', 'Restaurar Padrões de Fábrica (Zero-Config)')}
            </button>
          </div>
        </div>

        {/* Right Column: Simulator Sandbox with CoachMark */}
        <div className="lg:col-span-6 flex flex-col">
          <CoachMark
            tourId="pedal-tour-simulator"
            title={t('pedal.tourStep3Title', 'Treine no Simulador')}
            description={t(
              'pedal.tourStep3Desc',
              'Pise no pedal agora mesmo! Veja a cifra de teste rolar em tempo real e confirme a resposta antes do show.'
            )}
            position="left"
          >
            <div className="h-full">
              <PedalSimulator config={config} />
            </div>
          </CoachMark>
        </div>
      </div>
    </div>
  );
};
