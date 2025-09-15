/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
import React from 'react';
import { Calendar, Users, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { SearchResult } from '@/services/searchService';

interface SearchResultsProps {
  results: SearchResult;
  onLoadMore?: (page: number) => void;
  onSelectMindMap: (mindMapId: string) => void;
  loading?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onLoadMore,
  onSelectMindMap,
  loading = false
}) => {
  const { mindMaps, pagination, query } = results;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-gray-600">Searching...</span>
      </div>
    );
  }

  if (!query.searchTerm && mindMaps.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Search Your Mind Maps
        </h3>
        <p className="text-gray-600">
          Enter a search term to find mind maps by title, content, or tags
        </p>
      </div>
    );
  }

  if (query.searchTerm && mindMaps.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Results Found
        </h3>
        <p className="text-gray-600">
          No mind maps match your search for "{query.searchTerm}"
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Try different keywords or check your spelling
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const getNodePreview = (nodes: any[], searchTerm: string) => {
    if (!nodes?.length) return null;
    
    // Find nodes that contain the search term
    const matchingNodes = nodes.filter(node => 
      node.text?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (matchingNodes.length > 0) {
      return matchingNodes.slice(0, 3).map(node => node.text).join(', ');
    }
    
    // If no matching nodes, show first few nodes
    return nodes.slice(0, 3).map(node => node.text).join(', ');
  };

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Search Results
          </h2>
          <p className="text-sm text-gray-600">
            {pagination.totalResults} result{pagination.totalResults !== 1 ? 's' : ''} 
            {query.searchTerm && ` for "${query.searchTerm}"`}
          </p>
        </div>
        
        <div className="text-sm text-gray-500">
          Sorted by {query.sortBy === 'searchScore' ? 'relevance' : query.sortBy.replace(/([A-Z])/g, ' $1').toLowerCase()}
        </div>
      </div>

      {/* Mind Map Cards */}
      <div className="grid gap-4">
        {mindMaps.map((mindMap: any) => (
          <div
            key={mindMap._id}
            onClick={() => onSelectMindMap(mindMap._id)}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {highlightSearchTerm(mindMap.title || 'Untitled Mind Map', query.searchTerm)}
                </h3>
                {mindMap.description && (
                  <p className="text-gray-600 mt-1 line-clamp-2">
                    {highlightSearchTerm(mindMap.description, query.searchTerm)}
                  </p>
                )}
              </div>
              
              {mindMap.searchScore && (
                <div className="ml-4 flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Score: {mindMap.searchScore}
                  </span>
                </div>
              )}
            </div>

            {/* Node Preview */}
            {mindMap.nodes && mindMap.nodes.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Content: </span>
                  {highlightSearchTerm(
                    getNodePreview(mindMap.nodes, query.searchTerm) || 'No content',
                    query.searchTerm
                  )}
                  {mindMap.nodes.length > 3 && (
                    <span className="text-gray-400">... and {mindMap.nodes.length - 3} more</span>
                  )}
                </p>
              </div>
            )}

            {/* Tags */}
            {mindMap.tags && mindMap.tags.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {mindMap.tags.slice(0, 5).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {highlightSearchTerm(tag, query.searchTerm)}
                    </span>
                  ))}
                  {mindMap.tags.length > 5 && (
                    <span className="text-xs text-gray-400">
                      +{mindMap.tags.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(mindMap.updatedAt || mindMap.createdAt)}
                </div>
                
                {mindMap.nodes && (
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {mindMap.nodes.length} node{mindMap.nodes.length !== 1 ? 's' : ''}
                  </div>
                )}
                
                {mindMap.collaborators && mindMap.collaborators.length > 0 && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {mindMap.collaborators.length + 1} collaborator{mindMap.collaborators.length !== 0 ? 's' : ''}
                  </div>
                )}
              </div>
              
              <div className="text-xs">
                by {mindMap.owner?.username || 'Unknown'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-700">
            Showing page {pagination.currentPage} of {pagination.totalPages}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onLoadMore?.(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            <span className="text-sm text-gray-500">
              {pagination.currentPage} / {pagination.totalPages}
            </span>
            
            <button
              onClick={() => onLoadMore?.(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;