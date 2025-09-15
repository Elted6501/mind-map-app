/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from './apiClient';

export interface SearchResult {
  mindMaps: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  query: {
    searchTerm: string;
    sortBy: string;
    sortOrder: string;
  };
}

export interface SearchOptions {
  query?: string;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'searchScore';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

class SearchService {
  async searchMindMaps(options: SearchOptions = {}): Promise<SearchResult> {
    const {
      query = '',
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = options;

    const searchParams = new URLSearchParams();
    if (query) searchParams.append('q', query);
    searchParams.append('sortBy', sortBy);
    searchParams.append('sortOrder', sortOrder);
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());

    const response = await apiClient.get<SearchResult>(`/mindmaps/search?${searchParams.toString()}`);
    return response;
  }

  async searchSuggestions(query: string): Promise<string[]> {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    try {
      // Get recent searches and extract common terms
      const result = await this.searchMindMaps({ 
        query, 
        limit: 5,
        sortBy: 'searchScore' 
      });
      
      const suggestions = new Set<string>();
      
      // Add exact titles that match
      result.mindMaps.forEach((mindMap: any) => {
        if (mindMap.title?.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(mindMap.title);
        }
        
        // Add relevant tags
        if (mindMap.tags) {
          mindMap.tags.forEach((tag: string) => {
            if (tag.toLowerCase().includes(query.toLowerCase())) {
              suggestions.add(tag);
            }
          });
        }
      });

      return Array.from(suggestions).slice(0, 10);
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  async getRecentSearches(): Promise<string[]> {
    // Return empty array since we're not using localStorage
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async saveRecentSearch(_query: string): Promise<void> {
    // No-op since we're not persisting search history
    return;
  }

  clearRecentSearches(): void {
    // No-op since we're not persisting search history
    return;
  }
}

export const searchService = new SearchService();