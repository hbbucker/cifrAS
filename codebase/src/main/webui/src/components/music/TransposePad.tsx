import React from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react';

interface TransposePadProps {
 currentKey: string;
 onTransposeUp: () => void;
 onTransposeDown: () => void;
 disabled?: boolean;
}

export const TransposePad: React.FC<TransposePadProps> = ({
 currentKey, onTransposeUp, onTransposeDown, disabled = false
}) => {
  const { t } = useTranslation();
 return (
 <div className="inline-flex items-center bg-bg-elevated rounded-lg p-1 border border-border-main shadow-inner">
 <button
 onClick={onTransposeDown}
 disabled={disabled}
 className="w-12 h-12 flex items-center justify-center rounded-md bg-bg-card shadow-sm hover:bg-bg-elevated active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-text-main"
 aria-label={t('transposePad.down')}
 data-testid="transpose-down"
 >
 <Minus className="w-5 h-5" />
 </button>
 
 <div className="w-16 h-12 flex items-center justify-center font-bold text-lg text-[#aa3bff]" aria-live="polite" data-testid="current-key">
 {currentKey}
 </div>
 
 <button
 onClick={onTransposeUp}
 disabled={disabled}
 className="w-12 h-12 flex items-center justify-center rounded-md bg-bg-card shadow-sm hover:bg-bg-elevated active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-text-main"
 aria-label={t('transposePad.up')}
 data-testid="transpose-up"
 >
 <Plus className="w-5 h-5" />
 </button>
 </div>
 );
};
