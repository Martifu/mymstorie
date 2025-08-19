import { useState, useRef, useEffect } from 'react';

interface FloatingVinylPlayerProps {
    trackData: {
        preview_url: string | null;
        album_image: string | null;
    };
    size?: 'small' | 'medium' | 'large';
}

export function FloatingVinylPlayer({
    trackData,
    size = 'medium'
}: FloatingVinylPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const sizeClasses = {
        small: 'w-12 h-12',
        medium: 'w-16 h-16',
        large: 'w-20 h-20'
    };

    const iconSizeClasses = {
        small: 'w-2 h-2',
        medium: 'w-3 h-3',
        large: 'w-4 h-4'
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !trackData.preview_url) return;

        const handleEnded = () => {
            setIsPlaying(false);
        };
        const handleLoadStart = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handleLoadedData = () => setIsLoading(false);

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('loadeddata', handleLoadedData);

        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('loadeddata', handleLoadedData);
        };
    }, [trackData.preview_url]);

    const handlePlay = async () => {
        const audio = audioRef.current;
        if (!audio || !trackData.preview_url) return;

        try {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                setIsLoading(true);

                // Configurar audio
                audio.volume = 0.7;
                audio.currentTime = 0; // Comenzar desde el inicio

                // Intentar reproducir
                await audio.play();
                setIsPlaying(true);
                setIsLoading(false);

                console.log('Audio reproduciendo:', trackData.preview_url);
            }
        } catch (error) {
            console.error('Error playing audio:', error);
            console.error('Preview URL:', trackData.preview_url);

            // Si el audio falla por políticas del navegador, intentar de nuevo
            if (error instanceof Error && error.name === 'NotAllowedError') {
                alert('Para reproducir música, el navegador requiere interacción del usuario. Intenta hacer clic de nuevo.');
            }

            setIsLoading(false);
            setIsPlaying(false);
        }
    };

    if (!trackData.preview_url) return null;

    return (
        <div className="relative">
            <audio
                ref={audioRef}
                src={trackData.preview_url}
                preload="metadata"
                crossOrigin="anonymous"
                playsInline
            />

            {/* Vinyl Disc FAB */}
            <button
                onClick={handlePlay}
                disabled={isLoading}
                className={`${sizeClasses[size]} relative rounded-full overflow-hidden shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50`}
                style={{
                    background: trackData.album_image
                        ? `url(${trackData.album_image})`
                        : 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: 'black',
                    // Animación removida para optimizar rendimiento
                }}
            >
                {/* Vinyl effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-black/30" />

                {/* Center hole */}
                <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${size === 'small' ? 'w-1 h-1' : size === 'medium' ? 'w-2 h-2' : 'w-3 h-3'
                    } bg-black rounded-full shadow-inner`} />

                {/* Vinyl grooves effect */}
                <div className="absolute inset-1 rounded-full border border-black/20" />
                {size !== 'small' && <div className="absolute inset-2 rounded-full border border-black/10" />}

                {/* Music icon overlay when not playing */}
                <div className={`absolute inset-0 bg-black/40 rounded-full flex items-center justify-center transition-opacity duration-200 ${isPlaying ? 'opacity-0' : 'opacity-100'
                    }`}>
                    {isLoading ? (
                        <div className={`${iconSizeClasses[size]} border-2 border-white border-t-transparent rounded-full animate-spin`} />
                    ) : (
                        <svg className={`${iconSizeClasses[size]} text-white ml-0.5`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>

                {/* Pause icon overlay when playing */}
                <div className={`absolute inset-0 bg-black/40 rounded-full flex items-center justify-center transition-opacity duration-200 ${isPlaying ? 'opacity-100' : 'opacity-0'
                    }`}>
                    <svg className={iconSizeClasses[size]} fill="white" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* Default music icon if no album image */}
                {!trackData.album_image && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className={`${size === 'small' ? 'w-4 h-4' : size === 'medium' ? 'w-6 h-6' : 'w-8 h-8'} text-white/60`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </button>
        </div>
    );
}