import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoJSOptions {
    src: string;
    poster?: string;
    fluid?: boolean;
    responsive?: boolean;
    preload?: 'auto' | 'metadata' | 'none';
    muted?: boolean;
    playsinline?: boolean;
    controls?: boolean;
    onReady?: (player: any) => void;
    onError?: (error: any) => void;
}

export function useVideoJS(options: VideoJSOptions) {
    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);

    useEffect(() => {
        // Make sure Video.js player is only initialized once
        if (!playerRef.current) {
            // The Video.js player needs to be inside the component el for React 18 Strict Mode.
            const videoElement = document.createElement('video-js');

            videoElement.classList.add('vjs-big-play-centered');
            videoRef.current?.appendChild(videoElement);

            const player = (playerRef.current = videojs(videoElement, {
                ...options,
                sources: [{ src: options.src, type: 'video/mp4' }],
                poster: options.poster,
                fluid: options.fluid ?? true,
                responsive: options.responsive ?? true,
                preload: options.preload ?? 'metadata',
                muted: options.muted ?? true,
                playsinline: options.playsinline ?? true,
                controls: options.controls ?? true,
                techOrder: ['html5'],
                html5: {
                    vhs: {
                        overrideNative: !videojs.browser.IS_SAFARI,
                    },
                    nativeVideoTracks: false,
                    nativeAudioTracks: false,
                    nativeTextTracks: false,
                },
            }));

            player.ready(() => {
                console.log('Video.js player is ready');
                options.onReady?.(player);
            });

            player.on('error', (error: any) => {
                console.error('Video.js error:', error);
                options.onError?.(error);
            });
        }
    }, [options]);

    // Dispose the Video.js player when the functional component unmounts
    useEffect(() => {
        const player = playerRef.current;

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [playerRef]);

    return {
        videoRef,
        player: playerRef.current,
    };
}
