import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getGroupPlaylists, unlinkPlaylist } from '../../api/groups';
import { useNavigate } from 'react-router-dom';
import { Play, Trash2, Plus, ListMusic } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Spinner } from '../ui/Spinner';

interface PlaylistData {
 id: string | number;
 name: string;
 songs?: unknown[];
 [key: string]: unknown;
}

interface GroupPlaylistsSectionProps {
 groupId: string;
 role: 'Admin' | 'Member';
 onLinkNew: () => void;
}

export const GroupPlaylistsSection: React.FC<GroupPlaylistsSectionProps> = ({ groupId, role, onLinkNew }) => {
  const { t } = useTranslation();
 const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
 const [loading, setLoading] = useState(true);
 const navigate = useNavigate();
 const { toast } = useToast();

 useEffect(() => {
 let mounted = true;
 getGroupPlaylists(groupId)
 .then(data => {
 if (mounted) {
 setPlaylists(data as PlaylistData[]);
 setLoading(false);
 }
 })
 .catch(() => {
 if (mounted) {
 toast('Failed to load shared playlists', 'error');
 setLoading(false);
 }
 });
 return () => { mounted = false; };
 }, [groupId, toast]);

 const fetchPlaylists = async () => {
 try {
 const data = await getGroupPlaylists(groupId);
 setPlaylists(data as PlaylistData[]);
 } catch {
 toast('Failed to load shared playlists', 'error');
 }
 };

 const handleUnlink = async (playlistId: string) => {
 if (!window.confirm('Are you sure you want to remove this playlist from the group?')) return;
 try {
 await unlinkPlaylist(groupId, playlistId);
 fetchPlaylists();
 toast('Playlist removed from group', 'success');
 } catch {
 toast('Failed to remove playlist', 'error');
 }
 };

 return (
 <div className="bg-bg-card rounded-xl border border-border-main p-6">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-xl font-bold text-text-main">{t('group.sharedPlaylists')}</h2>
 {role === 'Admin' && (
 <Button onClick={onLinkNew} size="sm">
 <Plus className="w-4 h-4 mr-1" /> {t('group.sharePlaylist')}
 </Button>
 )}
 </div>

 {loading && playlists.length === 0 ? (
 <div className="flex justify-center py-8">
 <Spinner />
 </div>
 ) : playlists.length === 0 ? (
 <EmptyState 
 icon={ListMusic} 
 title={t('group.noSharedPlaylists')} 
 description="No playlists shared with this group yet." 
 />
 ) : (
 <div className="flex flex-col gap-3">
 {playlists.map(playlist => (
 <div key={playlist.id} className="flex justify-between items-center p-4 border border-border-main rounded-lg hover:bg-bg-main /50 transition-colors">
 <div 
 className="flex-1 cursor-pointer"
 onClick={() => navigate(`/playlists/${playlist.id}`)}
 >
 <h3 className="font-bold text-text-main mb-1">{playlist.name}</h3>
 <p className="text-sm text-text-mute">{playlist.songs?.length || 0} songs</p>
 </div>
 
 <div className="flex items-center gap-2">
 <button 
 onClick={() => navigate(`/theater/${playlist.id}`)}
 className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
 title="Theater Mode"
 >
 <Play className="w-5 h-5" />
 </button>
 {role === 'Admin' && (
 <button 
 onClick={() => handleUnlink(playlist.id.toString())}
 className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
 title={t('group.remove')}
 >
 <Trash2 className="w-5 h-5" />
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 );
};
