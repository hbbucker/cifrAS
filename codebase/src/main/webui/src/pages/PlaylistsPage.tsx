import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Plus, ListMusic, Users, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { BrandLogo } from '../components/ui/BrandLogo';
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
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <header className="min-h-[52px] sm:min-h-[64px] flex items-center justify-between px-3.5 sm:px-6 bg-bg-card border-b border-border-main shrink-0" role="banner">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <BrandLogo iconOnly size="sm" asLink to="/dashboard" className="sm:hidden shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-text-main truncate">{t('sidebar.playlists')}</h1>
          </div>
          <Button 
            onClick={() => setShowModal(true)}
            data-testid="create-playlist-btn"
            className="min-h-[40px] sm:min-h-[44px] px-3.5 sm:px-4 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
            <span>{t('playlists.newPlaylist')}</span>
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-8 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                  className="bg-bg-card rounded-2xl border border-border-main p-4 sm:p-5 cursor-pointer hover:shadow-md hover:border-[#8629cc]/50 transition-all group min-w-0"
                  data-testid={`playlist-card-${pl.id}`}
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#8629cc]/10 rounded-xl flex items-center justify-center group-hover:bg-[#8629cc]/20 transition-colors shrink-0">
                      <ListMusic className="w-5 h-5 sm:w-6 sm:h-6 text-[#8629cc]" />
                    </div>
                    <button
                      onClick={(e) => handleDeletePlaylist(e, pl.id)}
                      className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center text-text-mute hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      title={t('playlists.deleteTooltip')}
                      aria-label={t('playlists.deleteTooltip')}
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-text-main mb-1 truncate">{pl.name}</h3>
                  <div className="flex items-center justify-between mt-3 sm:mt-4">
                    <p className="text-xs sm:text-sm text-text-mute">{pl.songCount} {t('playlists.songsCount')}</p>
                    <span className={`text-[11px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1 ${pl.isCollaborative ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
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
