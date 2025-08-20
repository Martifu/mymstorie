import { useState, useRef, useEffect } from 'react';
import { Play } from 'phosphor-react';

interface EntryVideoCardProps {
    src: string;
    title?: string;
    subtitle?: string;
    duration?: string;
    className?: string;
    onError?: (e: any) => void;
    posterUrl?: string;
    compact?: boolean; // Nueva prop para modo compacto en carrusel
}

export function EntryVideoCard({
    src,
    title,
    subtitle,
    duration,
    className = "",
    onError,
    posterUrl,
    compact = false
}: EntryVideoCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayer, setShowPlayer] = useState(false);
    const [thumbnail, setThumbnail] = useState<string | null>(posterUrl || null);
    const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(!posterUrl);
    const [videoDuration, setVideoDuration] = useState<string>(duration || '');
    const videoRef = useRef<HTMLVideoElement>(null);    // Generar thumbnail del primer frame
    useEffect(() => {
        if (!posterUrl && src) {
            const generateThumbnail = async () => {
                try {
                    const video = document.createElement('video');
                    video.src = src;
                    video.muted = true;
                    video.playsInline = true;
                    video.preload = 'metadata';
                    video.crossOrigin = 'anonymous';

                    const captureFrame = () => {
                        try {
                            if (video.videoWidth > 0 && video.videoHeight > 0) {
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');

                                if (ctx) {
                                    canvas.width = video.videoWidth;
                                    canvas.height = video.videoHeight;
                                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                    const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                                    setThumbnail(thumbnailDataUrl);
                                }
                            }
                        } catch (error) {
                            console.warn('Could not capture video frame:', error);
                        } finally {
                            setIsLoadingThumbnail(false);
                            video.remove();
                        }
                    };

                    const handleLoadedData = () => {
                        try {
                            video.currentTime = Math.min(1, video.duration * 0.1);
                        } catch (error) {
                            captureFrame();
                        }
                    };

                    const handleLoadedMetadata = () => {
                        if (!duration && video.duration) {
                            const minutes = Math.floor(video.duration / 60);
                            const seconds = Math.floor(video.duration % 60);
                            setVideoDuration(`${minutes}:${seconds.toString().padStart(2, '0')} min`);
                        }
                    };

                    video.addEventListener('loadeddata', handleLoadedData);
                    video.addEventListener('loadedmetadata', handleLoadedMetadata);
                    video.addEventListener('seeked', captureFrame);
                    video.addEventListener('error', () => {
                        setIsLoadingThumbnail(false);
                        video.remove();
                    });

                    setTimeout(() => {
                        if (isLoadingThumbnail) {
                            setIsLoadingThumbnail(false);
                            video.remove();
                        }
                    }, 5000);

                } catch (error) {
                    setIsLoadingThumbnail(false);
                }
            };

            generateThumbnail();
        }
    }, [src, posterUrl, duration, isLoadingThumbnail]);

    const handlePlayClick = () => {
        if (!showPlayer) {
            setShowPlayer(true);
            return;
        }

        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch((error) => {
                console.error('Error playing video:', error);
                onError?.(error);
            });
        }
    };

    const handleVideoEnded = () => {
        setIsPlaying(false);
        setShowPlayer(false); // Volver al thumbnail cuando termine
    };



    const handleVideoError = (e: any) => {
        console.error('Error loading video:', src, e);
        setIsPlaying(false);
        onError?.(e);
    };

    // Reproductor de video activo
    if (showPlayer) {
        return (
            <div className={`relative overflow-hidden ${compact ? 'rounded-2xl' : 'rounded-3xl'} shadow-2xl ${className}`}>
                <video
                    ref={videoRef}
                    src={src}
                    className="w-full h-full object-cover"
                    controls={true}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={handleVideoEnded}
                    onError={handleVideoError}
                    autoPlay
                    playsInline
                />
            </div>
        );
    }

    // Modo compacto para carrusel
    if (compact) {
        return (
            <div className={`relative overflow-hidden cursor-pointer group rounded-2xl ${className}`} onClick={handlePlayClick}>
                {/* Video oculto para preload */}
                <video
                    ref={videoRef}
                    src={src}
                    className="hidden"
                    preload="metadata"
                    onError={handleVideoError}
                    muted
                    playsInline
                />

                {/* Thumbnail o placeholder */}
                <div className="w-full h-full relative">
                    {isLoadingThumbnail ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800">
                            <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                        </div>
                    ) : thumbnail ? (
                        <div className="relative w-full h-full">
                            <img
                                src={thumbnail}
                                className="w-full h-full object-cover"
                                alt="Video preview"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800 flex items-center justify-center">
                            <svg className="w-12 h-12 text-white/60 dark:text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Botón de play glassmorphism */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/30 backdrop-blur-lg border border-white/40 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-white/40 transition-all duration-300 ease-out">
                        <Play size={24} className="text-white ml-1 drop-shadow-md" weight="fill" />
                    </div>
                </div>

                {/* Duración */}
                {videoDuration && (
                    <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                        {videoDuration}
                    </div>
                )}

                {/* Efecto hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-2xl" />
            </div>
        );
    }

    // Card de video inspirada en el diseño de la imagen
    return (
        <div className={`relative overflow-hidden cursor-pointer group ${className}`}>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">

                {/* Video oculto para preload */}
                <video
                    ref={videoRef}
                    src={src}
                    className="hidden"
                    preload="metadata"
                    onError={handleVideoError}
                    muted
                    playsInline
                />

                {/* Header con título y duración */}
                {(title || subtitle || videoDuration) && (
                    <div className="p-6 pb-4">
                        {title && (
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                                {subtitle}
                            </p>
                        )}
                        {videoDuration && (
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span>{videoDuration}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Área de thumbnail del video */}
                <div className="relative mx-6 mb-6 rounded-2xl overflow-hidden aspect-video" onClick={handlePlayClick}>
                    {isLoadingThumbnail ? (
                        /* Loading state */
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800">
                            <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                        </div>
                    ) : thumbnail ? (
                        /* Thumbnail del video */
                        <div className="relative w-full h-full">
                            <img
                                src={thumbnail}
                                className="w-full h-full object-cover"
                                alt="Video preview"
                            />
                            {/* Overlay gradiente sutil */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                        </div>
                    ) : (
                        /* Placeholder elegante */
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800 flex items-center justify-center">
                            <div className="text-center">
                                <svg className="w-12 h-12 text-white/60 dark:text-white/40 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2z" />
                                </svg>
                                <p className="text-white/60 dark:text-white/40 text-sm">Video</p>
                            </div>
                        </div>
                    )}

                    {/* Botón de play con glassmorphism */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/30 backdrop-blur-lg border border-white/40 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-white/40 transition-all duration-300 ease-out">
                            <Play size={24} className="text-white ml-1 drop-shadow-md" weight="fill" />
                        </div>
                    </div>

                    {/* Efecto de hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
