import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomNav } from '../components/layout/BottomNav';
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<SongData[]>([]);

  useEffect(() => {
    fetch('/api/songs', {
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
        const mappedSongs = items.slice(0, 3).map((song: Record<string, unknown>) => ({
          ...song,
          keySignature: (song.originalKey as string) || (song.keySignature as string) || 'C',
          isFavorite: song.isFavorite || false,
          categories: song.categories || [],
        }));
        setSongs(mappedSongs);
        setLoading(false);
      })
      .catch(() => {
        toast('Failed to load recent songs', 'error');
        setLoading(false);
      });
  }, [logout, navigate, toast]);

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this song?')) return;

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
        toast('Song deleted successfully', 'success');
      })
      .catch(() => toast('Failed to delete song', 'error'));
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">Dashboard</h1>
          <div className="flex-1 sm:ml-8">
            <SearchBar />
          </div>
          <div className="ml-4 flex items-center gap-4">
            <UserMenu />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 pb-24 sm:pb-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Musician'}! 👋</h2>
            <p className="text-gray-600 dark:text-gray-400">Here's your recent repertoire.</p>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recently Added</h3>
            <button
              onClick={() => navigate('/songs')}
              className="text-sm font-medium text-[#aa3bff] hover:underline"
              data-testid="view-all-btn"
            >
              View all
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
                    onToggleFavorite={() => { }}
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
              title="No songs yet"
              description="Start building your repertoire by adding your first song."
              action={{ label: 'Add New Song', onClick: () => navigate('/songs/new') }}
            />
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
