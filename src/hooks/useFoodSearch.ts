/**
 * Food Search Hook
 * Handles searching the FDC food database with debouncing
 */

import { useState, useEffect, useCallback } from 'react';
import { foodsRepository } from '../repositories/foodsRepository';
import type { FoodSearchResult } from '../types/food';

interface UseFoodSearchResult {
  results: FoodSearchResult[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loadMore: () => Promise<void>;
}

const RESULTS_PER_PAGE = 20;

export const useFoodSearch = (): UseFoodSearchResult => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setOffset(0); // Reset pagination on new search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setHasMore(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await foodsRepository.searchFoods(
          debouncedQuery,
          RESULTS_PER_PAGE,
          0
        );

        setResults(searchResults);
        setHasMore(searchResults.length >= RESULTS_PER_PAGE);
      } catch (err) {
        console.error('Food search error:', err);
        setError('Failed to search foods. Please try again.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  // Load more results
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || !debouncedQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const newOffset = offset + RESULTS_PER_PAGE;
      const moreResults = await foodsRepository.searchFoods(
        debouncedQuery,
        RESULTS_PER_PAGE,
        newOffset
      );

      setResults(prev => [...prev, ...moreResults]);
      setOffset(newOffset);
      setHasMore(moreResults.length >= RESULTS_PER_PAGE);
    } catch (err) {
      console.error('Load more error:', err);
      setError('Failed to load more results.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, offset, hasMore, isLoading]);

  return {
    results,
    isLoading,
    error,
    hasMore,
    searchQuery,
    setSearchQuery,
    loadMore,
  };
};
