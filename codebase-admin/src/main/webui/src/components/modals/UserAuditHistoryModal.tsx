import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { History, X, RefreshCw, ShieldAlert, ShieldCheck, UserCheck, Calendar, MessageSquare } from 'lucide-react';
import { getUserAuditLogs } from '../../api/adminApi';
import type { AdminUser, UserAuditLog } from '../../types/admin';

interface UserAuditHistoryModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
}

export const UserAuditHistoryModal: React.FC<UserAuditHistoryModalProps> = ({
  isOpen,
  user,
  onClose,
}) => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<UserAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getUserAuditLogs(user.id);
      setLogs(data);
    } catch {
      setError(t('adminUsers.auditModal.loadError'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    if (isOpen && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchLogs();
    } else {
      setLogs([]);
      setError(null);
    }
  }, [isOpen, user, fetchLogs]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#dadad3] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#dadad3] bg-[#fbfbf9] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#aa3bff]">
              <History size={22} />
            </div>
            <div>
              <h2 id="audit-modal-title" className="text-lg font-bold text-black leading-tight">
                {t('adminUsers.auditModal.title')}
              </h2>
              <p className="text-xs text-[#62625b] mt-0.5">
                {`${user.fullName || user.email} (${user.email})`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#62625b] hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={t('adminUsers.auditModal.close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <RefreshCw className="animate-spin text-[#aa3bff]" size={28} />
              <p className="text-xs text-[#62625b]">{t('common.loading')}</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
              <p className="text-sm text-[#cc001f] font-semibold">{error}</p>
              <button
                type="button"
                onClick={fetchLogs}
                className="px-4 py-2 bg-white border border-[#dadad3] text-xs font-bold rounded-md hover:bg-[#f6f6f3]"
              >
                {t('common.retry')}
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#f6f6f3] border border-[#dadad3] flex items-center justify-center text-[#91918c]">
                <History size={24} />
              </div>
              <p className="text-sm font-semibold text-[#33332e]">
                {t('adminUsers.auditModal.noLogs')}
              </p>
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-[#dadad3] space-y-6 ml-2 py-2">
              {logs.map((log) => {
                const isBlock = log.action === 'BLOCK';
                const formattedDate = new Date(log.createdAt).toLocaleString(undefined, {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <div key={log.id} className="relative group">
                    {/* Timeline Node Icon */}
                    <div
                      className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-xs ${
                        isBlock ? 'bg-red-100 text-[#cc001f]' : 'bg-[#c7f0da] text-[#103c25]'
                      }`}
                    >
                      {isBlock ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                    </div>

                    {/* Timeline Content Card */}
                    <div className="bg-[#f6f6f3] rounded-2xl border border-[#dadad3] p-4 space-y-2.5">
                      {/* Top Meta Line */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isBlock
                              ? 'bg-red-100 text-[#cc001f] border border-red-200'
                              : 'bg-[#c7f0da] text-[#103c25] border border-[#a3e5c0]'
                          }`}
                        >
                          {isBlock
                            ? t('adminUsers.auditModal.actionBlock')
                            : t('adminUsers.auditModal.actionUnblock')}
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-[#62625b]">
                          <Calendar size={12} />
                          <span>{formattedDate}</span>
                        </div>
                      </div>

                      {/* Admin Executor */}
                      <div className="flex items-center space-x-1.5 text-xs text-[#33332e]">
                        <UserCheck size={14} className="text-[#aa3bff]" />
                        <span className="font-bold">{t('adminUsers.auditModal.executedBy')}:</span>
                        <span className="font-semibold text-black">{log.adminEmail || log.adminId}</span>
                      </div>

                      {/* Reason Block */}
                      {log.reason && (
                        <div className="bg-white rounded-xl p-3 border border-[#dadad3] text-xs text-[#33332e] space-y-1">
                          <div className="flex items-center space-x-1 text-[#62625b] font-bold">
                            <MessageSquare size={12} />
                            <span>{t('adminUsers.auditModal.reason')}</span>
                          </div>
                          <p className="whitespace-pre-wrap font-medium">{log.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#dadad3] bg-[#fbfbf9] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-md border border-[#dadad3] bg-white text-sm font-semibold text-black hover:bg-[#f6f6f3] transition-colors"
          >
            {t('adminUsers.auditModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
