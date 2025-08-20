import { useState, useRef, useEffect } from 'react';
import { Play } from 'phosphor-react';

interface VideoCardProps {
    src: string;
    title?: string;
    duration?: string;
    className?: string;
    onError?: (e: any) => void;
    autoGenerateThumbnail?: boolean;
    posterUrl?: string;
}

export function VideoCard({
    src,
    title,
    duration,
    className = "",
    onError,
    autoGenerateThumbnail = true,
    posterUrl
}: VideoCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [thumbnail, setThumbnail] = useState<string | null>(posterUrl || null);
    const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(!posterUrl && autoGenerateThumbnail);
    const [videoDuration, setVideoDuration] = useState<string>(duration || '');
    const videoRef = useRef<HTMLVideoElement>(null);

    // Generar thumbnail automáticamente del primer frame del video
    useEffect(() => {
        if (!posterUrl && autoGenerateThumbnail && src) {
            const generateThumbnail = async () => {
                try {
                    const video = document.createElement('video');
                    video.src = src;
                    video.muted = true;
                    video.playsInline = true;
                    video.preload = 'metadata';
                    video.crossOrigin = 'anonymous';

                    const handleLoadedData = () => {
                        try {
                            // Ir al segundo 1 para capturar un frame mejor
                            video.currentTime = Math.min(1, video.duration * 0.1);
                        } catch (error) {
                            console.warn('Error setting currentTime:', error);
                            captureFrame();
                        }
                    };

                    const handleSeeked = () => {
                        captureFrame();
                    };

                    const captureFrame = () => {
                        try {
                            if (video.videoWidth > 0 && video.videoHeight > 0) {
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');

                                if (ctx) {
                                    // Establecer dimensiones del canvas
                                    canvas.width = video.videoWidth;
                                    canvas.height = video.videoHeight;

                                    // Dibujar el frame del video en el canvas
                                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                                    // Convertir a DataURL con buena calidad
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

                    const handleError = () => {
                        console.warn('Error loading video for thumbnail');
                        setIsLoadingThumbnail(false);
                        video.remove();
                    };

                    const handleLoadedMetadata = () => {
                        // Establecer duración si no se proporcionó
                        if (!duration && video.duration) {
                            const minutes = Math.floor(video.duration / 60);
                            const seconds = Math.floor(video.duration % 60);
                            setVideoDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
                        }
                    };

                    video.addEventListener('loadeddata', handleLoadedData);
                    video.addEventListener('loadedmetadata', handleLoadedMetadata);
                    video.addEventListener('seeked', handleSeeked);
                    video.addEventListener('error', handleError);

                    // Timeout de seguridad
                    setTimeout(() => {
                        if (isLoadingThumbnail) {
                            setIsLoadingThumbnail(false);
                            video.remove();
                        }
                    }, 5000);

                } catch (error) {
                    console.warn('Error generating thumbnail:', error);
                    setIsLoadingThumbnail(false);
                }
            };

            generateThumbnail();
        }
    }, [src, posterUrl, autoGenerateThumbnail, duration, isLoadingThumbnail]);

    const handlePlayClick = () => {
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
    };

    const handleVideoPause = () => {
        setIsPlaying(false);
    };

    const handleVideoError = (e: any) => {
        console.error('Error loading video:', src, e);
        setIsPlaying(false);
        onError?.(e);
    };

    // Si está reproduciendo, mostrar el video completo
    if (isPlaying) {
        return (
            <div className={`relative overflow-hidden rounded-3xl ${className}`}>
                <video
                    ref={videoRef}
                    src={src}
                    className="w-full h-full object-cover"
                    controls={true}
                    onEnded={handleVideoEnded}
                    onPause={handleVideoPause}
                    onError={handleVideoError}
                    autoPlay
                    playsInline
                />
            </div>
        );
    }

    // Mostrar card con thumbnail
    return (
        <div
            className={`relative overflow-hidden rounded-3xl cursor-pointer group ${className}`}
            onClick={handlePlayClick}
        >
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

            {/* Fondo: thumbnail o placeholder */}
            <div className="w-full h-full relative">
                {isLoadingThumbnail ? (
                    /* Loading skeleton con gradiente suave */
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900">
                        <div className="w-8 h-8 border-3 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                    </div>
                ) : thumbnail ? (
                    /* Thumbnail capturado del video */
                    <div className="relative w-full h-full">
                        <img
                            src={thumbnail}
                            className="w-full h-full object-cover"
                            alt="Video preview"
                        />
                        {/* Overlay sutil para mejorar legibilidad */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>
                ) : (
                    /* Placeholder con gradiente suave */
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800 flex items-center justify-center">
                        <svg className="w-16 h-16 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Botón de play con efecto glassmorphism */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 ease-out">
                    <Play size={28} className="text-white ml-1 drop-shadow-lg" weight="fill" />
                </div>
            </div>

            {/* Duración en la esquina inferior derecha */}
            {videoDuration && (
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full">
                    {videoDuration}
                </div>
            )}

            {/* Título en la parte inferior si se proporciona */}
            {title && (
                <div className="absolute bottom-4 left-4 right-20">
                    <h3 className="text-white text-lg font-semibold drop-shadow-lg line-clamp-2">
                        {title}
                    </h3>
                </div>
            )}

            {/* Efecto de hover sutil */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-3xl" />
        </div>
    );
}
