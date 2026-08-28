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
import { getSongs, getUserTags } from '../api/songs';
import type { SongData, TagCount } from '../api/songs';
import { ShareSongModal } from '../components/modals/ShareSongModal';
import { ImportSongModal } from '../components/modals/ImportSongModal';
import { importSong } from '../api/songs';
import { BrandLogo } from '../components/ui/BrandLogo';
import { TagFilterBar } from '../components/ui/TagFilterBar';


export const SongsListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [songs, setSongs] = useState<SongData[]>([]);
  const [userTags, setUserTags] = useState<TagCount[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleImport = async (url: string) => {
    try {
      const newSong = await importSong(url);
      toast(t('songsList.importSuccess', 'Música importada com sucesso!'), 'success');
      navigate(`/songs/${newSong.id}`);
    } catch {
      toast(t('songsList.importError', 'Erro ao importar a música. Verifique a URL e tente novamente.'), 'error');
    }
  };

  useEffect(() => {
    getUserTags()
      .then((tags) => setUserTags(tags))
      .catch(() => {});
  }, []);

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

    getSongs(page, 20, debouncedQuery, selectedTag || undefined)
      .then((data) => {
        if (!isMounted) return;
        const items = Array.isArray(data) ? data : data.items || [];
        const count = 'totalCount' in data && data.totalCount !== undefined ? data.totalCount : items.length;

        const mappedSongs: SongData[] = items.map((song) => ({
          ...song,
          keySignature: (song.originalKey as string) || (song.keySignature as string) || 'C',
          isFavorite: song.isFavorite || false,
          categories: song.categories || [],
          tags: song.tags || [],
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
  }, [debouncedQuery, selectedTag, page, logout, navigate, toast, t]);

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

  const [sharingSong, setSharingSong] = useState<{ id: string; title: string } | null>(null);

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
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <header className="relative z-20 bg-bg-card border-b border-border-main shrink-0" role="banner">
          <div className="min-h-[52px] sm:min-h-[64px] flex items-center justify-between px-3.5 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <BrandLogo iconOnly size="sm" asLink to="/dashboard" className="sm:hidden shrink-0" />
              <h1 className="text-lg sm:text-xl font-bold text-text-main truncate">{t('songsList.title')}</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsImportModalOpen(true)}
                className="min-h-[40px] sm:min-h-[44px] px-3.5 sm:px-4 text-xs sm:text-sm hidden sm:flex"
              >
                <span>{t('common.import', 'Importar')}</span>
              </Button>
              <OnboardingTooltip tooltipId="add_song_btn">
                <Button
                  onClick={() => navigate('/songs/new')}
                  data-testid="add-song-btn"
                  className="min-h-[40px] sm:min-h-[44px] px-3.5 sm:px-4 text-xs sm:text-sm"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                  <span>{t('songsList.addSong')}</span>
                </Button>
              </OnboardingTooltip>
            </div>
          </div>

          <div className="px-3.5 sm:px-6 pb-3 pt-0 flex flex-col gap-2.5 sm:gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
              <div className="relative max-w-sm w-full">
                <input
                  type="text"
                  placeholder={t('songsList.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-4 pr-10 py-2.5 sm:py-2 bg-bg-card border border-border-main rounded-xl focus:ring-2 focus:ring-[#8629cc] outline-none text-sm"
                />
                {searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setPage(1);
                    }}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-text-mute dark:hover:text-gray-200 focus:outline-none min-h-[30px] min-w-[30px] flex items-center justify-center"
                    aria-label={t('songsList.clearSearch')}
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                ) : (
                  <Filter className="absolute right-3 top-3 sm:top-2.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                )}
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 flex-wrap">
                <span className="text-xs sm:text-sm text-text-mute whitespace-nowrap">{totalCount} {t('songsList.songsCount')}</span>
                <Pagination
                  currentPage={page}
                  totalCount={totalCount}
                  pageSize={20}
                  onPageChange={setPage}
                />
              </div>
            </div>

            {userTags.length > 0 && (
              <TagFilterBar
                tags={userTags}
                selectedTag={selectedTag}
                onSelectTag={(tag) => {
                  setSelectedTag(tag);
                  setPage(1);
                }}
                totalCount={totalCount}
              />
            )}
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 sm:p-6 pb-24 sm:pb-8 relative min-w-0">

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
              {songs.map(song => (
                <div key={song.id} onClick={() => navigate(`/song/${song.id}`)} className="cursor-pointer" data-testid={`view-song-${song.id}`}>
                  <MusicCard
                    {...song}
                    onToggleFavorite={handleToggleFavorite}
                    onEdit={(id) => navigate(`/songs/edit/${id}`)}
                    onShare={() => setSharingSong({ id: song.id, title: song.title })}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {sharingSong && (
        <ShareSongModal
          isOpen={!!sharingSong}
          songId={sharingSong.id}
          songTitle={sharingSong.title}
          onClose={() => setSharingSong(null)}
        />
      )}
      <ImportSongModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
    </>
  );
};
