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
import { Music } from 'lucide-react';

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
 const items = Array.isArray(data) ? data : (data.data || []);
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

 return (
  <main className="flex-1 flex flex-col h-full overflow-hidden">
 <header className="h-16 flex items-center justify-between px-6 bg-bg-card border-b border-border-main">
 <h1 className="text-xl font-bold text-text-main hidden sm:block">{t('dashboard.title')}</h1>
 <div className="flex-1 sm:ml-8">
 <SearchBar onSearch={setSearchQuery} />
 </div>
 <div className="ml-4 flex items-center gap-4">
 <UserMenu />
 </div>
 </header>

  <div className="flex-1 overflow-y-auto p-6 pb-6">
 <div className="mb-8">
 <h2 className="text-2xl font-bold text-text-main mb-2">
 {t('dashboard.welcome', { name: user?.name?.split(' ')[0] || 'Musician' })}
 </h2>
 <p className="text-text-mute">{t('dashboard.subtitle')}</p>
 </div>

 <div className="mb-6 flex justify-between items-center">
 <h3 className="text-lg font-bold text-text-main">
 {searchQuery ? t('dashboard.searchResults', { query: searchQuery }) : t('dashboard.favorites')}
 </h3>
 <button
 onClick={() => navigate('/songs')}
 className="text-sm font-medium text-[#aa3bff] hover:underline"
 data-testid="view-all-btn"
 >
 {t('dashboard.viewAll')}
 </button>
 </div>

 {loading ? (
 <SkeletonCard count={3} />
 ) : songs.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {songs.map((song) => (
 <div key={song.id} onClick={() => navigate(`/song/${song.id}`)} className="cursor-pointer" data-testid={`view-song-${song.id}`}>
 <MusicCard
 {...song}
 onToggleFavorite={handleToggleFavorite}
 onEdit={(id) => navigate(`/songs/edit/${id}`)}
 onShare={() => { }}
 onDelete={handleDelete}
 />
 </div>
 ))}
 </div>
 ) : (
 <EmptyState
 icon={Music}
 title={t('dashboard.emptyTitle')}
 description={t('dashboard.emptyDesc')}
 action={{ label: t('dashboard.addSong'), onClick: () => navigate('/songs/new') }}
 />
 )}
 </div>
  </main>
 );
};
