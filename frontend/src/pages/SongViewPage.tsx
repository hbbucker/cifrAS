import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { TransposePad } from '../components/music/TransposePad';
import { ChordSheet } from '../components/music/ChordSheet';
import { ArrowLeft, PlayCircle, Settings2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export const SongViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentKey, setCurrentKey] = useState('G');
  const [song, setSong] = useState({
    title: 'I Took A Pill In Ibiza',
    artist: 'Mike Posner',
    content: `[Intro]
G D Em C

[Verse 1]
G                 D
I took a pill in Ibiza
                 Em                     C
To show Avicii I was cool`
  });

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
        setSong(data);
        setCurrentKey(data.keySignature || 'C');
      })
      .catch(console.error);
    }
  }, [id]);

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
              onTransposeDown={() => setCurrentKey('F#')}
              onTransposeUp={() => setCurrentKey('G#')}
            />
            
            <button className="hidden sm:flex items-center gap-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Settings2 className="w-5 h-5" />
            </button>
            
            <button 
              className="flex items-center gap-2 bg-[#aa3bff] hover:bg-[#902be6] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
              data-testid="theater-mode-btn"
            >
              <PlayCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Perform</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
          <div className="max-w-3xl mx-auto">
            <ChordSheet content={song.content} fontSize={20} height={600} />
          </div>
        </div>
      </main>
    </div>
  );
};
