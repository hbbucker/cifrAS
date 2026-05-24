import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';
import { ArrowLeft, PlayCircle, GripVertical, Trash2, ChevronUp, ChevronDown, Plus, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export const PlaylistViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [playlist, setPlaylist] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allSongs, setAllSongs] = useState<any[]>([]);
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
    .catch(err => {
      toast('Failed to load playlist', 'error');
      setLoading(false);
    });
  }, [id]);

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
    if (!window.confirm('Remove this song from the playlist?')) return;
    
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/playlists')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              {loading ? (
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2"></div>
              ) : (
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{playlist?.name || 'Playlist'}</h1>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">{songs.length} songs • {playlist?.isCollaborative ? 'Collab' : 'Private'}</p>
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
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-lg font-bold transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Song</span>
              </button>
            )}
            <button 
              onClick={() => navigate(`/theater/${id}`)}
              className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-500/20"
              data-testid="start-theater-btn"
            >
              <PlayCircle className="w-6 h-6" />
              <span className="hidden sm:inline">Start Theater Mode</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading songs...</div>
          ) : songs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No songs in this playlist</h3>
              <p className="text-gray-500 dark:text-gray-400">Add songs from the library to build your repertoire.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
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
                  className={`flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group ${
                    draggedIndex === index ? 'opacity-30' : ''
                  }`}
                  data-testid={`playlist-item-${song.id}`}
                >
                  {isOwner && (
                    <div className="flex flex-col sm:flex-row gap-1 items-center justify-center">
                      <button 
                        onClick={() => moveSong(index, 'up')} 
                        className="p-2 sm:p-1.5 text-gray-500 hover:text-[#aa3bff] bg-gray-100 hover:bg-[#aa3bff]/10 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors active:scale-95" 
                        data-testid={`move-up-${song.id}`}
                        aria-label="Move up"
                      >
                        <ChevronUp className="w-6 h-6 sm:w-5 sm:h-5" />
                      </button>
                      <button 
                        onClick={() => moveSong(index, 'down')} 
                        className="p-2 sm:p-1.5 text-gray-500 hover:text-[#aa3bff] bg-gray-100 hover:bg-[#aa3bff]/10 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors active:scale-95" 
                        data-testid={`move-down-${song.id}`}
                        aria-label="Move down"
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
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{song.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
                    {/* Key on mobile */}
                    <div className="mt-1 sm:hidden inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono text-xs text-gray-800 dark:text-gray-200 font-bold">
                      {song.originalKey || song.key || '?'}
                    </div>
                  </div>
                  
                  {/* Key on desktop */}
                  <div className="hidden sm:block px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm text-gray-800 dark:text-gray-200 font-bold">
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
        <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-50 flex flex-col">
          <header className="h-20 flex items-center justify-between px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Songs</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Select songs to add to your playlist</p>
              </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-6 overflow-hidden">
            <div className="relative mb-6 shrink-0">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or artist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#aa3bff] outline-none shadow-sm"
              />
            </div>

            <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              {availableSongs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {allSongs.length === 0 ? 'Loading library...' : 'No matching songs found.'}
                </div>
              ) : (
                availableSongs.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">{s.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{s.artist}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm text-gray-800 dark:text-gray-200 font-bold">
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
                        className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-[#aa3bff] hover:text-white dark:bg-gray-700 dark:hover:bg-[#aa3bff] text-gray-700 dark:text-gray-200 rounded-lg font-bold transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
