import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MusicCard } from '../components/cards/MusicCard';
import { Search } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { t } = useTranslation();
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
    <>
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <header className="relative z-20 min-h-[56px] sm:min-h-[64px] flex items-center px-4 sm:px-6 bg-bg-card border-b border-border-main shrink-0">
          <h1 className="text-lg sm:text-xl font-bold text-text-main truncate">
            Search Results for "{query}"
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-8 min-w-0">
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
 <Search className="w-16 h-16 text-gray-300 dark:text-text-mute mb-4" />
 <h3 className="text-xl font-bold text-text-main mb-2">{t('search.noResults')}</h3>
 <p className="text-text-mute">
 We couldn't find anything matching "{query}". Try checking for typos.
 </p>
 </div>
 )}
 </div>
 </div>
 </>
 );
};
