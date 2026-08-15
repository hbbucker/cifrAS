import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MusicCard } from '../components/cards/MusicCard';
import { Filter, Plus, Music, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { EducationalEmptyState } from '../components/ui/EducationalEmptyState';
import { OnboardingTooltip } from '../components/ui/OnboardingTooltip';
import { Spinner } from '../components/ui/Spinner';
import { Pagination } from '../components/ui/Pagination';
import { useRef } from 'react';
import { getSongs } from '../api/songs';
import type { SongData } from '../api/songs';


export const SongsListPage: React.FC = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const { logout } = useAuth();
 const { toast } = useToast();
 const [songs, setSongs] = useState<SongData[]>([]);
 const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    let isMounted = true;
    
    getSongs(page, 20, debouncedQuery)
    .then((data) => {
      if (!isMounted) return;
      const items = Array.isArray(data) ? data : data.items || [];
      const count = 'totalCount' in data && data.totalCount !== undefined ? data.totalCount : items.length;
      
      const mappedSongs: SongData[] = items.map((song) => ({
        ...song,
        keySignature: (song.originalKey as string) || (song.keySignature as string) || 'C',
        isFavorite: song.isFavorite || false,
        categories: song.categories || [],
      }));
      setSongs(mappedSongs);
      setTotalCount(count);
      setLoading(false);
      
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    })
    .catch((err: unknown) => {
      if (!isMounted) return;
      if ((err as { response?: { status?: number } }).response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        toast(t('songsList.loadError', 'Error loading songs'), 'error');
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, page, logout, navigate, toast, t]);

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
      setSongs(prev => prev.map(song => song.id === id ? { ...song, isFavorite: updatedSong.isFavorite } : song));
    })
    .catch(() => toast('Error toggling favorite', 'error'));
  };

 return (
 <>
 <div className="flex-1 flex flex-col h-full overflow-hidden">
 <header className="h-16 flex items-center justify-between px-6 bg-bg-card border-b border-border-main">
        <h1 className="text-xl font-bold text-text-main">{t('songsList.title')}</h1>
        <OnboardingTooltip tooltipId="add_song_btn">
          <Button 
            onClick={() => navigate('/songs/new')}
            data-testid="add-song-btn"
          >
            <Plus className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">{t('songsList.addSong')}</span>
          </Button>
        </OnboardingTooltip>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 pb-24 sm:pb-6 relative">
        <div className="sticky top-0 z-10 bg-bg-card/95 backdrop-blur -mx-6 px-6 pt-2 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main/50">
          <div className="relative max-w-sm w-full">
            <input 
              type="text" 
              placeholder={t('songsList.searchPlaceholder')} 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-4 pr-10 py-2 bg-bg-card border border-border-main rounded-lg focus:ring-2 focus:ring-[#8629cc] outline-none "
            />
            {searchQuery ? (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-text-mute dark:hover:text-gray-200 focus:outline-none"
                aria-label={t('songsList.clearSearch')}
              >
                <X className="w-5 h-5" />
              </button>
            ) : (
              <Filter className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" />
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <span className="text-sm text-text-mute whitespace-nowrap">{totalCount} {t('songsList.songsCount')}</span>
            <Pagination 
              currentPage={page} 
              totalCount={totalCount} 
              pageSize={20} 
              onPageChange={setPage} 
            />
          </div>
        </div>

 {loading && songs.length === 0 ? (
 <div className="flex justify-center py-12">
 <Spinner size="lg" />
 </div>
 ) : songs.length === 0 ? (
          debouncedQuery.trim() === '' ? (
            <EducationalEmptyState 
              icon={Music} 
              title={t('dashboard.educationalEmptyTitle')}
              steps={[
                t('dashboard.educationalEmptyStep1'),
                t('dashboard.educationalEmptyStep2'),
                t('dashboard.educationalEmptyStep3')
              ]}
              action={{ label: t('songsList.addFirstSong'), onClick: () => navigate('/songs/new') }} 
            />
          ) : (
            <EmptyState 
              icon={Music} 
              title={t('dashboard.emptyTitle')}
              description={t('songsList.emptyDesc')}
              action={{ label: t('songsList.addSong'), onClick: () => navigate('/songs/new') }} 
            />
          )
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {songs.map(song => (
 <div key={song.id} onClick={() => navigate(`/song/${song.id}`)} className="cursor-pointer" data-testid={`view-song-${song.id}`}>
 <MusicCard 
 {...song} 
 onToggleFavorite={handleToggleFavorite}
 onEdit={(id) => navigate(`/songs/edit/${id}`)}
 onShare={() => {}}
 onDelete={handleDelete}
 />
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </>
 );
};
