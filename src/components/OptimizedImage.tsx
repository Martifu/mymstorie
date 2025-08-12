import { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
    src: string | undefined;
    alt: string;
    className?: string;
    fallback?: React.ReactNode;
    onLoad?: () => void;
    onError?: () => void;
}

export function OptimizedImage({
    src,
    alt,
    className = '',
    fallback,
    onLoad,
    onError
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(!!src);
    const [hasError, setHasError] = useState(false);
    const [loadedSrc, setLoadedSrc] = useState<string | undefined>(undefined);
    const currentLoadRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        // Reset states when src changes
        if (src !== currentLoadRef.current) {
            setIsLoading(!!src);
            setHasError(false);
            setLoadedSrc(undefined);
            currentLoadRef.current = src;

            if (src && src.trim()) {
                // Timeout de seguridad para evitar loading infinito
                const timeoutId = setTimeout(() => {
                    if (src === currentLoadRef.current && isLoading) {
                        console.warn('Image loading timeout:', src);
                        setHasError(true);
                        setIsLoading(false);
                        onError?.();
                    }
                }, 10000); // 10 segundos timeout

                // Precargar la imagen
                const img = new Image();

                img.onload = () => {
                    // Solo actualizar si esta imagen sigue siendo la actual
                    if (src === currentLoadRef.current) {
                        clearTimeout(timeoutId);
                        setLoadedSrc(src);
                        setIsLoading(false);
                        onLoad?.();
                    }
                };

                img.onerror = (error) => {
                    // Solo actualizar si esta imagen sigue siendo la actual
                    if (src === currentLoadRef.current) {
                        clearTimeout(timeoutId);
                        console.warn('Failed to load image:', src, error);
                        setHasError(true);
                        setIsLoading(false);
                        onError?.();
                    }
                };

                // Usar la URL directamente
                img.src = src;

                // Cleanup function
                return () => {
                    clearTimeout(timeoutId);
                };
            } else {
                setIsLoading(false);
            }
        }
    }, [src, onLoad, onError, isLoading]);

    // Si no hay src o hay error, mostrar fallback
    if (!src || hasError) {
        return <>{fallback}</>;
    }

    // Si está cargando, mostrar spinner
    if (isLoading) {
        return (
            <div className={`${className} flex items-center justify-center bg-gray-100 animate-pulse`}>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            </div>
        );
    }

    // Si la imagen se cargó exitosamente, mostrarla
    if (loadedSrc) {
        return (
            <img
                src={loadedSrc}
                alt={alt}
                className={className}
                loading="lazy"
                onError={() => {
                    setHasError(true);
                    onError?.();
                }}
            />
        );
    }

    // Fallback final
    return <>{fallback}</>;
}
