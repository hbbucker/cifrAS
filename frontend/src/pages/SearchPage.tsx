import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MusicCard } from '../components/cards/MusicCard';
import { Search } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [prevQuery, setPrevQuery] = useState(query);

  if (query !== prevQuery) {
    setPrevQuery(query);
    setLoading(true);
  }

  const mockResults = query.toLowerCase().includes('ibiza') 
    ? [{ id: '1', title: 'I Took A Pill In Ibiza', artist: 'Mike Posner', keySignature: 'G', isFavorite: false, categories: ['Pop'] }]
    : [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Search Results for "{query}"
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin w-8 h-8 border-4 border-[#aa3bff] border-t-transparent rounded-full" />
            </div>
          ) : mockResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockResults.map((song) => (
                <div key={song.id} onClick={() => navigate(`/song/${song.id}`)} className="cursor-pointer" data-testid={`search-result-${song.id}`}>
                  <MusicCard 
                    {...song} 
                    onToggleFavorite={() => {}}
                    onEdit={() => {}}
                    onShare={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                We couldn't find anything matching "{query}". Try checking for typos.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
