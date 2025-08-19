import { useState, useRef, useEffect } from 'react';
import { Play } from 'phosphor-react';

interface VideoThumbnailProps {
    src: string;
    className?: string;
    onError?: (e: any) => void;
    showControls?: boolean;
}

export function VideoThumbnail({
    src,
    className = "",
    onError,
    showControls = true
}: VideoThumbnailProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);


    // Intentar capturar primer frame sin CORS
    useEffect(() => {
        const captureFrame = async () => {
            try {
                const video = document.createElement('video');
                video.src = src;
                video.muted = true;
                video.playsInline = true;
                video.preload = 'metadata';

                const captureFirstFrame = () => {
                    try {
                        video.currentTime = 0.1; // Ir a 0.1 segundos

                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;

                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                            const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
                            setThumbnail(thumbnailUrl);
                        }
                    } catch (error) {
                        // Silently fall back to placeholder
                    }
                    setIsLoadingThumbnail(false);
                    video.remove();
                };

                video.addEventListener('loadeddata', captureFirstFrame);
                video.addEventListener('seeked', captureFirstFrame);

                video.addEventListener('error', () => {
                    setIsLoadingThumbnail(false);
                    video.remove();
                });

                // Timeout para evitar esperas indefinidas
                setTimeout(() => {
                    if (isLoadingThumbnail) {
                        setIsLoadingThumbnail(false);
                        video.remove();
                    }
                }, 3000);

            } catch (error) {
                setIsLoadingThumbnail(false);
            }
        };

        captureFrame();
    }, [src, isLoadingThumbnail]);

    const handlePlayClick = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play();
            setIsPlaying(true);
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
        onError?.(e);
    };

    // Si está reproduciendo, mostrar el video completo
    if (isPlaying) {
        return (
            <div className={`relative ${className}`}>
                <video
                    ref={videoRef}
                    src={src}
                    className="w-full h-full object-cover"
                    controls={showControls}
                    onEnded={handleVideoEnded}
                    onPause={handleVideoPause}
                    onError={handleVideoError}
                    autoPlay
                />
            </div>
        );
    }

    // Mostrar thumbnail real o placeholder glass elegante
    return (
        <div className={`relative ${className} group cursor-pointer overflow-hidden`} onClick={handlePlayClick}>
            {/* Video oculto para preload metadata */}
            <video
                ref={videoRef}
                src={src}
                className="hidden"
                preload="metadata"
                onError={handleVideoError}
                muted
            />

            {/* Fondo: thumbnail capturado o placeholder glass */}
            <div className="w-full h-full relative">
                {isLoadingThumbnail ? (
                    /* Loading skeleton con glassmorphism */
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900">
                        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : thumbnail ? (
                    /* Thumbnail capturado del video */
                    <img
                        src={thumbnail}
                        className="w-full h-full object-cover"
                        alt="Video thumbnail"
                    />
                ) : (
                    /* Placeholder sencillo y eficiente */
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                        <svg className="w-16 h-16 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Overlay con botón play sencillo */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
                    <Play size={24} className="text-gray-800 ml-1" weight="fill" />
                </div>
            </div>

            {/* Badge de video simple */}
            <div className="absolute top-3 left-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                VIDEO
            </div>
        </div>
    );
}