import { useState, useEffect, useCallback, useRef } from 'react';
import { searchManager } from './SearchIndex';

// Hook de busca otimizado com debounce
export function useSearch(initialQuery = '', types = [], debounceMs = 300) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef(null);
  
  const performSearch = useCallback((searchQuery) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    
    // Busca síncrona (já é rápida)
    const searchResults = searchManager.search(searchQuery, types);
    setResults(searchResults);
    setIsSearching(false);
  }, [types]);
  
  // Debounce da busca
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    if (query.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    
    debounceTimer.current = setTimeout(() => {
      performSearch(query);
    }, debounceMs);
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, performSearch, debounceMs]);
  
  return {
    query,
    setQuery,
    results,
    isSearching
  };
}