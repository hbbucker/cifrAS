import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, X, RefreshCw } from 'lucide-react';
import { unblockUser } from '../../api/adminApi';
import type { AdminUser } from '../../types/admin';

interface UnblockUserModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSuccess: (updatedUser: AdminUser) => void;
}

export const UnblockUserModal: React.FC<UnblockUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReason('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      const trimmed = reason.trim();
      const updatedUser = await unblockUser(user.id, trimmed ? trimmed : undefined);
      onSuccess(updatedUser);
      onClose();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError?.response?.data?.message || t('adminUsers.unblockModal.errorGeneric')
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
      aria-labelledby="unblock-modal-title"
      aria-describedby="unblock-modal-description"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-3xl border border-[#dadad3] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#dadad3] bg-[#fbfbf9]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#c7f0da] flex items-center justify-center text-[#103c25]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 id="unblock-modal-title" className="text-lg font-bold text-black leading-tight">
                {t('adminUsers.unblockModal.title')}
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

          {/* Description */}
          <p id="unblock-modal-description" className="text-sm text-[#33332e]">
            {t('adminUsers.unblockModal.description')}
          </p>

          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="p-3 bg-red-100 border border-red-300 text-[#cc001f] text-xs font-semibold rounded-2xl"
            >
              {error}
            </div>
          )}

          {/* Optional Reason Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="unblock-reason"
                className="text-xs font-bold text-[#33332e]"
              >
                {t('adminUsers.unblockModal.reasonLabel')}
              </label>
              <span className={`text-xs ${reason.length > 1000 ? 'text-[#cc001f] font-bold' : 'text-[#62625b]'}`}>
                {reason.length} / 1000
              </span>
            </div>
            <textarea
              id="unblock-reason"
              rows={3}
              maxLength={1000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('adminUsers.unblockModal.reasonPlaceholder')}
              className="w-full p-3 bg-[#f6f6f3] border border-[#dadad3] rounded-2xl text-sm text-black placeholder-[#91918c] focus:outline-none focus:border-[#aa3bff] transition-colors"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-md border border-[#dadad3] bg-white text-sm font-semibold text-[#62625b] hover:bg-[#f6f6f3] hover:text-black transition-colors disabled:opacity-50"
            >
              {t('adminUsers.unblockModal.cancelButton')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-md bg-[#aa3bff] text-white text-sm font-bold hover:bg-[#9329e6] transition-colors disabled:opacity-50"
            >
              {loading && <RefreshCw size={16} className="animate-spin" />}
              <span>{t('adminUsers.unblockModal.confirmButton')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
