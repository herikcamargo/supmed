import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Cache preditivo baseado em padrões de uso
const MODULE_USAGE_KEY = 'supmed_module_usage';
const PREFETCH_THRESHOLD = 3; // Prefetch após 3 usos

// Registrar uso de módulo
export const trackModuleUsage = (moduleName) => {
  const usage = JSON.parse(localStorage.getItem(MODULE_USAGE_KEY) || '{}');
  usage[moduleName] = (usage[moduleName] || 0) + 1;
  localStorage.setItem(MODULE_USAGE_KEY, JSON.stringify(usage));
  
  // Retornar módulos mais usados para prefetch
  return getTopModules();
};

// Obter módulos mais usados
export const getTopModules = (limit = 5) => {
  const usage = JSON.parse(localStorage.getItem(MODULE_USAGE_KEY) || '{}');
  return Object.entries(usage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([module]) => module);
};

// Verificar se módulo deve ser prefetched
export const shouldPrefetch = (moduleName) => {
  const usage = JSON.parse(localStorage.getItem(MODULE_USAGE_KEY) || '{}');
  return (usage[moduleName] || 0) >= PREFETCH_THRESHOLD;
};

// Cache de dados com TTL
class DataCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttlMinutes = 30) {
    const expiry = Date.now() + (ttlMinutes * 60 * 1000);
    this.cache.set(key, { value, expiry });
    
    // Persistir em localStorage para cache entre sessões
    this.persistToStorage(key, value, expiry);
  }

  get(key) {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }
    
    // Tentar recuperar do localStorage
    const stored = this.getFromStorage(key);
    if (stored) {
      this.cache.set(key, stored);
      return stored.value;
    }
    
    return null;
  }

  persistToStorage(key, value, expiry) {
    const storageKey = `supmed_cache_${key}`;
    localStorage.setItem(storageKey, JSON.stringify({ value, expiry }));
  }

  getFromStorage(key) {
    const storageKey = `supmed_cache_${key}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.expiry > Date.now()) {
        return parsed;
      }
      localStorage.removeItem(storageKey);
    }
    return null;
  }

  invalidate(key) {
    this.cache.delete(key);
    localStorage.removeItem(`supmed_cache_${key}`);
  }

  clear() {
    this.cache.clear();
    Object.keys(localStorage)
      .filter(k => k.startsWith('supmed_cache_'))
      .forEach(k => localStorage.removeItem(k));
  }
}

export const dataCache = new DataCache();

// Componente de Loading otimizado
export function LoadingFallback({ message = 'Carregando...' }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <p className="text-xs text-slate-500">{message}</p>
      </div>
    </div>
  );
}

// HOC para lazy loading com prefetch
export function withLazyLoad(importFn, moduleName) {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props) {
    useEffect(() => {
      trackModuleUsage(moduleName);
    }, []);

    return (
      <Suspense fallback={<LoadingFallback message={`Carregando ${moduleName}...`} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Hook para prefetch inteligente
export function usePrefetch() {
  useEffect(() => {
    const topModules = getTopModules();
    
    // Prefetch dos módulos mais usados após idle
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        topModules.forEach(module => {
          // Criar link de prefetch
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = `/pages/${module}.js`;
          document.head.appendChild(link);
        });
      });
    }
  }, []);
}

// Hook para medir performance
export function usePerformanceMetrics(componentName) {
  const [renderTime, setRenderTime] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setRenderTime(duration);
      
      // Logar métricas lentas
      if (duration > 100) {
        console.warn(`[Performance] ${componentName} render: ${duration.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  return renderTime;
}

// Otimização de imagens
export function OptimizedImage({ src, alt, className, fallback = '/placeholder.png' }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse rounded" />
      )}
      <img
        src={error ? fallback : src}
        alt={alt}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
}

// Debounce hook para inputs
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Throttle para scroll/resize
export function useThrottle(callback, delay = 100) {
  const [lastCall, setLastCall] = useState(0);

  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      setLastCall(now);
      callback(...args);
    }
  };
}

export default {
  trackModuleUsage,
  getTopModules,
  shouldPrefetch,
  dataCache,
  LoadingFallback,
  withLazyLoad,
  usePrefetch,
  usePerformanceMetrics,
  OptimizedImage,
  useDebounce,
  useThrottle
};