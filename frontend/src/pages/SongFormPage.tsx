import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/modals/ConfirmModal';

export const SongFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [key, setKey] = useState('C');
  const [content, setContent] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (id) {
      // Mock fetching song data
      const mockSongs = [
        { id: '1', title: 'Wonderwall', artist: 'Oasis', keySignature: 'F#m', content: '[Em]Today is [G]gonna be the day...' },
        { id: '2', title: 'Hotel California', artist: 'Eagles', keySignature: 'Bm', content: '[Bm]On a dark desert highway...' },
        { id: '3', title: 'Let It Be', artist: 'The Beatles', keySignature: 'C', content: 'When I [C]find myself in [G]times of trouble...' },
      ];
      
      const song = mockSongs.find(s => s.id === id);
      if (song) {
        setTitle(song.title);
        setArtist(song.artist);
        setKey(song.keySignature);
        setContent(song.content);
        setIsDirty(false);
      }
    }
  }, [id]);

  const handleSave = () => {
    if (!title || !artist || !content) {
      toast('Title, Artist and Content are required', 'warning');
      return;
    }
    toast('Song saved successfully!', 'success');
    setIsDirty(false);
    navigate('/songs');
  };

  const handleBack = () => {
    if (isDirty) {
      setShowCancelModal(true);
    } else {
      navigate('/songs');
    }
  };

  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setter(e.target.value);
    setIsDirty(true);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{id ? 'Edit Song' : 'New Song'}</h1>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input type="text" value={title} onChange={handleChange(setTitle)} className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-[#aa3bff]" data-testid="song-title-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Artist</label>
                <input type="text" value={artist} onChange={handleChange(setArtist)} className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-[#aa3bff]" data-testid="song-artist-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Signature</label>
                <input type="text" value={key} onChange={handleChange(setKey)} className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-[#aa3bff]" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chords & Lyrics</label>
              <p className="text-xs text-gray-500 mb-2">Write chords above words or use [Chord] brackets inline.</p>
              <textarea 
                value={content} 
                onChange={handleChange(setContent)} 
                className="w-full h-96 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-[#aa3bff] resize-y"
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
        onConfirm={() => navigate('/songs')}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
};
