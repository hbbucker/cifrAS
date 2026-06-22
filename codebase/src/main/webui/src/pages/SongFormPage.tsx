import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { parseContentToLyrics, stringifyLyrics } from '../utils/lyricsParser';
import { DriveFilePicker } from '../components/DriveFilePicker';
import { CloudDownload } from 'lucide-react';
export const SongFormPage: React.FC = () => {
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
 <button 
 onClick={handleSave}
 className="flex items-center gap-2 bg-[#aa3bff] hover:bg-[#902be6] text-white px-4 py-2 rounded-lg font-medium transition-colors"
 data-testid="save-song-btn"
 >
 <Save className="w-5 h-5" />
 <span className="hidden sm:inline">Save</span>
 </button>
 </header>

 <div className="flex-1 overflow-y-auto p-6">
 <div className="max-w-4xl mx-auto space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
 <input type="text" value={title} onChange={handleChange(setTitle)} className="w-full px-4 py-2 bg-bg-card border border-border-main rounded-lg text-text-main focus:ring-2 focus:ring-[#aa3bff]" data-testid="song-title-input" />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
 <input type="text" value={artist} onChange={handleChange(setArtist)} className="w-full px-4 py-2 bg-bg-card border border-border-main rounded-lg text-text-main focus:ring-2 focus:ring-[#aa3bff]" data-testid="song-artist-input" />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Key Signature</label>
 <input type="text" value={key} onChange={handleChange(setKey)} className="w-full px-4 py-2 bg-bg-card border border-border-main rounded-lg text-text-main focus:ring-2 focus:ring-[#aa3bff]" />
 </div>
 </div>
 
 <div>
 <div className="flex items-center justify-between mb-1">
 <label className="block text-sm font-medium text-gray-700">Chords & Lyrics</label>
 <button 
 onClick={() => setShowDrivePicker(true)}
 className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
 data-testid="btn-open-drive-picker"
 >
 <CloudDownload className="w-4 h-4" />
 Import from Google Drive
 </button>
 </div>
 <p className="text-xs text-text-mute mb-2">Write chords above words or use [Chord] brackets inline.</p>
 <textarea 
 value={content} 
 onChange={handleChange(setContent)} 
 className="w-full h-96 px-4 py-3 bg-bg-card border border-border-main rounded-lg font-mono text-text-main focus:ring-2 focus:ring-[#aa3bff] resize-y"
 placeholder="[C]Hello [G]world..."
 data-testid="song-content-input"
 />
 </div>
 </div>
 </div>
 </main>

 <ConfirmModal 
 isOpen={showCancelModal}
 title="Discard changes?"
 message="You have unsaved modifications. Are you sure you want to leave without saving?"
 variant="warning"
 confirmText="Discard"
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
