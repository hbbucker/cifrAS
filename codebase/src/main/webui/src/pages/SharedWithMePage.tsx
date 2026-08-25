import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Play, Music, Check, X, Mail } from 'lucide-react';
import { getGroupPlaylists } from '../api/groups';
import { getPendingSongShares, acceptSongShare, declineSongShare } from '../api/songShares';
import type { PendingSongShareItem } from '../api/songShares';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BrandLogo } from '../components/ui/BrandLogo';

interface Playlist {
  id: number;
  name: string;
  songCount?: number;
  songs?: unknown[];
  groupName?: string;
  userId?: string;
}

export const SharedWithMePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [pendingShares, setPendingShares] = useState<PendingSongShareItem[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [loadingShares, setLoadingShares] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSharedPlaylists = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/groups', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch groups');
        const groups = await res.json();
        
        const allPlaylists: Playlist[] = [];
        for (const group of groups) {
          try {
            const groupPlaylists = await getGroupPlaylists(group.id) as unknown as Playlist[];
            groupPlaylists.forEach((p) => {
              allPlaylists.push({ ...p, groupName: group.name });
            });
          } catch {
            console.error(`Failed to fetch playlists for group ${group.id}`);
          }
        }
        
        const unique = Array.from(new Map(allPlaylists.map(p => [p.id, p])).values());
        const sharedWithMe = unique.filter(p => p.userId !== user?.id);
        setPlaylists(sharedWithMe);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPlaylists(false);
      }
    };
    
    fetchSharedPlaylists();
  }, [user?.id]);

  useEffect(() => {
    const fetchPendingShares = async () => {
      try {
        const shares = await getPendingSongShares();
        setPendingShares(shares);
      } catch (err) {
        console.error('Failed to fetch pending song shares', err);
      } finally {
        setLoadingShares(false);
      }
    };

    fetchPendingShares();
  }, []);

  const handleAccept = async (shareId: string) => {
    setActionLoading(prev => ({ ...prev, [shareId]: true }));
    try {
      await acceptSongShare(shareId);
      setPendingShares(prev => prev.filter(s => s.shareId !== shareId));
      toast(t('songSharing.acceptSuccess'), 'success');
    } catch {
      toast(t('songSharing.generalError'), 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [shareId]: false }));
    }
  };

  const handleDecline = async (shareId: string) => {
    setActionLoading(prev => ({ ...prev, [shareId]: true }));
    try {
      await declineSongShare(shareId);
      setPendingShares(prev => prev.filter(s => s.shareId !== shareId));
      toast(t('songSharing.declineSuccess'), 'warning');
    } catch {
      toast(t('songSharing.generalError'), 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [shareId]: false }));
    }
  };



  return (
    <>
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <header className="relative z-20 min-h-[52px] sm:min-h-[64px] flex items-center px-3.5 sm:px-6 bg-bg-card border-b border-border-main shrink-0 gap-2 sm:gap-3" role="banner">
          <BrandLogo iconOnly size="sm" asLink to="/dashboard" className="sm:hidden shrink-0" />
          <h1 className="text-lg sm:text-xl font-bold text-text-main truncate">{t('sharedWithMe.title')}</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 pb-24 sm:pb-8 space-y-6 sm:space-y-8 min-w-0">
          {/* Músicas Recebidas / Compartilhadas */}
          <section>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#8629cc]" />
              <h2 className="text-base sm:text-lg font-bold text-text-main">
                {t('songSharing.receivedSongs')}
              </h2>
              {pendingShares.length > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#8629cc]/10 text-[#8629cc]">
                  {pendingShares.length}
                </span>
              )}
            </div>

            {loadingShares ? (
              <div className="text-center py-6 text-text-mute text-sm">{t('sharedWithMe.loading')}</div>
            ) : pendingShares.length === 0 ? (
              <div className="text-center py-8 text-text-mute bg-bg-card rounded-2xl border border-dashed border-border-main text-xs sm:text-sm">
                {t('songSharing.noPendingSongs')}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
                {pendingShares.map(share => (
                  <div
                    key={share.shareId}
                    className="bg-bg-card rounded-2xl border border-border-main p-4 sm:p-5 hover:shadow-md transition-shadow flex flex-col justify-between min-w-0"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="p-2 rounded-xl bg-[#8629cc]/10 text-[#8629cc] shrink-0">
                            <Music className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-base text-text-main truncate">
                              {share.songTitle}
                            </h3>
                            <p className="text-xs text-text-mute truncate">{share.songArtist}</p>
                          </div>
                        </div>
                        {share.originalKey && (
                          <span className="text-xs font-bold px-2 py-0.5 bg-bg-elevated text-text-main rounded-md shrink-0">
                            {share.originalKey}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-text-mute mt-2.5 line-clamp-1">
                        {t('songSharing.sharedBy', { email: share.inviteeEmail })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-main/60">
                      <button
                        onClick={() => handleDecline(share.shareId)}
                        disabled={actionLoading[share.shareId]}
                        className="flex-1 py-2 px-3 min-h-[38px] sm:min-h-[44px] rounded-xl text-xs font-medium text-text-mute hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border border-border-main transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        {t('songSharing.decline')}
                      </button>
                      <button
                        onClick={() => handleAccept(share.shareId)}
                        disabled={actionLoading[share.shareId]}
                        className="flex-1 py-2 px-3 min-h-[38px] sm:min-h-[44px] rounded-xl text-xs font-medium text-white bg-[#8629cc] hover:bg-[#721eb8] transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        {t('songSharing.accept')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Playlists Compartilhadas */}
          <section>
            <h2 className="text-base sm:text-lg font-bold text-text-main mb-3 sm:mb-4">
              {t('sidebar.playlists')}
            </h2>

            {loadingPlaylists ? (
              <div className="text-center py-6 text-text-mute text-sm">{t('sharedWithMe.loading')}</div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-8 text-text-mute bg-bg-card rounded-2xl border border-dashed border-border-main text-xs sm:text-sm">
                {t('sharedWithMe.noPlaylists')}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
                {playlists.map(playlist => (
                  <div key={playlist.id} className="bg-bg-card rounded-2xl border border-border-main p-4 sm:p-5 hover:shadow-md transition-shadow flex flex-col min-w-0">
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div className="flex-1 cursor-pointer min-w-0" onClick={() => navigate(`/playlists/${playlist.id}`)}>
                        <h3 className="font-bold text-base sm:text-lg text-text-main mb-1 truncate">{playlist.name}</h3>
                        <p className="text-xs sm:text-sm text-text-mute">
                          {playlist.songCount ?? playlist.songs?.length ?? 0} {t('playlists.songsCount')}
                        </p>
                      </div>
                      <button 
                        onClick={() => navigate(`/theater/${playlist.id}`)}
                        className="p-2 min-h-[38px] min-w-[38px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center bg-[#8629cc]/10 text-[#8629cc] hover:bg-[#8629cc]/20 rounded-full transition-colors ml-3 shrink-0"
                        title={t('sharedWithMe.playTheater')}
                      >
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                      </button>
                    </div>
                    <div className="mt-auto">
                      <span className="text-[11px] sm:text-xs font-bold text-text-mute uppercase tracking-wider bg-bg-elevated inline-block px-2 py-0.5 sm:py-1 rounded-md truncate max-w-full">
                        {t('sharedWithMe.from')}: {playlist.groupName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};
