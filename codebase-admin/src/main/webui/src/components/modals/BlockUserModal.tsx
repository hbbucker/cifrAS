import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, X, RefreshCw, AlertTriangle } from 'lucide-react';
import { blockUser } from '../../api/adminApi';
import type { AdminUser } from '../../types/admin';

interface BlockUserModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSuccess: (updatedUser: AdminUser) => void;
}

export const BlockUserModal: React.FC<BlockUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReason('');
      setTouched(false);
      setError(null);
    }
  }, [isOpen, user]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    },
    [loading, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !user) return null;

  const trimmedReason = reason.trim();
  const isReasonValid = trimmedReason.length >= 5 && trimmedReason.length <= 1000;
  const showMinError = touched && trimmedReason.length > 0 && trimmedReason.length < 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isReasonValid) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedUser = await blockUser(user.id, trimmedReason);
      onSuccess(updatedUser);
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError?.response?.data?.message || t('adminUsers.blockModal.errorGeneric')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="block-modal-title"
      aria-describedby="block-modal-description"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-3xl border border-[#dadad3] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#dadad3] bg-[#fbfbf9]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#cc001f]">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 id="block-modal-title" className="text-lg font-bold text-black leading-tight">
                {t('adminUsers.blockModal.title')}
              </h2>
              <p className="text-xs text-[#62625b] mt-0.5">
                {t('adminUsers.blockModal.targetUser')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-[#62625b] hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label={t('adminUsers.auditModal.close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target user badge card */}
          <div className="flex items-center space-x-3 p-3 bg-[#f6f6f3] rounded-2xl border border-[#dadad3]">
            <div className="w-10 h-10 rounded-full bg-white border border-[#dadad3] flex items-center justify-center text-[#aa3bff] font-bold text-sm">
              {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-black truncate">{user.fullName || user.email}</p>
              <p className="text-xs text-[#62625b] truncate">{user.email}</p>
            </div>
          </div>

          {/* Warning banner */}
          <div
            id="block-modal-description"
            className="flex items-start space-x-2.5 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-[#cc001f]"
          >
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p>{t('adminUsers.blockModal.description')}</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="p-3 bg-red-100 border border-red-300 text-[#cc001f] text-xs font-semibold rounded-2xl"
            >
              {error}
            </div>
          )}

          {/* Reason Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="block-reason"
                className="text-xs font-bold text-[#33332e]"
              >
                {t('adminUsers.blockModal.reasonLabel')}
              </label>
              <span className={`text-xs ${reason.length > 1000 ? 'text-[#cc001f] font-bold' : 'text-[#62625b]'}`}>
                {reason.length} / 1000
              </span>
            </div>
            <textarea
              id="block-reason"
              rows={4}
              maxLength={1000}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (!touched) setTouched(true);
              }}
              onBlur={() => setTouched(true)}
              placeholder={t('adminUsers.blockModal.reasonPlaceholder')}
              className={`w-full p-3 bg-[#f6f6f3] border rounded-2xl text-sm text-black placeholder-[#91918c] focus:outline-none transition-colors ${
                showMinError
                  ? 'border-[#cc001f] focus:border-[#cc001f]'
                  : 'border-[#dadad3] focus:border-[#aa3bff]'
              }`}
            />
            {showMinError && (
              <p className="text-xs text-[#cc001f] font-semibold">
                {t('adminUsers.blockModal.minCharsError')}
              </p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-md border border-[#dadad3] bg-white text-sm font-semibold text-[#62625b] hover:bg-[#f6f6f3] hover:text-black transition-colors disabled:opacity-50"
            >
              {t('adminUsers.blockModal.cancelButton')}
            </button>
            <button
              type="submit"
              disabled={!isReasonValid || loading}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-md bg-[#cc001f] text-white text-sm font-bold hover:bg-[#a80019] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <RefreshCw size={16} className="animate-spin" />}
              <span>{t('adminUsers.blockModal.confirmButton')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
