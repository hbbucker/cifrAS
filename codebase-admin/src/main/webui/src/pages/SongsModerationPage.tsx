import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Archive,
  RotateCcw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Tag,
} from 'lucide-react';
import { getAdminSongs, softDeleteSong, restoreSong, permanentDeleteSong } from '../api/adminApi';
import type { AdminSong, PagedResponse } from '../types/admin';

export const SongsModerationPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<PagedResponse<AdminSong> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletedOnly, setDeletedOnly] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSongs = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminSongs(page, 15, search, deletedOnly);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, deletedOnly]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSongs();
  }, [fetchSongs]);



  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchSongs();
  };

  const handleSoftDelete = async (song: AdminSong) => {
    if (!window.confirm(t('songs.softDeleteConfirm'))) return;
    try {
      setActionLoading(song.id);
      await softDeleteSong(song.id);
      await fetchSongs();
    } catch (err) {
      alert(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (song: AdminSong) => {
    if (!window.confirm(t('songs.restoreConfirm'))) return;
    try {
      setActionLoading(song.id);
      await restoreSong(song.id);
      await fetchSongs();
    } catch (err) {
      alert(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (song: AdminSong) => {
    if (!window.confirm(t('songs.permanentDelete') + '?')) return;
    try {
      setActionLoading(song.id);
      await permanentDeleteSong(song.id);
      await fetchSongs();
    } catch (err) {
      alert(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-black">{t('songs.title')}</h1>
        <p className="text-sm text-[#62625b] mt-1">{t('songs.subtitle')}</p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-md border border-[#dadad3] space-y-4">
        {/* Tabs */}
        <div className="flex space-x-2 border-b border-[#dadad3] pb-3">
          <button
            onClick={() => {
              setDeletedOnly(undefined);
              setPage(0);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              deletedOnly === undefined
                ? 'bg-black text-white'
                : 'bg-[#f6f6f3] text-[#62625b] hover:text-black'
            }`}
          >
            {t('songs.tabAll')}
          </button>
          <button
            onClick={() => {
              setDeletedOnly(false);
              setPage(0);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              deletedOnly === false
                ? 'bg-[#aa3bff] text-white'
                : 'bg-[#f6f6f3] text-[#62625b] hover:text-black'
            }`}
          >
            {t('songs.tabActive')}
          </button>
          <button
            onClick={() => {
              setDeletedOnly(true);
              setPage(0);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              deletedOnly === true
                ? 'bg-amber-600 text-white'
                : 'bg-[#f6f6f3] text-[#62625b] hover:text-black'
            }`}
          >
            {t('songs.tabDeleted')}
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#91918c]" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('songs.searchPlaceholder')}
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
                    <th className="px-6 py-3">{t('songs.titleCol')}</th>
                    <th className="px-6 py-3">{t('songs.artistCol')}</th>
                    <th className="px-6 py-3">{t('songs.keyCol')}</th>
                    <th className="px-6 py-3">{t('common.status')}</th>
                    <th className="px-6 py-3 text-right">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dadad3]">
                  {data?.items && data.items.length > 0 ? (
                    data.items.map((song) => (
                      <tr key={song.id} className="hover:bg-[#fbfbf9] transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-black">{song.title}</p>
                          {song.tags && song.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {song.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center space-x-0.5 text-[10px] bg-[#f6f6f3] px-2 py-0.5 rounded-full text-[#62625b]"
                                >
                                  <Tag size={10} />
                                  <span>{tag}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-[#33332e]">{song.artist}</td>
                        <td className="px-6 py-4 font-mono font-bold text-xs text-[#aa3bff]">
                          {song.originalKey || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                              song.isDeleted
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {song.isDeleted ? t('common.deleted') : t('common.active')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center space-x-2">
                            {song.isDeleted ? (
                              <button
                                disabled={actionLoading === song.id}
                                onClick={() => handleRestore(song)}
                                title={t('songs.restore')}
                                className="p-1.5 text-emerald-600 hover:bg-green-50 rounded-md transition-colors"
                              >
                                <RotateCcw size={16} />
                              </button>
                            ) : (
                              <button
                                disabled={actionLoading === song.id}
                                onClick={() => handleSoftDelete(song)}
                                title={t('songs.softDelete')}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                              >
                                <Archive size={16} />
                              </button>
                            )}
                            <button
                              disabled={actionLoading === song.id}
                              onClick={() => handlePermanentDelete(song)}
                              title={t('songs.permanentDelete')}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-xs text-[#62625b]">
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
