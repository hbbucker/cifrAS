import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TransposePad } from '../components/music/TransposePad';
import { ChordSheet } from '../components/music/ChordSheet';
import { ArrowLeft, PlayCircle, Settings2, Edit, Share2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { stringifyLyrics } from '../utils/lyricsParser';
import { transposeContent } from '../utils/chordTransposer';
import { useToast } from '../context/ToastContext';
import { FeatureDiscoveryModal } from '../components/FeatureDiscoveryModal';
import { ShareSongModal } from '../components/modals/ShareSongModal';

export const SongViewPage: React.FC = () => {
  const { t } = useTranslation();
 const navigate = useNavigate();
 const { id } = useParams();
 const { toast } = useToast();
 
 const [song, setSong] = useState({
 title: 'Carregando...',
 artist: '...',
 originalKey: 'C',
 content: ''
 });
 
 const [transposeSteps, setTransposeSteps] = useState(0);
 
 // Preferences State
 const [showSettings, setShowSettings] = useState(false);
 const [useBb, setUseBb] = useState(false);
 const [useEb, setUseEb] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('feature_discovery_03_seen');
    if (!seen || seen === 'false') {
      const timer = setTimeout(() => {
        setShowFeatureModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseFeatureModal = () => {
    localStorage.setItem('feature_discovery_03_seen', 'true');
    setShowFeatureModal(false);
  };

 useEffect(() => {
 if (id) {
 fetch(`/api/songs/${id}`, {
 headers: { 
   'Authorization': `Bearer ${localStorage.getItem('token')}`,
   'Cache-Control': 'no-cache, no-store'
 },
 cache: 'no-store'
 })
 .then(res => {
 if (!res.ok) throw new Error('Fetch failed');
 return res.json();
 })
 .then(data => {
 const key = data.originalKey || data.keySignature || 'C';
 setSong({
        title: data.title,
        artist: data.artist,
        originalKey: key,
        content: stringifyLyrics(data.lyrics)
      });
      if (data.prefAutoScrollSpeed != null) setAutoScrollSpeed(data.prefAutoScrollSpeed);
      if (data.prefUseBb != null) setUseBb(data.prefUseBb);
      if (data.prefUseEb != null) setUseEb(data.prefUseEb);
      if (data.prefTransposeSteps != null) setTransposeSteps(data.prefTransposeSteps);

      // Fetch user's session preferences to override song defaults
      fetch(`/api/theater/song-preferences/${id}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache, no-store'
        },
        cache: 'no-store'
      })
      .then(prefRes => {
        if (prefRes.ok) return prefRes.json();
        return null;
      })
      .then(prefData => {
        if (prefData) {
          if (prefData.autoScrollSpeed != null) setAutoScrollSpeed(prefData.autoScrollSpeed);
          if (prefData.transposeSteps != null) setTransposeSteps(prefData.transposeSteps);
        }
      })
      .catch(() => {});
    })
 .catch(() => toast('Failed to load song details', 'error'));
 }
 }, [id, toast]);

 // Auto-scroll effect
 useEffect(() => {
 if (autoScrollSpeed <= 0) return;
 
 let animationFrameId: number;
 let lastTime = performance.now();
 
 const scroll = (time: number) => {
 const delta = time - lastTime;
 if (delta > 16) { // target roughly 60fps
 if (scrollContainerRef.current) {
 scrollContainerRef.current.scrollTop += (autoScrollSpeed * 15) / 60;
 }
 lastTime = time;
 }
 animationFrameId = requestAnimationFrame(scroll);
 };
 
 animationFrameId = requestAnimationFrame(scroll);
 return () => cancelAnimationFrame(animationFrameId);
 }, [autoScrollSpeed]);

 // Persist preferences
 useEffect(() => {
    if (song.title === 'Carregando...' || !id) return;
    
    const handler = setTimeout(() => {
      fetch(`/api/songs/${id}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          prefUseBb: useBb,
          prefUseEb: useEb,
          prefAutoScrollSpeed: autoScrollSpeed,
          prefTransposeSteps: transposeSteps
        })
      }).catch(err => console.error('Failed to save preferences', err));
    }, 1000);
    
    return () => clearTimeout(handler);
  }, [useBb, useEb, autoScrollSpeed, transposeSteps, id, song.title]);

 const currentKey = transposeContent(song.originalKey, transposeSteps, useBb, useEb);
 const transposedContent = transposeContent(song.content, transposeSteps, useBb, useEb);

  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <>
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-0 sm:h-16 bg-bg-card border-b border-border-main shrink-0 gap-2.5 sm:gap-4 relative z-10">
          <div className="flex items-center gap-2.5 sm:gap-4 w-full sm:w-auto overflow-hidden">
            <button onClick={() => navigate('/songs')} className="w-10 h-10 min-w-[40px] flex items-center justify-center hover:bg-bg-elevated rounded-full text-text-mute shrink-0 -ml-1 sm:ml-0" aria-label="Back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-bold text-text-main leading-tight truncate">{song.title}</h1>
              <p className="text-xs text-text-mute truncate">{song.artist}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3 justify-between sm:justify-end w-full sm:w-auto">
            <TransposePad 
              currentKey={currentKey}
              onTransposeDown={() => setTransposeSteps(s => s - 1)}
              onTransposeUp={() => setTransposeSteps(s => s + 1)}
            />
            
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-10 h-10 min-w-[40px] flex items-center justify-center text-text-mute hover:bg-bg-elevated rounded-xl transition-colors"
                  title="Preferences"
                  aria-label="Preferences"
                >
                  <Settings2 className={`w-5 h-5 ${showSettings ? 'text-[#8629cc]' : ''}`} />
                </button>
                
                {showSettings && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-bg-card border border-border-main rounded-2xl shadow-xl p-4 z-50 animate-in slide-in-from-top-2">
                    <h3 className="font-semibold text-text-main mb-4">{t('songView.preferences')}</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-text-mute flex justify-between">
                          <span>{t('songView.autoScroll')}</span>
                          <span>{autoScrollSpeed === 0 ? 'Off' : autoScrollSpeed}</span>
                        </label>
                        <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          value={autoScrollSpeed}
                          onChange={(e) => setAutoScrollSpeed(Number(e.target.value))}
                          className="w-full accent-[#8629cc]"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-main font-medium">{t('songView.useBb')}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={useBb} onChange={(e) => setUseBb(e.target.checked)} />
                          <div className="w-11 h-6 bg-bg-elevated peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-main after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8629cc]"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-main font-medium">{t('songView.useEb')}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={useEb} onChange={(e) => setUseEb(e.target.checked)} />
                          <div className="w-11 h-6 bg-bg-elevated peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-main after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8629cc]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setShowShareModal(true)}
                className="w-10 h-10 min-w-[40px] flex items-center justify-center text-text-mute hover:bg-bg-elevated rounded-xl transition-colors"
                title={t('songSharing.shareSong')}
                data-testid="share-song-btn"
                aria-label={t('songSharing.shareSong')}
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => navigate(`/songs/edit/${id}`, { state: { wasTransposed: transposeSteps !== 0, originalKey: song.originalKey } })}
                className="w-10 h-10 min-w-[40px] flex items-center justify-center text-text-mute hover:bg-bg-elevated rounded-xl transition-colors"
                title={t('songView.editSong')}
                aria-label={t('songView.editSong')}
              >
                <Edit className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => navigate(`/theater/song/${id}`, { state: { autoScrollSpeed, useBb, useEb, transposeSteps } })}
                className="flex items-center gap-1.5 sm:gap-2 bg-[#8629cc] hover:bg-[#721eb8] text-white px-3 sm:px-4 py-2 min-h-[40px] sm:min-h-[44px] rounded-xl font-medium transition-colors shadow-sm text-xs sm:text-sm shrink-0"
                data-testid="theater-mode-btn"
              >
                <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t('songView.perform')}</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 pb-24 sm:pb-8 bg-bg-main/50 min-w-0" ref={scrollContainerRef}>
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            <ChordSheet content={transposedContent} fontSize={20} />
          </div>
        </div>
      </div>
      {showFeatureModal && <FeatureDiscoveryModal onClose={handleCloseFeatureModal} />}
      {id && (
        <ShareSongModal
          isOpen={showShareModal}
          songId={id}
          songTitle={song.title}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};
