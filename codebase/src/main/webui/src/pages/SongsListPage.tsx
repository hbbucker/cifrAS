import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomNav } from '../components/layout/BottomNav';
import { MusicCard } from '../components/cards/MusicCard';
import { Filter, Plus, Music, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';

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

export const SongsListPage: React.FC = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const { logout } = useAuth();
 const { toast } = useToast();
 const [songs, setSongs] = useState<SongData[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const [debouncedQuery, setDebouncedQuery] = useState('');

 useEffect(() => {
 const timer = setTimeout(() => {
 setDebouncedQuery(searchQuery);
 }, 300);
 return () => clearTimeout(timer);
 }, [searchQuery]);

 useEffect(() => {
 // eslint-disable-next-line react-hooks/set-state-in-effect
 setLoading(true);
 const controller = new AbortController();
 const signal = controller.signal;
 
 const queryParam = debouncedQuery.trim().length >= 3 
 ? `?q=${encodeURIComponent(debouncedQuery.trim())}` 
 : '';

 fetch(`/api/songs${queryParam}`, {
 headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
 signal
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
 const mappedSongs = items.map((song: Record<string, unknown>) => ({
 ...song,
 keySignature: (song.originalKey as string) || (song.keySignature as string) || 'C',
 isFavorite: song.isFavorite || false,
 categories: song.categories || [],
 }));
 setSongs(mappedSongs);
 setLoading(false);
 })
 .catch((err) => {
 if (err.name === 'AbortError') return;
 toast(t('songsList.loadError'), 'error');
 setLoading(false);
 });

 return () => {
 controller.abort();
 };
 }, [debouncedQuery, logout, navigate, toast]);

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

 return (
 <div className="flex h-screen bg-bg-main">
 <Sidebar />
 <main className="flex-1 flex flex-col overflow-hidden">
 <header className="h-16 flex items-center justify-between px-6 bg-bg-card border-b border-border-main">
 <h1 className="text-xl font-bold text-text-main">{t('songsList.title')}</h1>
 <Button 
 onClick={() => navigate('/songs/new')}
 data-testid="add-song-btn"
 >
 <Plus className="w-5 h-5 mr-1" />
 <span className="hidden sm:inline">{t('songsList.addSong')}</span>
 </Button>
 </header>

 <div className="flex-1 overflow-y-auto p-6 pb-24 sm:pb-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
 <div className="relative max-w-sm w-full">
 <input 
 type="text" 
 placeholder={t('songsList.searchPlaceholder')} 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-4 pr-10 py-2 bg-bg-card border border-border-main rounded-lg focus:ring-2 focus:ring-[#aa3bff] outline-none "
 />
 {searchQuery ? (
 <button 
 onClick={() => setSearchQuery('')}
 className="absolute right-3 top-2.5 text-gray-400 hover:text-text-mute dark:hover:text-gray-200 focus:outline-none"
 aria-label={t('songsList.clearSearch')}
 >
 <X className="w-5 h-5" />
 </button>
 ) : (
 <Filter className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
 )}
 </div>
 <div className="flex gap-2">
 <span className="text-sm text-text-mute">{songs.length} {t('songsList.songsCount')}</span>
 </div>
 </div>

 {loading && songs.length === 0 ? (
 <div className="flex justify-center py-12">
 <Spinner size="lg" />
 </div>
 ) : songs.length === 0 ? (
 <EmptyState 
 icon={Music} 
 title={t('dashboard.emptyTitle')}
 description={t('songsList.emptyDesc')}
 action={{ label: t('songsList.addFirstSong'), onClick: () => navigate('/songs/new') }} 
 />
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {songs.map(song => (
 <div key={song.id} onClick={() => navigate(`/song/${song.id}`)} className="cursor-pointer" data-testid={`view-song-${song.id}`}>
 <MusicCard 
 {...song} 
 onToggleFavorite={() => {}}
 onEdit={(id) => navigate(`/songs/edit/${id}`)}
 onShare={() => {}}
 onDelete={handleDelete}
 />
 </div>
 ))}
 </div>
 )}
 </div>
 </main>
 <BottomNav />
 </div>
 );
};
