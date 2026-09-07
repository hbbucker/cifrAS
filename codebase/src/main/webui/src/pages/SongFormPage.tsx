import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Save, ArrowLeft, CloudDownload } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { parseContentToLyrics, stringifyLyrics } from '../utils/lyricsParser';
import { DriveFilePicker } from '../components/DriveFilePicker';
import { Button } from '../components/ui/Button';
import { TagInput } from '../components/ui/TagInput';
import { getUserTags } from '../api/songs';
import { CoachMark } from '../components/ui/CoachMark';
import { useTour } from '../context/TourContext';

export const SongFormPage: React.FC = () => {
  const { t } = useTranslation();
  const { startTour } = useTour();
  const { id } = useParams();
 const navigate = useNavigate();
 const location = useLocation();
 const { toast } = useToast();
 
 const { wasTransposed, originalKey } = location.state || {};
 
 const [title, setTitle] = useState('');
 const [artist, setArtist] = useState('');
 const [key, setKey] = useState('C');
 const [content, setContent] = useState('');
 const [tags, setTags] = useState<string[]>([]);
 const [availableTags, setAvailableTags] = useState<string[]>([]);
 const [showCancelModal, setShowCancelModal] = useState(false);
 const [showDrivePicker, setShowDrivePicker] = useState(false);
 const [isDirty, setIsDirty] = useState(false);
 const textareaRef = useRef<HTMLTextAreaElement>(null);

 const insertText = (text: string) => {
 const textarea = textareaRef.current;
 if (!textarea) return;

 const start = textarea.selectionStart;
 const end = textarea.selectionEnd;
 const newContent = content.substring(0, start) + text + content.substring(end);
 
 setContent(newContent);
 setIsDirty(true);

 setTimeout(() => {
 textarea.focus();
 textarea.setSelectionRange(start + text.length, start + text.length);
 }, 0);
 };

  useEffect(() => {
    getUserTags()
      .then((tagCounts) => {
        setAvailableTags(tagCounts.map((tc) => tc.name));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    startTour('song-editor-column-marker');
  }, [startTour]);

 useEffect(() => {
 if (id) {
 fetch(`/api/songs/${id}`, {
 headers: {
 'Authorization': `Bearer ${localStorage.getItem('token')}`
 }
 })
 .then(res => {
 if (!res.ok) throw new Error('Failed to fetch');
 return res.json();
 })
 .then(song => {
 setTitle(song.title || '');
 setArtist(song.artist || '');
 setKey(song.originalKey || song.keySignature || 'C');
 setContent(song.content || stringifyLyrics(song.lyrics) || '');
 setTags(song.tags || []);
 setIsDirty(false);
 })
 .catch(err => {
 console.error(err);
 toast('Failed to load song', 'error');
 });
 }
 }, [id, toast]);

 const handleSave = async () => {
 if (!title || !artist || !content) {
 toast('Title, Artist and Content are required', 'warning');
 return;
 }
 
 try {
 const payload = { title, artist, originalKey: key, lyrics: parseContentToLyrics(content), tags };
 const res = await fetch(id ? `/api/songs/${id}` : '/api/songs', {
 method: id ? 'PUT' : 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${localStorage.getItem('token')}`
 },
 body: JSON.stringify(payload)
 });
 
 if (!res.ok) throw new Error('Save failed');
 
 toast(id ? 'Song updated successfully!' : 'Song created successfully!', 'success');
 setIsDirty(false);
 if (id) {
 navigate(-1);
 } else {
 navigate('/songs');
 }
 } catch (err) {
 console.error(err);
 toast('Error saving song', 'error');
 }
 };

 const handleBack = () => {
 if (isDirty) {
 setShowCancelModal(true);
 } else {
 if (id) navigate(-1);
 else navigate('/songs');
 }
 };

 const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
 setter(e.target.value);
 setIsDirty(true);
 };

 return (
    <>
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <header className="relative z-20 min-h-[56px] sm:min-h-[64px] flex items-center justify-between px-4 sm:px-6 bg-bg-card border-b border-border-main shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button onClick={handleBack} className="p-2 hover:bg-bg-elevated rounded-full text-text-mute shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-text-main truncate">{id ? t('songForm.editTitle') : t('songForm.newTitle')}</h1>
          </div>
          <Button 
            onClick={handleSave}
            data-testid="save-song-btn"
            className="min-h-[40px] sm:min-h-[44px] px-3.5 sm:px-4 text-xs sm:text-sm shrink-0"
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" />
            <span className="hidden sm:inline">{t('common.save')}</span>
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 pb-24 sm:pb-8 flex flex-col bg-bg-main min-w-0">
          <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col space-y-4 sm:space-y-6">
            {wasTransposed && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs sm:text-sm p-3 rounded-md flex items-center gap-2">
                {t('songForm.editingOriginalKeyWarning', { key: originalKey || key })}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-bg-card p-3.5 sm:p-4.5 rounded-lg border border-border-main">
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-text-mute mb-1 uppercase tracking-wider">{t('songForm.title')}</label>
                <input type="text" value={title} onChange={handleChange(setTitle)} className="w-full px-3 py-2 bg-transparent border-b border-border-main focus:border-primary text-text-main font-bold text-base sm:text-lg focus:outline-none transition-colors" data-testid="song-title-input" placeholder={t('songForm.titlePlaceholder')} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-text-mute mb-1 uppercase tracking-wider">{t('songForm.artist')}</label>
                <input type="text" value={artist} onChange={handleChange(setArtist)} className="w-full px-3 py-2 bg-transparent border-b border-border-main focus:border-primary text-text-main font-bold text-base sm:text-lg focus:outline-none transition-colors" data-testid="song-artist-input" placeholder={t('songForm.artistPlaceholder')} />
              </div>
              <div className="w-full sm:w-28 shrink-0">
                <label className="block text-xs font-semibold text-text-mute mb-1 uppercase tracking-wider">{t('songForm.tom')}</label>
                <input type="text" value={key} onChange={handleChange(setKey)} maxLength={5} className="w-full px-3 py-2 bg-transparent border-b border-border-main focus:border-primary text-text-main font-bold text-base sm:text-lg text-left sm:text-center focus:outline-none transition-colors" placeholder="C#" />
              </div>
            </div>

            <div className="bg-bg-card p-3.5 sm:p-4.5 rounded-lg border border-border-main">
              <TagInput
                tags={tags}
                onChange={(newTags) => {
                  setTags(newTags);
                  setIsDirty(true);
                }}
                availableSuggestions={availableTags}
                label={t('songForm.tags', 'Tags')}
                placeholder={t('songForm.tagsPlaceholder', 'Adicione tags como Rock, Gospel, Missa...')}
              />
            </div>
            
            <div className="flex-1 flex flex-col bg-bg-card p-3.5 sm:p-4.5 rounded-lg border border-border-main min-h-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4 border-b border-border-main pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 overflow-hidden">
                  <span className="text-xs sm:text-sm font-semibold text-text-main shrink-0">{t('songForm.chordsLyrics')}</span>
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-bg-main p-1 sm:p-1.5 rounded-md border border-border-main overflow-x-auto no-scrollbar py-1">
                    <button type="button" onClick={() => insertText('[Refrão]\n')} className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-text-main bg-bg-card border border-border-main rounded-lg hover:bg-bg-elevated transition-colors shrink-0">{t('songForm.refrao')}</button>
                    <CoachMark
                      tourId="song-editor-column-marker"
                      title={t('songForm.tourColumnTitle', 'Quebra de Coluna ([coluna])')}
                      description={t('songForm.tourColumnDesc', 'Insira [coluna] onde desejar que a cifra quebre para a 2ª coluna no Modo Teatro ou telas em modo paisagem.')}
                      position="bottom"
                    >
                      <button type="button" onClick={() => insertText('\n[coluna]\n\n')} className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-text-main bg-bg-card border border-border-main rounded-lg hover:bg-bg-elevated transition-colors shrink-0" data-testid="btn-insert-coluna" title={t('songForm.colunaTooltip')}>{t('songForm.coluna')}</button>
                    </CoachMark>
                    <button type="button" onClick={() => insertText('\n---\n')} className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-text-main bg-bg-card border border-border-main rounded-lg hover:bg-bg-elevated transition-colors shrink-0">{t('songForm.separador')}</button>
                    <button type="button" onClick={() => insertText('\ne|---\nB|---\nG|---\nD|---\nA|---\nE|---\n')} className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-text-main bg-bg-card border border-border-main rounded-lg hover:bg-bg-elevated transition-colors shrink-0">{t('songForm.tablatura')}</button>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowDrivePicker(true)}
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary/10 shrink-0 self-start sm:self-auto min-h-[36px]"
                  data-testid="btn-open-drive-picker"
                >
                  <CloudDownload className="w-4 h-4 mr-2" />
                  {t('songForm.importDrive')}
                </Button>
              </div>
              <div className="relative flex-1 flex flex-col min-h-[40vh] sm:min-h-[50vh] font-mono text-sm sm:text-base">
                {/* Linha guia vertical para parâmetro de quebra de linha */}
                <div 
                  data-testid="song-editor-line-guide"
                  title={t('songForm.lineGuideTooltip')}
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 left-[37ch] sm:left-[40ch] border-r border-dashed border-border-main pointer-events-none z-10 flex flex-col justify-start"
                >
                  <span className="text-[10px] text-text-mute/70 tracking-tight font-sans select-none -translate-x-1/2 bg-bg-card px-1 py-0.5 rounded border border-border-main/60 mt-1 whitespace-nowrap shadow-none">
                    <span className="sm:hidden">{t('songForm.lineGuideMobile', '37 carac.')}</span>
                    <span className="hidden sm:inline">{t('songForm.lineGuideDesktop', '40 carac.')}</span>
                  </span>
                </div>
                <textarea 
                  ref={textareaRef}
                  value={content} 
                  onChange={handleChange(setContent)} 
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  className="w-full flex-1 min-h-full bg-transparent text-text-main font-mono text-sm sm:text-base focus:outline-none resize-none leading-relaxed"
                  placeholder={t('songForm.contentPlaceholder')}
                  data-testid="song-content-input"
                />
              </div>
            </div>
          </div>
        </div>
 </div>

 <ConfirmModal 
 isOpen={showCancelModal}
 title={t('songForm.discard')}
 message={t('songForm.unsavedMessage')}
 variant="warning"
 confirmText={t('songForm.discardBtn')}
 onConfirm={() => {
 if (id) navigate(-1);
 else navigate('/songs');
 }}
 onCancel={() => setShowCancelModal(false)}
 />

 {showDrivePicker && (
 <DriveFilePicker 
 onClose={() => setShowDrivePicker(false)}
 onFileSelected={(extractedText, importedTitle, detectedKey) => {
 setContent(extractedText);
 if (importedTitle && !title) setTitle(importedTitle);
 if (detectedKey && (!key || key === 'C')) setKey(detectedKey);
 setIsDirty(true);
 setShowDrivePicker(false);
 toast('Text imported successfully. Please review the chords and lyrics.', 'success');
 }}
 />
 )}
 </>
 );
};
