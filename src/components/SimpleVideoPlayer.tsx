import { useState, useRef, useEffect } from 'react';
import { Play } from 'phosphor-react';

interface SimpleVideoPlayerProps {
    src: string;
    className?: string;
    onError?: (e: any) => void;
    autoPlay?: boolean;
    muted?: boolean;
    showDuration?: boolean;
}

export function SimpleVideoPlayer({
    src,
    className = "",
    onError,
    autoPlay = false,
    muted = true,
    showDuration = true
}: SimpleVideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayer, setShowPlayer] = useState(autoPlay);
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(true);
    const [duration, setDuration] = useState<string>('');
    const videoRef = useRef<HTMLVideoElement>(null);    // Generar thumbnail mejorado
    useEffect(() => {
        if (!src) return;

        const generateThumbnail = () => {
            const video = document.createElement('video');
            video.src = src;
            video.muted = true;
            video.playsInline = true;
            video.preload = 'metadata';
            video.currentTime = 0;

            const onLoadedData = () => {
                try {
                    // Esperar un poco para asegurar que el frame esté disponible
                    setTimeout(() => {
                        if (video.videoWidth > 0 && video.videoHeight > 0) {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');

                            if (ctx) {
                                canvas.width = video.videoWidth;
                                canvas.height = video.videoHeight;
                                ctx.drawImage(video, 0, 0);

                                canvas.toBlob((blob) => {
                                    if (blob) {
                                        const url = URL.createObjectURL(blob);
                                        setThumbnail(url);
                                    }
                                }, 'image/jpeg', 0.8);
                            }
                        }
                        setIsLoadingThumbnail(false);
                    }, 100);
                } catch (error) {
                    console.warn('Error generating thumbnail:', error);
                    setIsLoadingThumbnail(false);
                }
            };

            const onLoadedMetadata = () => {
                if (video.duration) {
                    const minutes = Math.floor(video.duration / 60);
                    const seconds = Math.floor(video.duration % 60);
                    setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
                }
            };

            const onError = () => {
                setIsLoadingThumbnail(false);
            };

            video.addEventListener('loadeddata', onLoadedData);
            video.addEventListener('loadedmetadata', onLoadedMetadata);
            video.addEventListener('error', onError);

            // Limpieza después de 5 segundos
            setTimeout(() => {
                video.removeEventListener('loadeddata', onLoadedData);
                video.removeEventListener('loadedmetadata', onLoadedMetadata);
                video.removeEventListener('error', onError);
                if (thumbnail && thumbnail.startsWith('blob:')) {
                    URL.revokeObjectURL(thumbnail);
                }
            }, 5000);
        };

        generateThumbnail();

        return () => {
            if (thumbnail && thumbnail.startsWith('blob:')) {
                URL.revokeObjectURL(thumbnail);
            }
        };
    }, [src, thumbnail]);

    const handlePlayPause = () => {
        if (!showPlayer) {
            setShowPlayer(true);
            // El video empezará a reproducirse automáticamente
            return;
        }

        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play().catch((error) => {
                console.error('Error playing video:', error);
                onError?.(error);
            });
        }
    }; const handleVideoPlay = () => setIsPlaying(true);
    const handleVideoPause = () => setIsPlaying(false);
    const handleVideoEnded = () => {
        setIsPlaying(false);
        setShowPlayer(false); // Volver al thumbnail cuando termine
    };
    const handleVideoError = (e: any) => {
        console.error('Video error:', e);
        setIsPlaying(false);
        onError?.(e);
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl cursor-pointer group ${className}`}>
            {/* Video element - solo visible cuando showPlayer es true */}
            {showPlayer && (
                <video
                    ref={videoRef}
                    src={src}
                    className="w-full h-full object-cover"
                    controls={true}
                    muted={muted}
                    playsInline
                    autoPlay={true}
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    onEnded={handleVideoEnded}
                    onError={handleVideoError}
                />
            )}

            {/* Thumbnail y overlay - solo visible cuando no se muestra el reproductor */}
            {!showPlayer && (
                <div className="relative w-full h-full" onClick={handlePlayPause}>
                    {/* Thumbnail o placeholder */}
                    {isLoadingThumbnail ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800">
                            <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                    ) : thumbnail ? (
                        <img
                            src={thumbnail}
                            className="w-full h-full object-cover"
                            alt="Video thumbnail"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800 flex items-center justify-center">
                            <svg className="w-12 h-12 text-white/60 dark:text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}

                    {/* Overlay gradiente sutil */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />

                    {/* Botón de play con glassmorphism */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/25 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-white/35 transition-all duration-300 ease-out">
                            <Play size={24} className="text-white ml-1 drop-shadow-lg" weight="fill" />
                        </div>
                    </div>

                    {/* Duración en esquina inferior derecha */}
                    {showDuration && duration && (
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                            {duration}
                        </div>
                    )}

                    {/* Efecto hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </div>
            )}
        </div>
    );
}
