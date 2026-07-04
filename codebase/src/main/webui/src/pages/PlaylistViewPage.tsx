import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, PlayCircle, GripVertical, Trash2, ChevronUp, ChevronDown, Plus, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

interface SongData {
 id: string;
 title: string;
 artist: string;
 originalKey?: string;
 key?: string;
 [key: string]: unknown;
}

interface PlaylistData {
 id?: string;
 name?: string;
 isCollaborative?: boolean;
 userId?: string;
 [key: string]: unknown;
}

export const PlaylistViewPage: React.FC = () => {
  const { t } = useTranslation();
 const navigate = useNavigate();
 const { id } = useParams();
 const { user, logout } = useAuth();
 const { toast } = useToast();
 
 const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
 const [songs, setSongs] = useState<SongData[]>([]);
 const [loading, setLoading] = useState(true);
 const [showAddModal, setShowAddModal] = useState(false);
 const [allSongs, setAllSongs] = useState<SongData[]>([]);
 const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
 const [searchQuery, setSearchQuery] = useState('');

 const availableSongs = allSongs.filter(s => 
 !songs.some(ps => ps.id === s.id) && 
 (s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.artist.toLowerCase().includes(searchQuery.toLowerCase()))
 );

 const isOwner = playlist?.userId === user?.id;

 useEffect(() => {
 fetch(`/api/playlists/${id}`, {
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
 setPlaylist(data);
 setSongs(data.songs || []);
 setLoading(false);
 })
 .catch(() => {
 toast('Failed to load playlist', 'error');
 setLoading(false);
 });
 }, [id, logout, navigate, toast]);

 const moveSong = (index: number, direction: 'up' | 'down') => {
 if (direction === 'up' && index === 0) return;
 if (direction === 'down' && index === songs.length - 1) return;
 
 const newSongs = [...songs];
 const swapIndex = direction === 'up' ? index - 1 : index + 1;
 [newSongs[index], newSongs[swapIndex]] = [newSongs[swapIndex], newSongs[index]];
 setSongs(newSongs);

 // Call API to reorder
 const orderedIds = newSongs.map(s => s.id);
 fetch(`/api/playlists/${id}/songs/reorder`, {
 method: 'PATCH',
 headers: {
 'Authorization': `Bearer ${localStorage.getItem('token')}`,
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({ orderedSongIds: orderedIds })
 }).catch(() => toast('Failed to reorder playlist', 'error'));
 };

 const handleDrop = (dropIndex: number) => {
 if (draggedIndex === null || draggedIndex === dropIndex) return;
 
 const newSongs = [...songs];
 const [removed] = newSongs.splice(draggedIndex, 1);
 newSongs.splice(dropIndex, 0, removed);
 setSongs(newSongs);
 setDraggedIndex(null);

 // Call API to reorder
 const orderedIds = newSongs.map(s => s.id);
 fetch(`/api/playlists/${id}/songs/reorder`, {
 method: 'PATCH',
 headers: {
 'Authorization': `Bearer ${localStorage.getItem('token')}`,
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({ orderedSongIds: orderedIds })
 }).catch(() => toast('Failed to reorder playlist', 'error'));
 };

 const removeSong = (songId: string) => {
 if (!window.confirm(t('playlistView.confirmRemoveSong'))) return;
 
 fetch(`/api/playlists/${id}/songs/${songId}`, {
 method: 'DELETE',
 headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
 })
 .then(res => {
 if (res.ok) {
 setSongs(prev => prev.filter(s => s.id !== songId));
 toast('Song removed from playlist', 'success');
 } else {
 toast('Failed to remove song', 'error');
 }
 })
 .catch(() => toast('Failed to remove song', 'error'));
 };

 return (
 <>
 <main className="flex-1 flex flex-col h-full overflow-hidden">
 <header className="h-20 flex items-center justify-between px-6 bg-bg-card border-b border-border-main shrink-0">
 <div className="flex items-center gap-4">
 <button onClick={() => navigate('/playlists')} className="p-2 hover:bg-bg-elevated rounded-full text-text-mute">
 <ArrowLeft className="w-5 h-5" />
 </button>
 <div>
 {loading ? (
 <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2"></div>
 ) : (
 <h1 className="text-2xl font-bold text-text-main leading-tight">{playlist?.name || 'Playlist'}</h1>
 )}
 <p className="text-sm text-text-mute">{songs.length} songs • {playlist?.isCollaborative ? 'Collab' : 'Private'}</p>
 </div>
 </div>
 
 <div className="flex gap-2">
 {isOwner && (
 <button 
 onClick={() => {
 fetch('/api/songs', {
 headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
 })
 .then(res => res.json())
 .then(data => {
 const items = Array.isArray(data) ? data : (data.data || []);
 setAllSongs(items);
 setShowAddModal(true);
 })
 .catch(() => toast('Failed to fetch library', 'error'));
 }}
 className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-text-main px-4 py-2.5 rounded-lg font-bold transition-colors"
 >
 <Plus className="w-5 h-5" />
 <span className="hidden sm:inline">{t('playlistView.addSong')}</span>
 </button>
 )}
 <button 
 onClick={() => navigate(`/theater/${id}`)}
 className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-500/20"
 data-testid="start-theater-btn"
 >
 <PlayCircle className="w-6 h-6" />
 <span className="hidden sm:inline">{t('playlistView.startTheater')}</span>
 </button>
 </div>
 </header>

 <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
 {loading ? (
 <div className="text-center py-8 text-text-mute">{t('playlistView.loading')}</div>
 ) : songs.length === 0 ? (
 <div className="text-center py-12 bg-bg-card rounded-xl border border-dashed border-gray-300 ">
 <h3 className="text-lg font-medium text-text-main mb-2">{t('playlistView.noSongs')}</h3>
 <p className="text-text-mute">{t('playlistView.addDesc')}</p>
 </div>
 ) : (
 <div className="bg-bg-card rounded-xl border border-border-main shadow-sm overflow-hidden">
 {songs.map((song, index) => (
 <div 
 key={song.id} 
 draggable={isOwner}
 onDragStart={() => {
 if (!isOwner) return;
 setTimeout(() => setDraggedIndex(index), 0);
 }}
 onDragOver={(e) => {
 if (!isOwner) return;
 e.preventDefault();
 }}
 onDragEnd={() => setDraggedIndex(null)}
 onDrop={(e) => {
 if (!isOwner) return;
 e.preventDefault();
 handleDrop(index);
 }}
 className={`flex items-center gap-4 p-4 border-b border-border-main last:border-0 hover:bg-bg-main /50 transition-all group ${
 draggedIndex === index ? 'opacity-30' : ''
 }`}
 data-testid={`playlist-item-${song.id}`}
 >
 {isOwner && (
 <div className="flex flex-col sm:flex-row gap-1 items-center justify-center">
 <button 
 onClick={() => moveSong(index, 'up')} 
 className="p-2 sm:p-1.5 text-text-mute hover:text-[#aa3bff] bg-gray-100 hover:bg-[#aa3bff]/10 rounded-lg transition-colors active:scale-95" 
 data-testid={`move-up-${song.id}`}
 aria-label={t('playlistView.moveUp')}
 >
 <ChevronUp className="w-6 h-6 sm:w-5 sm:h-5" />
 </button>
 <button 
 onClick={() => moveSong(index, 'down')} 
 className="p-2 sm:p-1.5 text-text-mute hover:text-[#aa3bff] bg-gray-100 hover:bg-[#aa3bff]/10 rounded-lg transition-colors active:scale-95" 
 data-testid={`move-down-${song.id}`}
 aria-label={t('playlistView.moveDown')}
 >
 <ChevronDown className="w-6 h-6 sm:w-5 sm:h-5" />
 </button>
 </div>
 )}
 
 {isOwner && (
 <div className="text-gray-400 cursor-grab active:cursor-grabbing hover:text-[#aa3bff]">
 <GripVertical className="w-5 h-5 pointer-events-none" />
 </div>
 )}
 
 <div className="w-8 text-center text-gray-400 font-medium">{index + 1}</div>
 
 <div className="flex-1 min-w-0">
 <h3 className="font-bold text-text-main truncate">{song.title}</h3>
 <p className="text-sm text-text-mute truncate">{song.artist}</p>
 {/* Key on mobile */}
 <div className="mt-1 sm:hidden inline-block px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono text-xs text-text-main font-bold">
 {song.originalKey || song.key || '?'}
 </div>
 </div>
 
 {/* Key on desktop */}
 <div className="hidden sm:block px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded font-mono text-sm text-text-main font-bold">
 {song.originalKey || song.key || '?'}
 </div>
 
 {isOwner && (
 <button 
 onClick={() => removeSong(song.id)}
 className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
 >
 <Trash2 className="w-5 h-5" />
 </button>
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 </main>

 {/* Add Song Modal (Full Screen) */}
 {showAddModal && (
 <div className="fixed inset-0 bg-bg-main z-50 flex flex-col">
 <header className="h-20 flex items-center justify-between px-6 bg-bg-card border-b border-border-main shrink-0">
 <div className="flex items-center gap-4">
 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-bg-elevated rounded-full text-text-mute">
 <ArrowLeft className="w-6 h-6" />
 </button>
 <div>
 <h2 className="text-xl font-bold text-text-main">{t('playlistView.addSongs')}</h2>
 <p className="text-sm text-text-mute">{t('playlistView.selectSongs')}</p>
 </div>
 </div>
 </header>

 <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-6 overflow-hidden">
 <div className="relative mb-6 shrink-0">
 <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
 <input
 type="text"
 placeholder={t('playlistView.searchPlaceholder')}
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-12 pr-4 py-3 bg-bg-card border border-border-main rounded-xl text-text-main focus:ring-2 focus:ring-[#aa3bff] outline-none shadow-sm"
 />
 </div>

 <div className="flex-1 overflow-y-auto bg-bg-card rounded-xl border border-border-main shadow-sm">
 {availableSongs.length === 0 ? (
 <div className="text-center py-12 text-text-mute">
 {allSongs.length === 0 ? 'Loading library...' : 'No matching songs found.'}
 </div>
 ) : (
 availableSongs.map(s => (
 <div key={s.id} className="flex items-center justify-between p-4 border-b border-border-main last:border-0 hover:bg-bg-main /50 transition-colors">
 <div className="flex-1 min-w-0 pr-4">
 <h3 className="font-bold text-text-main truncate">{s.title}</h3>
 <p className="text-sm text-text-mute truncate">{s.artist}</p>
 </div>
 
 <div className="flex items-center gap-4">
 <div className="hidden sm:block px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm text-text-main font-bold">
 {s.originalKey || s.key || '?'}
 </div>
 <button 
 onClick={() => {
 fetch(`/api/playlists/${id}/songs`, {
 method: 'POST',
 headers: { 
 'Authorization': `Bearer ${localStorage.getItem('token')}`,
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({ songId: s.id, position: songs.length })
 })
 .then(res => {
 if (res.ok) {
 setSongs(prev => [...prev, s]);
 toast('Song added to playlist', 'success');
 } else {
 toast('Failed to add song', 'error');
 }
 })
 .catch(() => toast('Failed to add song', 'error'));
 }}
 className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-[#aa3bff] hover:text-white dark:bg-gray-700 dark:hover:bg-[#aa3bff] text-gray-700 rounded-lg font-bold transition-colors"
 >
 <Plus className="w-4 h-4" />
 <span>{t('playlistView.add')}</span>
 </button>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 )}
 </>
 );
};
