import { useState, useRef, useEffect } from 'react';
import { Play } from 'phosphor-react';

interface MOVCompatiblePlayerProps {
    src: string;
    className?: string;
    onError?: (e: any) => void;
    autoPlay?: boolean;
    muted?: boolean;
    showDuration?: boolean;
}

export function MOVCompatiblePlayer({
    src,
    className = "",
    onError,
    autoPlay = false,
    muted = true,
    showDuration = true
}: MOVCompatiblePlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayer, setShowPlayer] = useState(autoPlay);
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(true);
    const [duration, setDuration] = useState<string>('');
    const [videoSrc, setVideoSrc] = useState(src);
    const [retryCount, setRetryCount] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    const isMOVFile = src.toLowerCase().includes('.mov');
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);

    // Event handlers
    const handleVideoPlay = () => setIsPlaying(true);
    const handleVideoPause = () => setIsPlaying(false);
    const handleVideoEnded = () => {
        setIsPlaying(false);
        setShowPlayer(false);
    };

    const handleVideoError = (e: any) => {
        console.error('Video error:', {
            src: videoSrc,
            originalSrc: src,
            isMOVFile,
            isMobile,
            retryCount,
            error: e
        });

        // Para archivos MOV en móvil, intentar diferentes estrategias
        if (isMOVFile && isMobile && retryCount < 2) {
            setRetryCount(prev => prev + 1);

            if (retryCount === 0) {
                // Primer intento: usar URL directa sin parámetros
                const baseUrl = src.split('?')[0];
                console.log('Retrying MOV with base URL:', baseUrl);
                setVideoSrc(baseUrl);
                return;
            } else if (retryCount === 1) {
                // Segundo intento: añadir parámetros de compatibilidad
                const retryUrl = src.includes('?')
                    ? `${src}&format=mp4&quality=720p`
                    : `${src}?format=mp4&quality=720p`;
                console.log('Retrying MOV with compatibility params:', retryUrl);
                setVideoSrc(retryUrl);
                return;
            }
        }

        setIsPlaying(false);
        setShowPlayer(false);
        onError?.(e);
    };

    // Generar thumbnail con manejo específico para MOV
    useEffect(() => {
        if (!videoSrc) return;

        let isMounted = true;
        let videoElement: HTMLVideoElement | null = null;
        let timeoutId: NodeJS.Timeout | null = null;

        const generateThumbnail = () => {
            try {
                videoElement = document.createElement('video');
                videoElement.src = videoSrc;
                videoElement.muted = true;
                videoElement.playsInline = true;

                // Para archivos MOV, usar configuración específica
                if (isMOVFile) {
                    videoElement.preload = 'none';
                    videoElement.crossOrigin = 'anonymous';
                    // Forzar tipo MIME para MOV
                    if (isMobile) {
                        console.log('Setting up MOV file for mobile...');
                    }
                } else {
                    videoElement.preload = 'metadata';
                    videoElement.crossOrigin = 'anonymous';
                }

                const cleanup = () => {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                        timeoutId = null;
                    }
                    if (videoElement) {
                        videoElement.removeEventListener('loadeddata', onLoadedData);
                        videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
                        videoElement.removeEventListener('error', onVideoError);
                        videoElement.removeEventListener('seeked', onSeeked);
                        videoElement.remove();
                        videoElement = null;
                    }
                };

                const onLoadedData = () => {
                    if (!isMounted || !videoElement) return;
                    try {
                        videoElement.currentTime = Math.min(0.5, videoElement.duration * 0.1);
                    } catch (error) {
                        console.warn('Could not seek video for thumbnail:', error);
                        onSeeked();
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

                const onVideoError = (e: any) => {
                    console.warn('Error loading video for thumbnail:', {
                        src: videoSrc,
                        isMOVFile,
                        isMobile,
                        error: e
                    });
                    cleanup();
                    if (isMounted) {
                        setIsLoadingThumbnail(false);
                    }
                };

                timeoutId = setTimeout(() => {
                    if (isMounted) {
                        console.warn('Video thumbnail generation timeout:', videoSrc);
                        setIsLoadingThumbnail(false);
                        cleanup();
                    }
                }, isMOVFile && isMobile ? 20000 : 10000);

                videoElement.addEventListener('loadeddata', onLoadedData);
                videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
                videoElement.addEventListener('error', onVideoError);
                videoElement.addEventListener('seeked', onSeeked);

                // Para MOV, intentar load manual
                if (isMOVFile) {
                    setTimeout(() => {
                        if (videoElement && isMounted) {
                            videoElement.load();
                        }
                    }, 100);
                }

            } catch (error) {
                console.error('Error creating video element:', error);
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
    }, [videoSrc, retryCount]);

    const handlePlayPause = () => {
        if (!showPlayer) {
            setShowPlayer(true);
            return;
        }

        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play().catch((error) => {
                console.error('Error playing video:', error);
                handleVideoError(error);
            });
        }
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl cursor-pointer group ${className}`}>
            {/* Video element - solo visible cuando showPlayer es true */}
            {showPlayer && (
                <video
                    key={`video-${videoSrc}-${retryCount}`} // Force re-render on retry
                    ref={videoRef}
                    src={videoSrc}
                    className="w-full h-full object-cover"
                    controls={true}
                    muted={muted}
                    playsInline
                    autoPlay={true}
                    preload="metadata"
                    crossOrigin="anonymous"
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    onEnded={handleVideoEnded}
                    onError={handleVideoError}
                    onLoadStart={() => console.log('Video load started:', videoSrc)}
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
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800">
                            <div className="text-gray-500 text-sm">
                                {isMOVFile && isMobile ? 'MOV video (tap to play)' : 'Video no disponible'}
                            </div>
                        </div>
                    )}

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all duration-200 shadow-lg">
                            <Play size={24} className="text-white ml-1" weight="fill" />
                        </div>
                    </div>

                    {/* Duration badge */}
                    {showDuration && duration && (
                        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                            {duration}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
