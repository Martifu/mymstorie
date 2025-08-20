import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'phosphor-react';

interface VideoPlayerLegacyProps {
    src: string;
    poster?: string;
    className?: string;
    onError?: (e: any) => void;
    showControls?: boolean;
    autoPlay?: boolean;
    muted?: boolean;
    preload?: 'auto' | 'metadata' | 'none';
}

export function VideoPlayerLegacy({
    src,
    poster,
    className = "",
    onError,
    showControls = true,
    autoPlay = false,
    muted = true,
    preload = 'metadata'
}: VideoPlayerLegacyProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayer, setShowPlayer] = useState(autoPlay);
    const [thumbnail, setThumbnail] = useState<string | null>(poster || null);
    const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(!poster);
    const [duration, setDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Generate thumbnail if not provided
    useEffect(() => {
        if (!poster && src) {
            const captureFrame = async () => {
                try {
                    const video = document.createElement('video');
                    video.src = src;
                    video.muted = true;
                    video.playsInline = true;
                    video.preload = 'metadata';
                    video.crossOrigin = 'anonymous';

                    const onLoadedData = () => {
                        try {
                            video.currentTime = 0.5; // Capture at 0.5 seconds
                        } catch (error) {
                            setIsLoadingThumbnail(false);
                            video.remove();
                        }
                    };

                    const onSeeked = () => {
                        try {
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
                            console.warn('Could not generate thumbnail:', error);
                        }
                        setIsLoadingThumbnail(false);
                        video.remove();
                    };

                    video.addEventListener('loadeddata', onLoadedData);
                    video.addEventListener('seeked', onSeeked);
                    video.addEventListener('error', () => {
                        setIsLoadingThumbnail(false);
                        video.remove();
                    });

                    // Timeout to avoid indefinite waiting
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
        }
    }, [src, poster, isLoadingThumbnail]);

    const handlePlayClick = () => {
        if (!showPlayer) {
            setShowPlayer(true);
            return;
        }

        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch(console.error);
        }
    };

    const handleVideoPlay = () => {
        setIsPlaying(true);
    };

    const handleVideoPause = () => {
        setIsPlaying(false);
    };

    const handleVideoEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const handleVideoError = (e: any) => {
        console.error('Error loading video:', src, e);
        onError?.(e);
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Show full video player
    if (showPlayer) {
        return (
            <div className={`relative ${className} bg-black rounded-lg overflow-hidden`}>
                <video
                    ref={videoRef}
                    src={src}
                    poster={thumbnail || undefined}
                    className="w-full h-full object-cover"
                    controls={showControls}
                    autoPlay={autoPlay}
                    muted={muted}
                    playsInline
                    preload={preload}
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    onEnded={handleVideoEnded}
                    onError={handleVideoError}
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                />

                {/* Custom minimal controls overlay */}
                {!showControls && (
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                        <button
                            onClick={handlePlayClick}
                            className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        >
                            {isPlaying ? (
                                <Pause size={16} className="text-gray-800" weight="fill" />
                            ) : (
                                <Play size={16} className="text-gray-800 ml-0.5" weight="fill" />
                            )}
                        </button>
                        <div className="flex-1 flex items-center gap-2 text-white text-sm">
                            <span>{formatTime(currentTime)}</span>
                            <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-100"
                                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                                />
                            </div>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Show thumbnail with play button
    return (
        <div className={`relative ${className} group cursor-pointer overflow-hidden rounded-lg`} onClick={handlePlayClick}>
            {/* Thumbnail or placeholder */}
            <div className="w-full h-full relative">
                {isLoadingThumbnail ? (
                    /* Loading skeleton */
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800">
                        <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                ) : thumbnail ? (
                    /* Generated or provided thumbnail */
                    <img
                        src={thumbnail}
                        className="w-full h-full object-cover"
                        alt="Video thumbnail"
                    />
                ) : (
                    /* Fallback placeholder */
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800 flex items-center justify-center">
                        <svg className="w-16 h-16 text-white/60 dark:text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Play button overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
                    <Play size={24} className="text-gray-800 ml-1" weight="fill" />
                </div>
            </div>

            {/* Video badge */}
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                VIDEO
            </div>

            {/* Duration badge if available */}
            {duration > 0 && (
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-lg">
                    {formatTime(duration)}
                </div>
            )}
        </div>
    );
}
