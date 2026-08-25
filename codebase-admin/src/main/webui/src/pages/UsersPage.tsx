import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  RefreshCw,
  Ban,
  CheckCircle2,
  History,
  CheckCircle,
  X,
} from 'lucide-react';
import { getAdminUsers } from '../api/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { BlockUserModal } from '../components/modals/BlockUserModal';
import { UnblockUserModal } from '../components/modals/UnblockUserModal';
import { UserAuditHistoryModal } from '../components/modals/UserAuditHistoryModal';
import type { AdminUser, PagedResponse } from '../types/admin';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const { user: currentAdmin } = useAdminAuth();

  const [data, setData] = useState<PagedResponse<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  // Modal States
  const [selectedUserForBlock, setSelectedUserForBlock] = useState<AdminUser | null>(null);
  const [selectedUserForUnblock, setSelectedUserForUnblock] = useState<AdminUser | null>(null);
  const [selectedUserForAudit, setSelectedUserForAudit] = useState<AdminUser | null>(null);

  // Toast State
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminUsers(page, 15, search);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleUserUpdated = (updatedUser: AdminUser, isBlockAction: boolean) => {
    setData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)),
      };
    });

    const successMessage = isBlockAction
      ? t('adminUsers.blockModal.successToast')
      : t('adminUsers.unblockModal.successToast');
    showToast(successMessage, 'success');
  };

  const isSelf = (user: AdminUser) => {
    if (!currentAdmin) return false;
    if (currentAdmin.id && user.id && currentAdmin.id === user.id) return true;
    if (
      currentAdmin.email &&
      user.email &&
      currentAdmin.email.toLowerCase() === user.email.toLowerCase()
    ) {
      return true;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl bg-white border border-[#dadad3] shadow-lg text-sm transition-all duration-300"
        >
          <CheckCircle size={18} className="text-[#103c25] shrink-0" />
          <span className="font-semibold text-black">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[#62625b] hover:text-black p-1 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-black">{t('users.title')}</h1>
          <p className="text-sm text-[#62625b] mt-1">{t('users.subtitle')}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#dadad3]">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#91918c]" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('users.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 bg-[#f6f6f3] border border-[#dadad3] rounded-md text-sm text-black placeholder-[#91918c] focus:outline-none focus:border-[#aa3bff]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#aa3bff] text-white rounded-md text-sm font-semibold hover:bg-[#9329e6] transition-colors cursor-pointer"
          >
            {t('common.search')}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#dadad3] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="animate-spin text-[#aa3bff]" size={28} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#33332e]">
                <thead className="bg-[#f6f6f3] border-b border-[#dadad3] text-xs font-bold text-[#62625b] uppercase">
                  <tr>
                    <th className="px-6 py-3">{t('users.title')}</th>
                    <th className="px-6 py-3">{t('common.role')}</th>
                    <th className="px-6 py-3">{t('common.status')}</th>
                    <th className="px-6 py-3">{t('users.songCount')}</th>
                    <th className="px-6 py-3">{t('common.createdAt')}</th>
                    <th className="px-6 py-3 text-right">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dadad3]">
                  {data?.items && data.items.length > 0 ? (
                    data.items.map((user) => {
                      const isBlocked = user.isBlocked || user.status === 'BLOCKED';
                      const userIsSelf = isSelf(user);

                      return (
                        <tr key={user.id} className="hover:bg-[#fbfbf9] transition-colors">
                          {/* User Avatar + Name + Email */}
                          <td className="px-6 py-4 flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-[#f6f6f3] border border-[#dadad3] flex items-center justify-center text-[#aa3bff] font-bold">
                              {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-black">{user.fullName || user.email}</p>
                              <p className="text-xs text-[#62625b]">{user.email}</p>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                user.isAdmin
                                  ? 'bg-purple-100 text-[#aa3bff]'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {user.isAdmin ? <Shield size={12} /> : <User size={12} />}
                              <span>{user.isAdmin ? t('common.admin') : t('common.user')}</span>
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => setSelectedUserForAudit(user)}
                              title={t('adminUsers.actions.viewHistory')}
                              className="group cursor-pointer"
                            >
                              <span
                                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold transition-transform group-hover:scale-105 ${
                                  isBlocked
                                    ? 'bg-red-100 text-[#cc001f] border border-red-200'
                                    : 'bg-[#c7f0da] text-[#103c25]'
                                }`}
                              >
                                <span>
                                  {isBlocked
                                    ? t('adminUsers.status.blocked')
                                    : t('adminUsers.status.active')}
                                </span>
                              </span>
                            </button>
                          </td>

                          {/* Song Count */}
                          <td className="px-6 py-4 font-semibold text-black">
                            {user.songCount} {t('users.songCount')}
                          </td>

                          {/* Created At */}
                          <td className="px-6 py-4 text-xs text-[#62625b]">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Audit History Action */}
                              <button
                                type="button"
                                data-testid={`audit-user-btn-${user.id}`}
                                onClick={() => setSelectedUserForAudit(user)}
                                title={t('adminUsers.actions.viewHistory')}
                                className="p-1.5 rounded-md border border-[#dadad3] bg-white text-[#62625b] hover:bg-[#f6f6f3] hover:text-black transition-colors cursor-pointer"
                                aria-label={t('adminUsers.actions.viewHistory')}
                              >
                                <History size={16} />
                              </button>

                              {/* Block / Unblock Action */}
                              {isBlocked ? (
                                <button
                                  type="button"
                                  data-testid={`unblock-user-btn-${user.id}`}
                                  onClick={() => setSelectedUserForUnblock(user)}
                                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#aa3bff] text-white text-xs font-bold hover:bg-[#9329e6] transition-colors cursor-pointer"
                                >
                                  <CheckCircle2 size={14} />
                                  <span>{t('adminUsers.actions.unblock')}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  data-testid={`block-user-btn-${user.id}`}
                                  disabled={userIsSelf}
                                  onClick={() => !userIsSelf && setSelectedUserForBlock(user)}
                                  title={
                                    userIsSelf
                                      ? t('adminUsers.actions.cannotBlockSelf')
                                      : t('adminUsers.actions.block')
                                  }
                                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                                    userIsSelf
                                      ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-50'
                                      : 'bg-red-50 text-[#cc001f] border border-red-200 hover:bg-[#cc001f] hover:text-white cursor-pointer'
                                  }`}
                                >
                                  <Ban size={14} />
                                  <span>{t('adminUsers.actions.block')}</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-xs text-[#62625b]">
                        {t('common.noData')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 bg-[#f6f6f3] border-t border-[#dadad3] text-xs">
                <span className="text-[#62625b]">
                  {t('common.page')} {data.page + 1} {t('common.of')} {data.totalPages} (
                  {data.totalElements} {t('common.total')})
                </span>
                <div className="flex space-x-2">
                  <button
                    disabled={data.page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="p-1.5 rounded-md bg-white border border-[#dadad3] text-black disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={data.page >= data.totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-md bg-white border border-[#dadad3] text-black disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <BlockUserModal
        isOpen={Boolean(selectedUserForBlock)}
        user={selectedUserForBlock}
        onClose={() => setSelectedUserForBlock(null)}
        onSuccess={(updatedUser) => handleUserUpdated(updatedUser, true)}
      />

      <UnblockUserModal
        isOpen={Boolean(selectedUserForUnblock)}
        user={selectedUserForUnblock}
        onClose={() => setSelectedUserForUnblock(null)}
        onSuccess={(updatedUser) => handleUserUpdated(updatedUser, false)}
      />

      <UserAuditHistoryModal
        isOpen={Boolean(selectedUserForAudit)}
        user={selectedUserForAudit}
        onClose={() => setSelectedUserForAudit(null)}
      />
    </div>
  );
};
