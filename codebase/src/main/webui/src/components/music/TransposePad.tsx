import React from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react';

interface TransposePadProps {
  currentKey: string;
  onTransposeUp: () => void;
  onTransposeDown: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TransposePad: React.FC<TransposePadProps> = ({
  currentKey, onTransposeUp, onTransposeDown, disabled = false, size = 'md'
}) => {
  const { t } = useTranslation();
  const isSmall = size === 'sm';

  return (
    <div className={`inline-flex items-center bg-bg-elevated rounded-md ${isSmall ? 'p-0.5' : 'p-1'} border border-border-main shadow-inner`}>
      <button
        onClick={onTransposeDown}
        disabled={disabled}
        className={`${isSmall ? 'w-8 h-8 sm:w-10 sm:h-10 min-w-[32px] min-h-[32px]' : 'w-10 h-10 sm:w-12 sm:h-12 min-w-[40px] min-h-[40px]'} flex items-center justify-center rounded-lg bg-bg-card shadow-xs hover:bg-bg-elevated active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-text-main`}
        aria-label={t('transposePad.down')}
        data-testid="transpose-down"
      >
        <Minus className={isSmall ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-5 sm:h-5'} />
      </button>
      
      <div className={`${isSmall ? 'w-10 sm:w-14 h-8 sm:h-10 text-sm sm:text-base' : 'w-13 sm:w-16 h-10 sm:h-12 text-base sm:text-lg'} flex items-center justify-center font-bold text-[#aa3bff] select-none`} aria-live="polite" data-testid="current-key">
        {currentKey}
      </div>
      
      <button
        onClick={onTransposeUp}
        disabled={disabled}
        className={`${isSmall ? 'w-8 h-8 sm:w-10 sm:h-10 min-w-[32px] min-h-[32px]' : 'w-10 h-10 sm:w-12 sm:h-12 min-w-[40px] min-h-[40px]'} flex items-center justify-center rounded-lg bg-bg-card shadow-xs hover:bg-bg-elevated active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-text-main`}
        aria-label={t('transposePad.up')}
        data-testid="transpose-up"
      >
        <Plus className={isSmall ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-5 sm:h-5'} />
      </button>
    </div>
  );
};
