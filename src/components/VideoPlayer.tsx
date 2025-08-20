import { useState, useEffect } from 'react';
import { Play } from 'phosphor-react';
import { useVideoJS } from '../hooks/useVideoJS';
import './VideoPlayer.css';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    className?: string;
    onError?: (error: any) => void;
    showControls?: boolean;
    autoPlay?: boolean;
    muted?: boolean;
    preload?: 'auto' | 'metadata' | 'none';
}

export function VideoPlayer({
    src,
    poster,
    className = '',
    onError,
    showControls = true,
    autoPlay = false,
    muted = true,
    preload = 'metadata',
}: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayer, setShowPlayer] = useState(autoPlay);
    const [thumbnail, setThumbnail] = useState<string | null>(poster || null);
    const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(!poster);

    // Generate thumbnail if not provided
    useEffect(() => {
        if (!poster && src) {
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
                            video.currentTime = 0.5; // Capture at 0.5 seconds

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

                    video.addEventListener('loadeddata', captureFrame);
                    video.addEventListener('seeked', captureFrame);
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

            generateThumbnail();
        }
    }, [src, poster, isLoadingThumbnail]);

    const { videoRef, player } = useVideoJS({
        src,
        poster: thumbnail || undefined,
        controls: showControls,
        muted,
        preload,
        onReady: (player) => {
            console.log('Video player is ready');

            // Set up event listeners
            player.on('play', () => setIsPlaying(true));
            player.on('pause', () => setIsPlaying(false));
            player.on('ended', () => setIsPlaying(false));

            // Auto play if requested
            if (autoPlay) {
                player.play().catch((error: any) => {
                    console.warn('Autoplay failed:', error);
                });
            }
        },
        onError: (error) => {
            console.error('Video player error:', error);
            onError?.(error);
        },
    });

    const handlePlayClick = () => {
        if (!showPlayer) {
            setShowPlayer(true);
            // Player will auto-start due to the onReady callback
        } else if (player) {
            if (isPlaying) {
                player.pause();
            } else {
                player.play().catch((error: any) => {
                    console.warn('Play failed:', error);
                });
            }
        }
    };

    // Show video player if already playing or auto-play is enabled
    if (showPlayer) {
        return (
            <div className={`relative ${className}`}>
                <div
                    ref={videoRef}
                    className="w-full h-full video-js-responsive-container"
                    style={{
                        minHeight: '200px',
                        aspectRatio: '16/9'
                    }}
                />
            </div>
        );
    }

    // Show thumbnail with play button
    return (
        <div className={`relative ${className} group cursor-pointer overflow-hidden`} onClick={handlePlayClick}>
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
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
        </div>
    );
}
