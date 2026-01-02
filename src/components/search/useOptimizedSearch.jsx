import { useState, useEffect, useMemo, useRef } from 'react';

// Normalizar texto para busca (remove acentos, lowercase)
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Criar índice de busca a partir de dados
const createSearchIndex = (items, searchFields) => {
  return items.map((item, index) => {
    const searchableText = searchFields
      .map(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return Array.isArray(value) ? value.join(' ') : value;
      })
      .filter(Boolean)
      .join(' ');

    return {
      originalIndex: index,
      item,
      normalized: normalizeText(searchableText),
    };
  });
};

// Hook de busca otimizada
export default function useOptimizedSearch(data = [], searchFields = ['nome', 'titulo'], options = {}) {
  const {
    debounceMs = 200,
    minChars = 0,
    maxResults = 100,
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const cacheRef = useRef(new Map());
  const debounceTimerRef = useRef(null);

  // Criar índice de busca memoizado
  const searchIndex = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return createSearchIndex(data, searchFields);
  }, [data, searchFields]);

  // Debounce do termo de busca
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsSearching(true);

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, debounceMs]);

  // Executar busca com cache
  const results = useMemo(() => {
    const normalizedTerm = normalizeText(debouncedTerm);

    // Retornar todos se não houver termo
    if (!normalizedTerm || normalizedTerm.length < minChars) {
      return data;
    }

    // Verificar cache
    if (cacheRef.current.has(normalizedTerm)) {
      return cacheRef.current.get(normalizedTerm);
    }

    // Buscar no índice
    const matches = searchIndex
      .filter(({ normalized }) => normalized.includes(normalizedTerm))
      .slice(0, maxResults)
      .map(({ item }) => item);

    // Armazenar no cache (limitar tamanho do cache)
    if (cacheRef.current.size > 50) {
      const firstKey = cacheRef.current.keys().next().value;
      cacheRef.current.delete(firstKey);
    }
    cacheRef.current.set(normalizedTerm, matches);

    return matches;
  }, [debouncedTerm, searchIndex, data, minChars, maxResults]);

  // Limpar cache quando dados mudarem
  useEffect(() => {
    cacheRef.current.clear();
  }, [data]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isSearching: isSearching && searchTerm.length > 0,
    hasResults: results.length > 0,
    resultCount: results.length,
  };
}