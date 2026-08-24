import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchBar } from '../components/search/SearchBar';
import { MusicCard } from '../components/cards/MusicCard';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { UserMenu } from '../components/layout/UserMenu';
import { EmptyState } from '../components/ui/EmptyState';
import { EducationalEmptyState } from '../components/ui/EducationalEmptyState';
import { Music } from 'lucide-react';
import { ShareSongModal } from '../components/modals/ShareSongModal';
import { BrandLogo } from '../components/ui/BrandLogo';

interface SongData {
 id: string;
 title: string;
 artist: string;
 originalKey?: string;
 keySignature: string;
 isFavorite: boolean;
 categories: string[];
 [key: string]: unknown;
}

export const DashboardPage: React.FC = () => {
 const { user, logout } = useAuth();
 const { t } = useTranslation();
 const navigate = useNavigate();
 const { toast } = useToast();
 const [loading, setLoading] = useState(true);
 const [songs, setSongs] = useState<SongData[]>([]);
 const [totalSongsCount, setTotalSongsCount] = useState(0);
 const [searchQuery, setSearchQuery] = useState('');

 useEffect(() => {
 // eslint-disable-next-line react-hooks/set-state-in-effect
 setLoading(true);
 const url = searchQuery ? `/api/songs?q=${encodeURIComponent(searchQuery)}` : '/api/songs';
 fetch(url, {
 headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
 })
 .then(res => {
 if (res.status === 401) {
 logout();
 navigate('/login');
 throw new Error('Unauthorized');
 }
 if (!res.ok) throw new Error('Fetch failed');
 return res.json();
 })
 .then(data => {
 const items = Array.isArray(data) ? data : (data.items || data.data || []);
 setTotalSongsCount(items.length);
 const favoriteItems = items.filter((song: Record<string, unknown>) => song.isFavorite);
 const mappedSongs = favoriteItems.slice(0, 3).map((song: Record<string, unknown>) => ({
 ...song,
 keySignature: (song.originalKey as string) || (song.keySignature as string) || 'C',
 isFavorite: song.isFavorite || false,
 categories: song.categories || [],
 }));
 setSongs(mappedSongs);
 setLoading(false);
 })
 .catch(() => {
 toast(t('dashboard.loadError'), 'error');
 setLoading(false);
 });
 }, [logout, navigate, toast, searchQuery, t]);

 const handleDelete = (id: string) => {
 if (!window.confirm(t('dashboard.confirmDelete'))) return;

 fetch(`/api/songs/${id}`, {
 method: 'DELETE',
 headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
 })
 .then(res => {
 if (res.status === 401) {
 logout();
 navigate('/login');
 throw new Error('Unauthorized');
 }
 if (!res.ok) throw new Error('Delete failed');
 setSongs(prev => prev.filter(song => song.id !== id));
 toast(t('dashboard.deleteSuccess'), 'success');
 })
 .catch(() => toast(t('dashboard.deleteError'), 'error'));
 };

  const handleToggleFavorite = (id: string) => {
    fetch(`/api/songs/${id}/favorite`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => {
      if (res.status === 401) {
        logout();
        navigate('/login');
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Toggle favorite failed');
      return res.json();
    })
    .then((updatedSong) => {
      // In Dashboard, we want to remove the song if it's no longer favorite.
      setSongs(prev => {
        const newSongs = prev.map(song => song.id === id ? { ...song, isFavorite: updatedSong.isFavorite } : song);
        return newSongs.filter(song => song.isFavorite);
      });
    })
    .catch(() => toast('Error toggling favorite', 'error'));
  };

  const [sharingSong, setSharingSong] = useState<{ id: string; title: string } | null>(null);

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
      <header className="min-h-[52px] sm:min-h-[64px] flex items-center justify-between px-3.5 sm:px-6 bg-bg-card/95 backdrop-blur border-b border-border-main gap-2 sm:gap-4 shrink-0" role="banner">
        <div className="flex items-center gap-3 shrink-0">
          <div className="sm:hidden">
            <BrandLogo size="sm" asLink to="/dashboard" />
          </div>
          <h1 className="text-xl font-bold text-text-main hidden sm:block">{t('dashboard.title')}</h1>
        </div>
        <div className="flex-1 min-w-0 sm:ml-4 max-w-xl">
          <SearchBar onSearch={setSearchQuery} />
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <UserMenu />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 pb-24 sm:pb-8 min-w-0">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-text-main mb-1 sm:mb-2">
            {t('dashboard.welcome', { name: user?.name?.split(' ')[0] || 'Musician' })}
          </h2>
          <p className="text-xs sm:text-sm text-text-mute">{t('dashboard.subtitle')}</p>
        </div>

        <div className="mb-4 sm:mb-6 flex justify-between items-center">
          <h3 className="text-base sm:text-lg font-bold text-text-main">
            {searchQuery ? t('dashboard.searchResults', { query: searchQuery }) : t('dashboard.favorites')}
          </h3>
          <button
            onClick={() => navigate('/songs')}
            className="text-xs sm:text-sm font-medium text-[#8629cc] hover:underline p-1 min-h-[36px] flex items-center"
            data-testid="view-all-btn"
          >
            {t('dashboard.viewAll')}
          </button>
        </div>

        {loading ? (
          <SkeletonCard count={3} />
        ) : songs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {songs.map((song) => (
              <div key={song.id} onClick={() => navigate(`/song/${song.id}`)} className="cursor-pointer" data-testid={`view-song-${song.id}`}>
                <MusicCard
                  {...song}
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={(id) => navigate(`/songs/edit/${id}`)}
                  onShare={() => setSharingSong({ id: song.id, title: song.title })}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
 ) : totalSongsCount === 0 ? (
 <EducationalEmptyState
   icon={Music}
   title={t('dashboard.educationalEmptyTitle')}
   steps={[
     t('dashboard.educationalEmptyStep1'),
     t('dashboard.educationalEmptyStep2'),
     t('dashboard.educationalEmptyStep3')
   ]}
   action={{ label: t('dashboard.addSong'), onClick: () => navigate('/songs/new') }}
 />
 ) : (
 <EmptyState
 icon={Music}
 title={t('dashboard.emptyTitle')}
 description={t('dashboard.emptyDesc')}
 action={{ label: t('dashboard.addSong'), onClick: () => navigate('/songs/new') }}
 />
 )}
 </div>
 {sharingSong && (
    <ShareSongModal
      isOpen={!!sharingSong}
      songId={sharingSong.id}
      songTitle={sharingSong.title}
      onClose={() => setSharingSong(null)}
    />
  )}
  </div>
 );
};
