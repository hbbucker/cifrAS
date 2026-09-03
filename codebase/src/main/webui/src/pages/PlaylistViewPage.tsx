import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, PlayCircle, GripVertical, Trash2, ChevronUp, ChevronDown, Plus, Search, Presentation, Play } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { ExportPlaylistPresentationModal } from '../components/modals/ExportPlaylistPresentationModal';
import { TagFilterBar } from '../components/ui/TagFilterBar';
import { getUserTags } from '../api/songs';
import type { TagCount } from '../api/songs';
import type { SongForPresentation } from '../utils/presentationGenerator';
import { CoachMark } from '../components/ui/CoachMark';
import { useTour } from '../context/TourContext';

interface SongData {
 id: string;
 title: string;
 artist: string;
 originalKey?: string;
 key?: string;
 tags?: string[];
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
 const [userTags, setUserTags] = useState<TagCount[]>([]);
 const [selectedTag, setSelectedTag] = useState<string | null>(null);
 const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [isSearching, setIsSearching] = useState(false);
 const [showPresentationModal, setShowPresentationModal] = useState(false);

 const availableSongs = allSongs.filter(s => !songs.some(ps => ps.id === s.id));

 const isOwner = playlist?.userId === user?.id;
 const { startTour } = useTour();

 useEffect(() => {
   if (!isOwner) return;
   const timer = setTimeout(() => {
     startTour('playlist-add-song');
   }, 800);
   return () => clearTimeout(timer);
 }, [isOwner, startTour]);

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
      toast(t('playlistView.failedLoadPlaylist'), 'error');
      setLoading(false);
    });
  }, [id, logout, navigate, t, toast]);

  useEffect(() => {
    if (!showAddModal) return;

    getUserTags()
      .then((tags) => setUserTags(tags))
      .catch(() => {});
  }, [showAddModal]);

  useEffect(() => {
    if (!showAddModal) return;

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      params.append('size', '50');
      if (searchQuery) {
        params.append('q', searchQuery);
      }
      if (selectedTag) {
        params.append('tags', selectedTag);
      }

      fetch(`/api/songs?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) ? data : (data.items || data.data || []);
        setAllSongs(items);
      })
      .catch(() => toast(t('playlistView.failedFetchLibrary'), 'error'))
      .finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedTag, showAddModal, t, toast]);

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
    }).catch(() => toast(t('playlistView.failedReorder'), 'error'));
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
    }).catch(() => toast(t('playlistView.failedReorder'), 'error'));
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
        toast(t('playlistView.songRemoved'), 'success');
      } else {
        toast(t('playlistView.failedRemoveSong'), 'error');
      }
    })
    .catch(() => toast(t('playlistView.failedRemoveSong'), 'error'));
  };

  return (
    <>
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <header className="relative z-20 min-h-[56px] sm:min-h-[64px] py-2.5 sm:py-3 flex items-center justify-between px-3.5 sm:px-6 bg-bg-card border-b border-border-main shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <button 
              onClick={() => navigate('/playlists')} 
              className="p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center hover:bg-bg-elevated rounded-full text-text-mute shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              {loading ? (
                <div className="h-6 w-32 sm:w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-1"></div>
              ) : (
                <h1 className="text-base sm:text-xl md:text-2xl font-bold text-text-main leading-tight truncate sm:whitespace-normal">{playlist?.name || 'Playlist'}</h1>
              )}
              <p className="text-xs sm:text-sm text-text-mute truncate">{songs.length} songs • {playlist?.isCollaborative ? 'Collab' : 'Private'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isOwner && (
              <CoachMark
                tourId="playlist-add-song"
                title={t('playlistView.tourTitle', 'Adicione Músicas à Playlist')}
                description={t('playlistView.tourDesc', 'Busque cifras do seu repertório e adicione-as nesta playlist para montar seu setlist.')}
                position="bottom"
              >
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearching(true);
                    setShowAddModal(true);
                  }}
                  className="flex items-center justify-center gap-1.5 bg-bg-card hover:bg-bg-elevated border border-border-main text-text-main px-2.5 sm:px-4 py-2 sm:py-2.5 min-h-[36px] sm:min-h-[44px] min-w-[36px] sm:min-w-[44px] rounded-md font-bold text-xs sm:text-sm transition-colors shadow-xs"
                  title={t('playlistView.addSong')}
                  aria-label={t('playlistView.addSong')}
                  data-testid="playlist-add-song-header-btn"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{t('playlistView.addSong')}</span>
                </button>
              </CoachMark>
            )}
            <button 
              onClick={() => {
                if (songs.length === 0) {
                  toast(t('playlistView.noSongsToExport'), 'error');
                  return;
                }
                setShowPresentationModal(true);
              }}
              className="flex items-center justify-center gap-1.5 bg-[#aa3bff] hover:bg-[#9926f0] text-white px-2.5 sm:px-4 py-2 sm:py-2.5 min-h-[36px] sm:min-h-[44px] min-w-[36px] sm:min-w-[44px] rounded-md font-bold text-xs sm:text-sm transition-colors shadow-xs"
              data-testid="export-presentation-btn"
              title={t('playlistPresentation.generateSlides')}
              aria-label={t('playlistPresentation.generateSlides')}
            >
              <Presentation className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{t('playlistPresentation.generateSlides')}</span>
            </button>
            <button 
              onClick={() => navigate(`/theater/${id}`)}
              className="flex items-center justify-center gap-1.5 bg-[#10B981] hover:bg-[#059669] text-white px-3 sm:px-5 py-2 sm:py-2.5 min-h-[36px] sm:min-h-[44px] rounded-md font-bold text-xs sm:text-sm transition-colors shadow-lg shadow-emerald-500/20"
              data-testid="start-theater-btn"
              title={t('playlistView.startTheater')}
              aria-label={t('playlistView.startTheater')}
            >
              <PlayCircle className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">{t('playlistView.startTheater')}</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 pb-24 sm:pb-8 max-w-4xl mx-auto w-full min-w-0">
          {loading ? (
            <div className="text-center py-8 text-text-mute">{t('playlistView.loading')}</div>
          ) : songs.length === 0 ? (
            <div className="text-center py-12 bg-bg-card rounded-lg border border-dashed border-border-main p-6">
              <h3 className="text-base sm:text-lg font-medium text-text-main mb-2">{t('playlistView.noSongs')}</h3>
              <p className="text-xs sm:text-sm text-text-mute mb-6">{t('playlistView.addDesc')}</p>
              {isOwner && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearching(true);
                    setShowAddModal(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-[#aa3bff] hover:bg-[#9926f0] text-white px-5 py-2.5 min-h-[44px] rounded-md font-bold text-sm transition-colors shadow-sm"
                  data-testid="playlist-empty-add-btn"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{t('playlistView.emptyAction', 'Adicionar Músicas')}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-bg-card rounded-lg border border-border-main shadow-xs overflow-hidden">
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
                  className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border-b border-border-main last:border-0 hover:bg-bg-main/50 transition-all group min-w-0 ${
                    draggedIndex === index ? 'opacity-30' : ''
                  }`}
                  data-testid={`playlist-item-${song.id}`}
                >
                  {isOwner && (
                    <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-1 items-center justify-center shrink-0">
                      <button 
                        onClick={() => moveSong(index, 'up')} 
                        className="p-1 sm:p-1.5 text-text-mute hover:text-[#aa3bff] bg-bg-elevated hover:bg-[#aa3bff]/10 rounded-lg transition-colors active:scale-95 min-h-[30px] min-w-[30px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center" 
                        data-testid={`move-up-${song.id}`}
                        aria-label={t('playlistView.moveUp')}
                      >
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button 
                        onClick={() => moveSong(index, 'down')} 
                        className="p-1 sm:p-1.5 text-text-mute hover:text-[#aa3bff] bg-bg-elevated hover:bg-[#aa3bff]/10 rounded-lg transition-colors active:scale-95 min-h-[30px] min-w-[30px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center" 
                        data-testid={`move-down-${song.id}`}
                        aria-label={t('playlistView.moveDown')}
                      >
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  )}
                  
                  {isOwner && (
                    <div className="hidden sm:block text-gray-500 cursor-grab active:cursor-grabbing hover:text-[#aa3bff] shrink-0">
                      <GripVertical className="w-5 h-5 pointer-events-none" />
                    </div>
                  )}
                  
                  <div className="w-5 sm:w-8 text-center text-xs sm:text-sm text-text-mute font-medium shrink-0">{index + 1}</div>
                  
                  <div className="flex-1 min-w-0 pr-1">
                    <h3 className="font-semibold sm:font-bold text-sm sm:text-base text-text-main truncate">{song.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs sm:text-sm text-text-mute truncate">{song.artist}</p>
                      <span className="sm:hidden inline-block px-1.5 py-0.2 bg-bg-elevated rounded font-mono text-[10px] text-text-main font-bold shrink-0">
                        {song.originalKey || song.key || '?'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Key on desktop */}
                  <div className="hidden sm:block px-3 py-1 bg-bg-elevated rounded-md font-mono text-xs font-bold text-text-main shrink-0">
                    {song.originalKey || song.key || '?'}
                  </div>

                  {/* Play in Theater Mode button */}
                  <button 
                    onClick={() => navigate(`/theater/${id}?songId=${song.id}`, { state: { songIndex: index, songId: song.id } })}
                    className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400 dark:hover:text-emerald-300 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    data-testid={`play-theater-song-${song.id}`}
                    title={t('playlistView.playSong')}
                    aria-label={t('playlistView.playSongInTheater', { title: song.title })}
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  </button>
                  
                  {isOwner && (
                    <button 
                      onClick={() => removeSong(song.id)}
                      className="p-1.5 sm:p-2 text-text-mute hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title={t('playlistView.confirmRemoveSong')}
                      aria-label={t('playlistView.confirmRemoveSong')}
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Song Modal (Full Screen) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-bg-main z-50 flex flex-col">
          <header className="min-h-[56px] sm:min-h-[64px] py-2.5 sm:py-3 flex items-center justify-between px-3.5 sm:px-6 bg-bg-card border-b border-border-main shrink-0">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center hover:bg-bg-elevated rounded-full text-text-mute shrink-0"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-bold text-text-main truncate">{t('playlistView.addSongs')}</h2>
                <p className="text-xs sm:text-sm text-text-mute truncate">{t('playlistView.selectSongs')}</p>
              </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-3 sm:p-6 pb-20 sm:pb-6 overflow-hidden min-w-0">
            <div className="relative mb-3 shrink-0">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder={t('playlistView.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(true);
                }}
                className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-bg-card border border-border-main rounded-md text-text-main focus:ring-2 focus:ring-[#aa3bff] outline-none shadow-sm text-sm sm:text-base"
              />
            </div>

            {userTags.length > 0 && (
              <TagFilterBar
                tags={userTags}
                selectedTag={selectedTag}
                onSelectTag={setSelectedTag}
                className="mb-3 shrink-0"
              />
            )}

            <div className="flex-1 overflow-y-auto bg-bg-card rounded-md border border-border-main shadow-sm min-w-0">
              {isSearching ? (
                <div className="text-center py-12 text-text-mute">
                  {t('playlistView.loading')}
                </div>
              ) : availableSongs.length === 0 ? (
                <div className="text-center py-12 text-text-mute">
                  {t('playlistView.noMatchingSongs')}
                </div>
              ) : (
                availableSongs.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 sm:p-4 border-b border-border-main last:border-0 hover:bg-bg-main/50 transition-colors gap-2 min-w-0">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-semibold sm:font-bold text-sm sm:text-base text-text-main truncate">{s.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs sm:text-sm text-text-mute truncate">{s.artist}</p>
                        <span className="sm:hidden inline-block px-1.5 py-0.2 bg-gray-200 dark:bg-gray-700 rounded font-mono text-[10px] text-text-main font-bold shrink-0">
                          {s.originalKey || s.key || '?'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
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
                              toast(t('playlistView.songAdded'), 'success');
                            } else {
                              toast(t('playlistView.failedAddSong'), 'error');
                            }
                          })
                          .catch(() => toast(t('playlistView.failedAddSong'), 'error'));
                        }}
                        className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-[#aa3bff] hover:text-white dark:bg-gray-700 dark:hover:bg-[#aa3bff] text-gray-700 dark:text-gray-200 rounded-lg font-bold text-xs sm:text-sm transition-colors min-h-[36px]"
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
      <ExportPlaylistPresentationModal
        isOpen={showPresentationModal}
        playlistTitle={playlist?.name || 'Playlist'}
        songs={songs as unknown as SongForPresentation[]}
        onClose={() => setShowPresentationModal(false)}
      />
    </>
  );
};
