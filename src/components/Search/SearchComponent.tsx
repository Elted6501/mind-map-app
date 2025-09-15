import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Clock, TrendingUp } from 'lucide-react';
import { searchService, SearchOptions, SearchResult } from '@/services/searchService';

interface SearchComponentProps {
  onResults: (results: SearchResult) => void;
  onLoading: (loading: boolean) => void;
  className?: string;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ 
  onResults, 
  onLoading, 
  className = '' 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Search options
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'updatedAt' | 'searchScore'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    const loadRecentSearches = async () => {
      const recent = await searchService.getRecentSearches();
      setRecentSearches(recent);
    };
    loadRecentSearches();
  }, []);

  // Handle search input changes with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch();
        loadSuggestions();
      }, 300);
    } else {
      // Clear results when query is empty
      onResults({
        mindMaps: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalResults: 0,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false
        },
        query: {
          searchTerm: '',
          sortBy: sortBy,
          sortOrder: sortOrder
        }
      });
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sortBy, sortOrder]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    onLoading(true);

    try {
      const options: SearchOptions = {
        query: searchQuery,
        sortBy,
        sortOrder,
        page: 1,
        limit: 20
      };

      const results = await searchService.searchMindMaps(options);
      onResults(results);

      // Save to recent searches
      await searchService.saveRecentSearch(searchQuery);
      const updated = await searchService.getRecentSearches();
      setRecentSearches(updated);

    } catch (error) {
      console.error('Search failed:', error);
      // Show empty results on error
      onResults({
        mindMaps: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalResults: 0,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false
        },
        query: {
          searchTerm: searchQuery,
          sortBy: sortBy,
          sortOrder: sortOrder
        }
      });
    } finally {
      setIsSearching(false);
      onLoading(false);
      setShowSuggestions(false);
    }
  };

  const loadSuggestions = async () => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const suggestions = await searchService.searchSuggestions(query);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleClearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      searchInputRef.current?.blur();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search mind maps..."
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />

        <div className="absolute inset-y-0 right-0 flex items-center">
          {query && (
            <button
              onClick={handleClearSearch}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 transition-colors ${
              showFilters ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Search filters"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {isSearching && (
          <div className="absolute inset-y-0 right-16 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Search Filters */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="updatedAt">Last Modified</option>
                <option value="createdAt">Created Date</option>
                <option value="title">Title</option>
                <option value="searchScore">Relevance</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Order:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-10"
        >
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <TrendingUp className="h-3 w-3" />
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <Clock className="h-3 w-3" />
                Recent
              </div>
              {recentSearches.slice(0, 5).map((recent, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(recent)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {recent}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;