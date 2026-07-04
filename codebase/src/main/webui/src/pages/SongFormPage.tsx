import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { parseContentToLyrics, stringifyLyrics } from '../utils/lyricsParser';
import { DriveFilePicker } from '../components/DriveFilePicker';
import { Button } from '../components/ui/Button';
import { CloudDownload } from 'lucide-react';
export const SongFormPage: React.FC = () => {
  const { t } = useTranslation();
 const { id } = useParams();
 const navigate = useNavigate();
 const location = useLocation();
 const { toast } = useToast();
 
 const { transposedKey, transposedContent } = location.state || {};
 
 const [title, setTitle] = useState('');
 const [artist, setArtist] = useState('');
 const [key, setKey] = useState(transposedKey || 'C');
 const [content, setContent] = useState(transposedContent || '');
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
 setKey(transposedKey || song.originalKey || song.keySignature || 'C');
 setContent(transposedContent || song.content || stringifyLyrics(song.lyrics) || '');
 setIsDirty(!!(transposedKey || transposedContent));
 })
 .catch(err => {
 console.error(err);
 toast('Failed to load song', 'error');
 });
 }
 }, [id, toast, transposedKey, transposedContent]);

 const handleSave = async () => {
 if (!title || !artist || !content) {
 toast('Title, Artist and Content are required', 'warning');
 return;
 }
 
 try {
 const payload = { title, artist, originalKey: key, lyrics: parseContentToLyrics(content) };
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
 <main className="flex-1 flex flex-col h-full overflow-hidden">
 <header className="h-16 flex items-center justify-between px-6 bg-bg-card border-b border-border-main">
 <div className="flex items-center gap-4">
 <button onClick={handleBack} className="p-2 hover:bg-bg-elevated rounded-full text-text-mute">
 <ArrowLeft className="w-5 h-5" />
 </button>
 <h1 className="text-xl font-bold text-text-main">{id ? 'Edit Song' : 'New Song'}</h1>
 </div>
 <Button 
 onClick={handleSave}
 data-testid="save-song-btn"
 >
 <Save className="w-5 h-5" />
 <span className="hidden sm:inline">{t('common.save')}</span>
 </Button>
 </header>

 <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col bg-bg-main">
 <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col space-y-6">
 <div className="flex flex-col md:flex-row gap-4 bg-bg-card p-4 rounded-[16px] border border-border-main">
 <div className="flex-1">
 <label className="block text-xs font-semibold text-text-mute mb-1 uppercase tracking-wider">{t('songForm.title')}</label>
 <input type="text" value={title} onChange={handleChange(setTitle)} className="w-full px-3 py-2 bg-transparent border-b border-border-main focus:border-primary text-text-main font-bold text-lg focus:outline-none transition-colors" data-testid="song-title-input" placeholder={t('songForm.titlePlaceholder')} />
 </div>
 <div className="flex-1">
 <label className="block text-xs font-semibold text-text-mute mb-1 uppercase tracking-wider">{t('songForm.artist')}</label>
 <input type="text" value={artist} onChange={handleChange(setArtist)} className="w-full px-3 py-2 bg-transparent border-b border-border-main focus:border-primary text-text-main font-bold text-lg focus:outline-none transition-colors" data-testid="song-artist-input" placeholder={t('songForm.artistPlaceholder')} />
 </div>
 <div className="w-full md:w-24">
 <label className="block text-xs font-semibold text-text-mute mb-1 uppercase tracking-wider">{t('songForm.tom')}</label>
 <input type="text" value={key} onChange={handleChange(setKey)} maxLength={5} className="w-full px-3 py-2 bg-transparent border-b border-border-main focus:border-primary text-text-main font-bold text-lg text-center focus:outline-none transition-colors" placeholder="C#" />
 </div>
 </div>
 
 <div className="flex-1 flex flex-col bg-bg-card p-4 rounded-[16px] border border-border-main">
 <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-border-main pb-4">
 <div className="flex flex-wrap items-center gap-4">
 <span className="text-sm font-semibold text-text-main">{t('songForm.chordsLyrics')}</span>
 <div className="flex items-center gap-2 bg-bg-main p-1.5 rounded-lg border border-border-main">
 <button onClick={() => insertText('[Refrão]\n')} className="px-3 py-1.5 text-xs font-semibold text-text-main bg-bg-card border border-border-main rounded-md hover:bg-bg-elevated transition-colors">{t('songForm.refrao')}</button>
 <button onClick={() => insertText('\n\n')} className="px-3 py-1.5 text-xs font-semibold text-text-main bg-bg-card border border-border-main rounded-md hover:bg-bg-elevated transition-colors">{t('songForm.quebra')}</button>
 <button onClick={() => insertText('\n---\n')} className="px-3 py-1.5 text-xs font-semibold text-text-main bg-bg-card border border-border-main rounded-md hover:bg-bg-elevated transition-colors">{t('songForm.separador')}</button>
 <button onClick={() => insertText('\ne|---\nB|---\nG|---\nD|---\nA|---\nE|---\n')} className="px-3 py-1.5 text-xs font-semibold text-text-main bg-bg-card border border-border-main rounded-md hover:bg-bg-elevated transition-colors">{t('songForm.tablatura')}</button>
 </div>
 </div>
 <Button 
 onClick={() => setShowDrivePicker(true)}
 variant="ghost"
 size="sm"
 className="text-primary hover:bg-primary/10"
 data-testid="btn-open-drive-picker"
 >
 <CloudDownload className="w-4 h-4 mr-2" />
 {t('songForm.importDrive')}
 </Button>
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
 className="w-full flex-1 min-h-[50vh] bg-transparent text-text-main font-mono text-sm focus:outline-none resize-none leading-relaxed"
 placeholder={t('songForm.contentPlaceholder')}
 data-testid="song-content-input"
 />
 </div>
 </div>
 </div>
 </main>

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
