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
    const videoRef = useRef<HTMLVideoElement>(null);

    // Event handlers
    const handleVideoPlay = () => setIsPlaying(true);
    const handleVideoPause = () => setIsPlaying(false);
    const handleVideoEnded = () => {
        setIsPlaying(false);
        setShowPlayer(false); // Volver al thumbnail cuando termine
    };
    const handleVideoError = (e: any) => {
        console.error('Video error:', src, e);
        setIsPlaying(false);
        setShowPlayer(false); // Volver al thumbnail en caso de error
        onError?.(e);
    };

    // Generar thumbnail mejorado
    useEffect(() => {
        if (!src) return;

        let isMounted = true;
        let videoElement: HTMLVideoElement | null = null;

        const generateThumbnail = () => {
            try {
                videoElement = document.createElement('video');
                videoElement.src = src;
                videoElement.muted = true;
                videoElement.playsInline = true;
                videoElement.preload = 'metadata';
                videoElement.crossOrigin = 'anonymous';
                videoElement.currentTime = 0;

                const cleanup = () => {
                    if (videoElement) {
                        videoElement.removeEventListener('loadeddata', onLoadedData);
                        videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
                        videoElement.removeEventListener('error', onError);
                        videoElement.removeEventListener('seeked', onSeeked);
                        videoElement.remove();
                        videoElement = null;
                    }
                };

                const onLoadedData = () => {
                    if (!isMounted || !videoElement) return;
                    try {
                        // Ir a 0.5 segundos para un mejor thumbnail
                        videoElement.currentTime = Math.min(0.5, videoElement.duration * 0.1);
                    } catch (error) {
                        console.warn('Could not seek video for thumbnail:', error);
                        onSeeked(); // Intentar capturar el frame actual
                    }
                };

                const onSeeked = () => {
                    if (!isMounted || !videoElement) return;
                    try {
                        if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');

                            if (ctx) {
                                canvas.width = videoElement.videoWidth;
                                canvas.height = videoElement.videoHeight;
                                ctx.drawImage(videoElement, 0, 0);

                                canvas.toBlob((blob) => {
                                    if (blob && isMounted) {
                                        const url = URL.createObjectURL(blob);
                                        setThumbnail(url);
                                    }
                                    cleanup();
                                }, 'image/jpeg', 0.7);
                            } else {
                                cleanup();
                            }
                        } else {
                            cleanup();
                        }
                    } catch (error) {
                        console.warn('Error generating thumbnail:', error);
                        cleanup();
                    }
                    if (isMounted) {
                        setIsLoadingThumbnail(false);
                    }
                };

                const onLoadedMetadata = () => {
                    if (!isMounted || !videoElement) return;
                    try {
                        if (videoElement.duration && !duration) {
                            const minutes = Math.floor(videoElement.duration / 60);
                            const seconds = Math.floor(videoElement.duration % 60);
                            setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
                        }
                    } catch (error) {
                        console.warn('Error getting video duration:', error);
                    }
                };

                const onError = () => {
                    console.warn('Error loading video for thumbnail:', src);
                    cleanup();
                    if (isMounted) {
                        setIsLoadingThumbnail(false);
                    }
                };

                videoElement.addEventListener('loadeddata', onLoadedData);
                videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
                videoElement.addEventListener('error', onError);
                videoElement.addEventListener('seeked', onSeeked);

                // Timeout de seguridad
                setTimeout(() => {
                    if (isMounted && videoElement) {
                        cleanup();
                        setIsLoadingThumbnail(false);
                    }
                }, 5000);

            } catch (error) {
                console.warn('Error creating video element:', error);
                if (isMounted) {
                    setIsLoadingThumbnail(false);
                }
            }
        };

        generateThumbnail();

        return () => {
            isMounted = false;
            if (thumbnail && thumbnail.startsWith('blob:')) {
                URL.revokeObjectURL(thumbnail);
            }
        };
    }, [src]); // Removido thumbnail de las dependencias para evitar loops

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
