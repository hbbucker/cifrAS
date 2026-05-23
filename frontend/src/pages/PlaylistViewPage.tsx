import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';
import { ArrowLeft, PlayCircle, GripVertical, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export const PlaylistViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { logout } = useAuth();
  
  const [playlist, setPlaylist] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allSongs, setAllSongs] = useState<any[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string>('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
      console.error(err);
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
    }).catch(console.error);
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
    }).catch(console.error);
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
      } else {
        console.error('Failed to remove song');
      }
    })
    .catch(console.error);
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
                .catch(console.error);
              }}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-lg font-bold transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Song</span>
            </button>
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
                  draggable
                  onDragStart={() => {
                    // Slight delay allows the drag image to capture the current state before we mess with opacity
                    setTimeout(() => setDraggedIndex(index), 0);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnd={() => setDraggedIndex(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(index);
                  }}
                  className={`flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group ${
                    draggedIndex === index ? 'opacity-30' : ''
                  }`}
                  data-testid={`playlist-item-${song.id}`}
                >
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
                  
                  <div className="text-gray-400 cursor-grab active:cursor-grabbing hover:text-[#aa3bff]">
                    <GripVertical className="w-5 h-5 pointer-events-none" />
                  </div>
                  
                  <div className="w-8 text-center text-gray-400 font-medium">{index + 1}</div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{song.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
                  </div>
                  
                  <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm text-gray-800 dark:text-gray-200 font-bold">
                    {song.originalKey || song.key || '?'}
                  </div>
                  
                  <button 
                    onClick={() => removeSong(song.id)}
                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Song Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Song to Playlist</h2>
            
            <select
              value={selectedSongId}
              onChange={(e) => setSelectedSongId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg mb-6 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#aa3bff] outline-none"
            >
              <option value="">Select a song...</option>
              {allSongs.map(s => (
                <option key={s.id} value={s.id}>{s.title} - {s.artist}</option>
              ))}
            </select>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
              <button 
                onClick={() => {
                  if (!selectedSongId) return;
                  fetch(`/api/playlists/${id}/songs`, {
                    method: 'POST',
                    headers: { 
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ songId: parseInt(selectedSongId), position: songs.length })
                  })
                  .then(res => {
                    if (res.ok) {
                      const addedSong = allSongs.find(s => s.id.toString() === selectedSongId);
                      if (addedSong) {
                        setSongs([...songs, addedSong]);
                      }
                      setShowAddModal(false);
                      setSelectedSongId('');
                    } else {
                      console.error('Failed to add song');
                    }
                  })
                  .catch(console.error);
                }}
                disabled={!selectedSongId}
                className="px-4 py-2 font-medium bg-[#aa3bff] hover:bg-[#902be6] text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
