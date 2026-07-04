import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type ConfirmVariant = 'danger' | 'warning';

interface ConfirmModalProps {
 isOpen: boolean;
 title: string;
 message: string;
 variant?: ConfirmVariant;
 confirmText?: string;
 cancelText?: string;
 onConfirm: () => void;
 onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
 isOpen,
 title,
 message,
 variant = 'danger',
 confirmText,
 cancelText,
 onConfirm,
 onCancel,
}) => {
 const { t } = useTranslation();

 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape' && isOpen) {
 onCancel();
 }
 };
 window.addEventListener('keydown', handleKeyDown);
 return () => window.removeEventListener('keydown', handleKeyDown);
 }, [isOpen, onCancel]);

 if (!isOpen) return null;

 const btnBg = variant === 'danger' ? 'bg-[#EF4444] hover:bg-red-600' : 'bg-[#F59E0B] hover:bg-yellow-600';

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
 <div className="bg-bg-card rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
 <h3 className="text-xl font-bold mb-2 text-text-main">{title}</h3>
 <p className="text-text-mute mb-6">{message}</p>
 <div className="flex justify-center gap-4">
 <button
 onClick={onCancel}
 className="px-4 py-2 rounded font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
 >
 {cancelText || t('common.cancel')}
 </button>
 <button
 onClick={onConfirm}
 className={`px-4 py-2 rounded font-medium text-white transition-colors ${btnBg}`}
 >
 {confirmText || t('common.confirm')}
 </button>
 </div>
 </div>
 </div>
 );
};
