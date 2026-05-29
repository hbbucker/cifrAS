import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, X } from 'lucide-react';


interface SearchResult {
  id: string;
  title: string;
  artist: string;
  keySignature: string;
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
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
    const controller = new AbortController();

    const fetchResults = async () => {
      if (debouncedQuery.trim().length < 3) {
        setResults([]);
        setIsDropdownOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/songs?q=${encodeURIComponent(debouncedQuery)}&pageSize=5`, {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal
        });
        
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.data || []);
        const mappedItems = items.map((item: any) => ({
          ...item,
          keySignature: item.originalKey || item.keySignature || 'C'
        }));
        setResults(mappedItems);
        setIsDropdownOpen(true);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return;
        }
        console.error('Search failed:', error);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      controller.abort();
    };
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
    if (e.key === 'Enter') {
      setIsDropdownOpen(false);
      if (onSearch) {
        onSearch(query.trim());
      } else if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setIsDropdownOpen(false);
    if (onSearch) {
      onSearch('');
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
        {query && !isLoading && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="search-clear"
          >
            <X className="w-4 h-4" />
          </button>
        )}
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
