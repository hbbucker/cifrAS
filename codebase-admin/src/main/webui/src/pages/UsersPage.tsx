import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronLeft, ChevronRight, Shield, User, RefreshCw } from 'lucide-react';
import { getAdminUsers } from '../api/adminApi';
import type { AdminUser, PagedResponse } from '../types/admin';

export const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<PagedResponse<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const fetchUsers = React.useCallback(async () => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-black">{t('users.title')}</h1>
          <p className="text-sm text-[#62625b] mt-1">{t('users.subtitle')}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-md border border-[#dadad3] shadow-xs">
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
            className="px-5 py-2 bg-[#aa3bff] text-white rounded-md text-sm font-semibold hover:bg-[#9329e6] transition-colors"
          >
            {t('common.search')}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border border-[#dadad3] overflow-hidden shadow-xs">
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
                    <th className="px-6 py-3">{t('users.songCount')}</th>
                    <th className="px-6 py-3">{t('common.createdAt')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dadad3]">
                  {data?.items && data.items.length > 0 ? (
                    data.items.map((user) => (
                      <tr key={user.id} className="hover:bg-[#fbfbf9] transition-colors">
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-[#f6f6f3] border border-[#dadad3] flex items-center justify-center text-[#aa3bff] font-bold">
                            {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-black">{user.fullName || user.email}</p>
                            <p className="text-xs text-[#62625b]">{user.email}</p>
                          </div>
                        </td>
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
                        <td className="px-6 py-4 font-semibold text-black">
                          {user.songCount} {t('users.songCount')}
                        </td>
                        <td className="px-6 py-4 text-xs text-[#62625b]">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-xs text-[#62625b]">
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
                    className="p-1.5 rounded-md bg-white border border-[#dadad3] text-black disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={data.page >= data.totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-md bg-white border border-[#dadad3] text-black disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
