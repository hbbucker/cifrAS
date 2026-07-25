import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Plus, ListMusic, Users, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
interface PlaylistData {
 id: string;
 name: string;
 songCount?: number;
 isCollaborative?: boolean;
 [key: string]: unknown;
}

export const PlaylistsPage: React.FC = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const { toast } = useToast();
 const [showModal, setShowModal] = useState(false);
 const [newPlaylistName, setNewPlaylistName] = useState('');
 const { logout } = useAuth();
 const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
 const [loading, setLoading] = useState(true);
 const [isCreating, setIsCreating] = useState(false);

 const fetchPlaylists = useCallback(() => {
 fetch('/api/playlists', {
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
 setPlaylists(data);
 setLoading(false);
 })
 .catch(() => {
 toast(t('playlists.loadError'), 'error');
 setLoading(false);
 });
 }, [logout, navigate, toast, t]);

 useEffect(() => {
 fetchPlaylists();
 }, [fetchPlaylists]);

 const handleCreatePlaylist = () => {
 if (!newPlaylistName.trim()) return;
 
 setIsCreating(true);
 fetch('/api/playlists', {
 method: 'POST',
 headers: { 
 'Authorization': `Bearer ${localStorage.getItem('token')}`,
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({
 name: newPlaylistName,
 isCollaborative: false
 })
 })
 .then(res => {
 if (res.status === 401) {
 logout();
 navigate('/login');
 throw new Error('Unauthorized');
 }
 if (!res.ok) throw new Error(t('playlists.createError'));
 return res.json();
 })
 .then(data => {
 toast(t('playlists.createSuccess'), 'success');
 setShowModal(false);
 setNewPlaylistName('');
 setIsCreating(false);
 navigate(`/playlists/${data.id}`);
 })
 .catch(() => {
 toast(t('playlists.createError'), 'error');
 setIsCreating(false);
 });
 };

 const handleDeletePlaylist = (e: React.MouseEvent, id: string) => {
 e.stopPropagation();
 if (!window.confirm(t('playlists.confirmDelete'))) return;
 
 fetch(`/api/playlists/${id}`, {
 method: 'DELETE',
 headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
 })
 .then(res => {
 if (res.status === 401) {
 logout();
 navigate('/login');
 throw new Error('Unauthorized');
 }
 if (!res.ok) throw new Error(t('playlists.deleteError'));
 setPlaylists(prev => prev.filter(p => p.id !== id));
 toast(t('playlists.deleteSuccess'), 'success');
 })
 .catch(() => toast(t('playlists.deleteError'), 'error'));
 };

 return (
 <>
 <div className="flex-1 flex flex-col h-full overflow-hidden">
 <header className="h-16 flex items-center justify-between px-6 bg-bg-card border-b border-border-main">
 <h1 className="text-xl font-bold text-text-main">{t('sidebar.playlists')}</h1>
 <Button 
 onClick={() => setShowModal(true)}
 data-testid="create-playlist-btn"
 >
 <Plus className="w-5 h-5 mr-1" />
 <span className="hidden sm:inline">{t('playlists.newPlaylist')}</span>
 </Button>
 </header>

 <div className="flex-1 overflow-y-auto p-6 pb-24 sm:pb-6">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {loading && playlists.length === 0 ? (
 <div className="col-span-full flex justify-center py-12">
 <Spinner size="lg" />
 </div>
 ) : playlists.length === 0 ? (
 <div className="col-span-full">
 <EmptyState 
 icon={ListMusic} 
 title={t('playlists.emptyTitle')} 
 description={t('playlists.emptyDesc')} 
 action={{ label: t('playlists.createPlaylist'), onClick: () => setShowModal(true) }} 
 />
 </div>
 ) : (
 playlists.map(pl => (
 <div 
 key={pl.id} 
 onClick={() => navigate(`/playlists/${pl.id}`)}
 className="bg-bg-card rounded-xl border border-border-main p-5 cursor-pointer hover:shadow-lg hover:border-[#8629cc]/50 transition-all group"
 data-testid={`playlist-card-${pl.id}`}
 >
 <div className="flex items-start justify-between mb-4">
 <div className="w-12 h-12 bg-[#8629cc]/10 rounded-lg flex items-center justify-center group-hover:bg-[#8629cc]/20 transition-colors">
 <ListMusic className="w-6 h-6 text-[#8629cc]" />
 </div>
 <button
 onClick={(e) => handleDeletePlaylist(e, pl.id)}
 className="p-2 text-text-mute hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
 title={t('playlists.deleteTooltip')}
 >
 <Trash2 className="w-5 h-5" />
 </button>
 </div>
 <h3 className="text-lg font-bold text-text-main mb-1">{pl.name}</h3>
 <div className="flex items-center justify-between">
 <p className="text-sm text-text-mute">{pl.songCount} {t('playlists.songsCount')}</p>
 <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${pl.isCollaborative ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 '}`}>
 {pl.isCollaborative && <Users className="w-3 h-3" />}
 {pl.isCollaborative ? t('playlists.collab') : t('playlists.private')}
 </span>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>

 {/* Create Modal */}
 {showModal && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
 <div className="bg-bg-card rounded-xl max-w-md w-full p-6 shadow-2xl">
 <h2 className="text-xl font-bold text-text-main mb-4">{t('playlists.modalTitle')}</h2>
 <input 
 type="text" 
 value={newPlaylistName}
 onChange={(e) => setNewPlaylistName(e.target.value)}
 placeholder={t('playlists.modalPlaceholder')}
 className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-lg mb-6 text-text-main focus:ring-2 focus:ring-[#8629cc] outline-none"
 data-testid="playlist-name-input"
 />
 <div className="flex justify-end gap-3">
 <Button onClick={() => setShowModal(false)} variant="ghost">{t('playlists.cancel')}</Button>
 <Button 
 onClick={handleCreatePlaylist} 
 disabled={!newPlaylistName.trim()}
 isLoading={isCreating}
 data-testid="save-playlist-btn"
 >
 {t('playlists.create')}
 </Button>
 </div>
 </div>
 </div>
 )}

 </>
 );
};
