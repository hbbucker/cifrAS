import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { TransposePad } from '../components/music/TransposePad';
import { ChordSheet } from '../components/music/ChordSheet';
import { ArrowLeft, PlayCircle, Settings2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { stringifyLyrics } from '../utils/lyricsParser';
import { transposeContent } from '../utils/chordTransposer';
import { useToast } from '../context/ToastContext';

export const SongViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [song, setSong] = useState({
    title: 'I Took A Pill In Ibiza',
    artist: 'Mike Posner',
    originalKey: 'G',
    content: `[Intro]
G D Em C

[Verse 1]
G                 D
I took a pill in Ibiza
                 Em                     C
To show Avicii I was cool`
  });
  
  const [transposeSteps, setTransposeSteps] = useState(0);

  useEffect(() => {
    if (id) {
      fetch(`/api/songs/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then(data => {
        const key = data.originalKey || data.keySignature || 'C';
        setSong({ ...data, content: stringifyLyrics(data.lyrics), originalKey: key });
        setTransposeSteps(0);
      })
      .catch(() => toast('Failed to load song details', 'error'));
    }
  }, [id]);

  const currentKey = transposeContent(song.originalKey, transposeSteps);
  const transposedContent = transposeContent(song.content, transposeSteps);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/songs')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{song.title}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{song.artist}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <TransposePad 
              currentKey={currentKey}
              onTransposeDown={() => setTransposeSteps(s => s - 1)}
              onTransposeUp={() => setTransposeSteps(s => s + 1)}
            />
            
            <button className="hidden sm:flex items-center gap-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Settings2 className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => navigate(`/theater/song/${id}`)}
              className="flex items-center gap-2 bg-[#aa3bff] hover:bg-[#902be6] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
              data-testid="theater-mode-btn"
            >
              <PlayCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Perform</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            <ChordSheet content={transposedContent} fontSize={20} />
          </div>
        </div>
      </main>
    </div>
  );
};
