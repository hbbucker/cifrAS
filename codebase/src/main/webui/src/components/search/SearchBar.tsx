import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import authClient from '../../services/authService';

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  keySignature: string;
}

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.trim().length === 0) {
        setResults([]);
        setIsDropdownOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        // Assume API endpoint /search?q=
        const { data } = await authClient.get(`/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`);
        setResults(data.results || []);
        setIsDropdownOpen(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      setIsDropdownOpen(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    setIsDropdownOpen(false);
    navigate(`/song/${result.id}`);
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef} data-testid="search-bar-container">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search songs, artists..."
          className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-[#aa3bff] focus:outline-none transition-all dark:text-white"
          data-testid="search-input"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 w-5 h-5 text-gray-400 animate-spin" data-testid="search-loader" />
        )}
      </div>

      {isDropdownOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50" data-testid="search-dropdown">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleSelectResult(result)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
              data-testid={`search-result-${result.id}`}
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{result.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{result.artist}</p>
              </div>
              <span className="text-xs font-bold text-[#aa3bff] bg-[#aa3bff]/10 px-2 py-1 rounded">
                {result.keySignature}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
