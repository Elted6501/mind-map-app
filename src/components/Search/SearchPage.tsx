import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchComponent from '@/components/Search/SearchComponent';
import SearchResults from '@/components/Search/SearchResults';
import { SearchResult } from '@/services/searchService';

const SearchPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<SearchResult>({
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
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearchResults = (results: SearchResult) => {
    setSearchResults(results);
  };

  const handleSelectMindMap = (mindMapId: string) => {
    router.push(`/?id=${mindMapId}`);
  };

  const handleLoadMore = async (page: number) => {
    // This would be implemented to load additional pages
    console.log('Load page:', page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Mind Maps
          </h1>
          <p className="text-gray-600">
            Find your mind maps by title, content, tags, or any text within your nodes
          </p>
        </div>

        {/* Search Component */}
        <div className="mb-8">
          <SearchComponent
            onResults={handleSearchResults}
            onLoading={setIsLoading}
            className="w-full"
          />
        </div>

        {/* Search Results */}
        <SearchResults
          results={searchResults}
          onLoadMore={handleLoadMore}
          onSelectMindMap={handleSelectMindMap}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default SearchPage;