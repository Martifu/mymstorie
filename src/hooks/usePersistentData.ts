import { useEffect, useRef } from 'react';

/**
 * Hook para mantener datos persistentes entre navegaciones de tabs
 * Evita recargas innecesarias de datos costosos
 */
export function usePersistentData<T>(
    key: string,
    fetcher: () => Promise<T> | T,
    deps: any[] = []
): {
    data: T | null;
    isLoading: boolean;
    refetch: () => void;
} {
    const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
    const loadingRef = useRef<Map<string, boolean>>(new Map());
    const dataRef = useRef<T | null>(null);
    const isLoadingRef = useRef<boolean>(true);

    // TTL for cache (5 minutes)
    const CACHE_TTL = 5 * 60 * 1000;

    const getCacheKey = () => `${key}-${JSON.stringify(deps)}`;

    const fetchData = async () => {
        const cacheKey = getCacheKey();

        // Check if already loading
        if (loadingRef.current.get(cacheKey)) {
            return;
        }

        // Check cache first
        const cached = cacheRef.current.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            dataRef.current = cached.data;
            isLoadingRef.current = false;
            return;
        }

        loadingRef.current.set(cacheKey, true);
        isLoadingRef.current = true;

        try {
            const result = await fetcher();
            dataRef.current = result;

            // Update cache
            cacheRef.current.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            isLoadingRef.current = false;
        } catch (error) {
            console.error(`Error fetching data for ${key}:`, error);
            isLoadingRef.current = false;
        } finally {
            loadingRef.current.set(cacheKey, false);
        }
    };

    const refetch = () => {
        const cacheKey = getCacheKey();
        cacheRef.current.delete(cacheKey);
        fetchData();
    };

    useEffect(() => {
        fetchData();
    }, [key, ...deps]);

    return {
        data: dataRef.current,
        isLoading: isLoadingRef.current,
        refetch
    };
}

/**
 * Hook específico para persistir imágenes críticas
 */
export function usePersistentImages(imageUrls: string[]) {
    useEffect(() => {
        // Preload critical images
        imageUrls.forEach(url => {
            if (!url) return;

            const img = new Image();
            img.src = url;
        });
    }, [imageUrls]);
}

/**
 * Hook para limpiar cache cuando sea necesario
 */
export function useCacheCleaner(maxCacheSize = 50) {
    useEffect(() => {
        // Clean cache periodically
        const interval = setInterval(() => {
            const caches: Map<string, any>[] = [
                // Add your cache references here when needed
            ];

            caches.forEach(cache => {
                if (cache.size > maxCacheSize) {
                    const entries = Array.from(cache.entries());
                    entries.slice(0, Math.floor(maxCacheSize / 2)).forEach(([key]: [string, any]) => {
                        cache.delete(key);
                    });
                }
            });
        }, 10 * 60 * 1000); // Every 10 minutes

        return () => clearInterval(interval);
    }, [maxCacheSize]);
}
