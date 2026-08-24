import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Music,
  Archive,
  ListMusic,
  TrendingUp,
  Clock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { getDashboardMetrics, getRecentActivity } from '../api/adminApi';
import type { AdminDashboardMetrics, RecentActivity } from '../types/admin';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [m, a] = await Promise.all([getDashboardMetrics(), getRecentActivity(6)]);
      setMetrics(m);
      setActivities(a);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);



  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="animate-spin text-[#aa3bff]" size={32} />
          <p className="text-sm text-[#62625b] font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-black">{t('dashboard.title')}</h1>
          <p className="text-sm text-[#62625b] mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-[#dadad3] rounded-md text-xs font-semibold text-black hover:bg-[#f6f6f3] transition-colors"
        >
          <RefreshCw size={14} />
          <span>{t('common.retry')}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-[#9e0a0a]">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-md border border-[#dadad3] flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#62625b] uppercase tracking-wider">
              {t('dashboard.totalUsers')}
            </p>
            <p className="text-2xl font-black text-black mt-2">{metrics?.totalUsers ?? 0}</p>
          </div>
          <div className="w-12 h-12 rounded-md bg-purple-50 flex items-center justify-center text-[#aa3bff]">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-[#dadad3] flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#62625b] uppercase tracking-wider">
              {t('dashboard.activeSongs')}
            </p>
            <p className="text-2xl font-black text-black mt-2">{metrics?.activeSongs ?? 0}</p>
          </div>
          <div className="w-12 h-12 rounded-md bg-green-50 flex items-center justify-center text-emerald-600">
            <Music size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-[#dadad3] flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#62625b] uppercase tracking-wider">
              {t('dashboard.deletedSongs')}
            </p>
            <p className="text-2xl font-black text-black mt-2">{metrics?.deletedSongs ?? 0}</p>
          </div>
          <div className="w-12 h-12 rounded-md bg-amber-50 flex items-center justify-center text-amber-600">
            <Archive size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-[#dadad3] flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#62625b] uppercase tracking-wider">
              {t('dashboard.totalPlaylists')}
            </p>
            <p className="text-2xl font-black text-black mt-2">{metrics?.totalPlaylists ?? 0}</p>
          </div>
          <div className="w-12 h-12 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
            <ListMusic size={24} />
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Growth overview */}
        <div className="bg-white p-6 rounded-md border border-[#dadad3]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-black flex items-center space-x-2">
              <TrendingUp size={18} className="text-[#aa3bff]" />
              <span>Volume de Criação</span>
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#f6f6f3] rounded-md">
              <span className="text-sm text-[#33332e] font-medium">{t('dashboard.songsToday')}</span>
              <span className="text-lg font-black text-black">{metrics?.songsCreatedToday ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#f6f6f3] rounded-md">
              <span className="text-sm text-[#33332e] font-medium">{t('dashboard.songsMonth')}</span>
              <span className="text-lg font-black text-black">{metrics?.songsCreatedThisMonth ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Top Artists */}
        <div className="bg-white p-6 rounded-md border border-[#dadad3]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-black flex items-center space-x-2">
              <Sparkles size={18} className="text-[#aa3bff]" />
              <span>{t('dashboard.topArtists')}</span>
            </h2>
          </div>
          <div className="space-y-2">
            {metrics?.topArtists && Object.keys(metrics.topArtists).length > 0 ? (
              Object.entries(metrics.topArtists).map(([artist, count]) => (
                <div key={artist} className="flex items-center justify-between py-2 border-b border-[#dadad3] last:border-none">
                  <span className="text-sm font-semibold text-black truncate max-w-[200px]">{artist}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#f6f6f3] text-[#33332e]">
                    {count} {t('users.songCount')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#62625b]">{t('common.noData')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white p-6 rounded-md border border-[#dadad3]">
        <h2 className="text-base font-bold text-black flex items-center space-x-2 mb-4">
          <Clock size={18} className="text-[#aa3bff]" />
          <span>{t('dashboard.recentActivity')}</span>
        </h2>
        <div className="divide-y divide-[#dadad3]">
          {activities.length > 0 ? (
            activities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-black">{act.title}</p>
                  <p className="text-xs text-[#62625b] mt-0.5">{act.description}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      act.type === 'SONG_DELETED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {act.type === 'SONG_DELETED' ? t('common.deleted') : t('common.active')}
                  </span>
                  <p className="text-[10px] text-[#91918c] mt-1">
                    {new Date(act.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#62625b] py-4">{t('common.noData')}</p>
          )}
        </div>
      </div>
    </div>
  );
};
