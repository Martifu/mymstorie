import { useState, useEffect, useRef } from 'react';

interface SimpleImageProps {
    src: string | undefined;
    alt: string;
    className?: string;
    fallback?: React.ReactNode;
    onLoad?: () => void;
    onError?: () => void;
    priority?: boolean; // For critical images that should load immediately
    blur?: boolean; // Enable blur placeholder
}

// Simple in-memory cache for loaded images
const imageCache = new Map<string, boolean>();
const failedImages = new Set<string>();

export function SimpleImage({
    src,
    alt,
    className = '',
    fallback,
    onLoad,
    onError,
    priority = false,
    blur = false
}: SimpleImageProps) {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isInView, setIsInView] = useState(priority); // Priority images are always "in view"
    const imgRef = useRef<HTMLDivElement>(null);

    // Check if image is already cached or failed
    useEffect(() => {
        if (!src) return;

        if (failedImages.has(src)) {
            setHasError(true);
            setIsLoading(false);
            return;
        }

        if (imageCache.has(src)) {
            setIsLoading(false);
            return;
        }
    }, [src]);

    // Intersection Observer for lazy loading (only if not priority)
    useEffect(() => {
        if (priority || !imgRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '50px' // Start loading 50px before entering viewport
            }
        );

        observer.observe(imgRef.current);

        return () => observer.disconnect();
    }, [priority]);

    // Preload image when in view
    useEffect(() => {
        if (!isInView || !src || hasError) return;

        // Check cache first
        if (imageCache.has(src)) {
            setIsLoading(false);
            return;
        }

        if (failedImages.has(src)) {
            setHasError(true);
            setIsLoading(false);
            return;
        }

        // Preload image
        const img = new Image();
        img.onload = () => {
            imageCache.set(src, true);
            setIsLoading(false);
            onLoad?.();
        };
        img.onerror = () => {
            failedImages.add(src);
            setHasError(true);
            setIsLoading(false);
            onError?.();
        };
        img.src = src;

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [isInView, src, hasError, onLoad, onError]);

    // Si no hay src o hay error, mostrar fallback
    if (!src || hasError) {
        return <>{fallback}</>;
    }

    return (
        <div ref={imgRef} className="relative">
            {/* Loading placeholder */}
            {isLoading && (
                <div
                    className={`absolute inset-0 ${className} flex items-center justify-center bg-gray-100 ${blur ? 'backdrop-blur-sm' : ''} transition-opacity duration-300`}
                >
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                </div>
            )}

            {/* Actual image - only render when in view or priority */}
            {(isInView || priority) && (
                <img
                    src={src}
                    alt={alt}
                    className={`${className} transition-opacity duration-300`}
                    loading={priority ? "eager" : "lazy"}
                    style={{
                        opacity: isLoading ? 0 : 1
                    }}
                    onLoad={() => {
                        if (!imageCache.has(src)) {
                            imageCache.set(src, true);
                        }
                        setIsLoading(false);
                        onLoad?.();
                    }}
                    onError={() => {
                        failedImages.add(src);
                        setHasError(true);
                        setIsLoading(false);
                        onError?.();
                    }}
                />
            )}
        </div>
    );
}
