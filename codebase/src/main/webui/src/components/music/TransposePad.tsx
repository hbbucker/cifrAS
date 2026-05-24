import React from 'react';
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
  return (
    <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 shadow-inner">
      <button
        onClick={onTransposeDown}
        disabled={disabled}
        className="w-12 h-12 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-700 dark:text-gray-200"
        aria-label="Transpose down"
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
        className="w-12 h-12 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-700 dark:text-gray-200"
        aria-label="Transpose up"
        data-testid="transpose-up"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};
