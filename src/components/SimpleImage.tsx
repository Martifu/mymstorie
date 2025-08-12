import { useState } from 'react';

interface SimpleImageProps {
    src: string | undefined;
    alt: string;
    className?: string;
    fallback?: React.ReactNode;
    onLoad?: () => void;
    onError?: () => void;
}

export function SimpleImage({
    src,
    alt,
    className = '',
    fallback,
    onLoad,
    onError
}: SimpleImageProps) {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Si no hay src o hay error, mostrar fallback
    if (!src || hasError) {
        return <>{fallback}</>;
    }

    return (
        <div className="relative">
            {isLoading && (
                <div className={`absolute inset-0 ${className} flex items-center justify-center bg-gray-100 animate-pulse`}>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                </div>
            )}
            <img
                src={src}
                alt={alt}
                className={className}
                loading="lazy"
                onLoad={() => {
                    setIsLoading(false);
                    onLoad?.();
                }}
                onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                    onError?.();
                }}
                style={{ opacity: isLoading ? 0 : 1 }}
            />
        </div>
    );
}
