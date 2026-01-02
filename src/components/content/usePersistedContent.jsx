import { useState, useEffect } from 'react';
import { contentManager } from './ContentManager';

/**
 * Hook para consumir conteúdo persistido
 * 
 * USO:
 * const { content, isLoading, error } = usePersistedContent(slug, modulo, tipo);
 */
export function usePersistedContent(slug, modulo = 'geral', tipo = 'guideline') {
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      if (!slug) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await contentManager.get(slug, { modulo, tipo });
        
        if (isMounted) {
          setContent(data);
          contentManager.trackAccess(slug);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          console.error(`[usePersistedContent] Erro ao carregar ${slug}:`, err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, [slug, modulo, tipo]);

  return { content, isLoading, error };
}