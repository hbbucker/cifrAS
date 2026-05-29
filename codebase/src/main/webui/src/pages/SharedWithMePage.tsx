import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { getGroupPlaylists } from '../api/groups';
import { useAuth } from '../context/AuthContext';

interface Playlist {
 id: number;
 name: string;
 songs?: unknown[];
 groupName?: string;
 userId?: string;
}

export const SharedWithMePage: React.FC = () => {
 const { user } = useAuth();
 const [playlists, setPlaylists] = useState<Playlist[]>([]);
 const [loading, setLoading] = useState(true);
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
 
 // Remove duplicates if the same playlist is shared in multiple groups
 // And remove playlists owned by the current user
 const unique = Array.from(new Map(allPlaylists.map(p => [p.id, p])).values());
 const sharedWithMe = unique.filter(p => p.userId !== user?.id);
 setPlaylists(sharedWithMe);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };
 
 fetchSharedPlaylists();
 }, [user?.id]);

 return (
 <div className="flex h-screen bg-bg-main">
 <Sidebar />
 <main className="flex-1 flex flex-col overflow-hidden">
 <header className="h-16 flex items-center px-6 bg-bg-card border-b border-border-main shrink-0">
 <h1 className="text-xl font-bold text-text-main">Shared with Me</h1>
 </header>

 <div className="flex-1 overflow-y-auto p-6">
 {loading ? (
 <div className="text-center py-8 text-text-mute">Loading shared playlists...</div>
 ) : playlists.length === 0 ? (
 <div className="text-center py-12 text-text-mute bg-bg-card rounded-xl border border-dashed border-border-main">
 No playlists shared with you yet.
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {playlists.map(playlist => (
 <div key={playlist.id} className="bg-bg-card rounded-xl border border-border-main p-5 hover:shadow-md transition-shadow flex flex-col">
 <div className="flex justify-between items-start mb-4">
 <div className="flex-1 cursor-pointer" onClick={() => navigate(`/playlists/${playlist.id}`)}>
 <h3 className="font-bold text-lg text-text-main mb-1 line-clamp-1">{playlist.name}</h3>
 <p className="text-sm text-text-mute">{playlist.songs?.length || 0} songs</p>
 </div>
 <button 
 onClick={() => navigate(`/theater/${playlist.id}`)}
 className="p-2 bg-[#aa3bff]/10 text-[#aa3bff] hover:bg-[#aa3bff]/20 rounded-full transition-colors ml-4 shrink-0"
 title="Play in Theater Mode"
 >
 <Play className="w-5 h-5 fill-current" />
 </button>
 </div>
 <div className="mt-auto">
 <span className="text-xs font-bold text-text-mute uppercase tracking-wider bg-gray-100 dark:bg-gray-700 inline-block px-2 py-1 rounded">
 From: {playlist.groupName}
 </span>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </main>
 </div>
 );
};
