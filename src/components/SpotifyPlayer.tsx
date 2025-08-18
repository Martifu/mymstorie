import { useState, useRef, useEffect } from 'react';

interface SpotifyPlayerProps {
    previewUrl: string;
    onEnded?: () => void;
    autoPlay?: boolean;
    showControls?: boolean;
    compact?: boolean;
}

export function SpotifyPlayer({
    previewUrl,
    onEnded,
    autoPlay = false,
    showControls = true,
    compact = false
}: SpotifyPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [volume, setVolume] = useState(0.7);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = volume;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            onEnded?.();
        };
        const handleLoadStart = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);

        if (autoPlay) {
            handlePlay();
        }

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
        };
    }, [previewUrl, volume, onEnded, autoPlay]);

    const handlePlay = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        try {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                await audio.play();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        const progressBar = progressRef.current;
        if (!audio || !progressBar || !duration) return;

        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;

        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <audio ref={audioRef} src={previewUrl} />

                <button
                    onClick={handlePlay}
                    disabled={isLoading}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 flex items-center justify-center transition-colors"
                >
                    {isLoading ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : isPlaying ? (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                    )}
                </button>

                <div className="flex-1 min-w-0">
                    <div
                        ref={progressRef}
                        onClick={handleProgressClick}
                        className="h-2 bg-gray-200 rounded-full cursor-pointer overflow-hidden"
                    >
                        <div
                            className="h-full bg-green-500 rounded-full transition-all duration-150"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                <div className="flex-shrink-0 text-xs text-gray-500 font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>
            </div>
        );
    }

    if (!showControls) {
        return (
            <audio
                ref={audioRef}
                src={previewUrl}
                autoPlay={autoPlay}
                onEnded={onEnded}
            />
        );
    }

    return (
        <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-4 text-white">
            <audio ref={audioRef} src={previewUrl} />

            <div className="flex items-center gap-4">
                {/* Play/Pause Button */}
                <button
                    onClick={handlePlay}
                    disabled={isLoading}
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-105"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : isPlaying ? (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                    )}
                </button>

                {/* Progress Bar and Time */}
                <div className="flex-1 space-y-2">
                    <div
                        ref={progressRef}
                        onClick={handleProgressClick}
                        className="relative h-2 bg-white/20 rounded-full cursor-pointer overflow-hidden backdrop-blur-sm"
                    >
                        <div
                            className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-150 shadow-sm"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    <div className="flex justify-between text-xs font-medium opacity-90">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volume Control */}
                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                        {volume === 0 ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.789L4.683 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.683l3.7-3.789a1 1 0 011-.135zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        ) : volume < 0.5 ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.789L4.683 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.683l3.7-3.789a1 1 0 011-.135zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.789L4.683 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.683l3.7-3.789a1 1 0 011-.135z" clipRule="evenodd" />
                                <path d="M14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                            </svg>
                        )}
                    </button>

                    {showVolumeSlider && (
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2">
                            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-20 h-1 bg-white/20 rounded-lg appearance-none slider"
                                    style={{
                                        background: `linear-gradient(to right, white 0%, white ${volume * 100}%, rgba(255,255,255,0.3) ${volume * 100}%, rgba(255,255,255,0.3) 100%)`
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-2 text-center">
                <p className="text-xs opacity-75">
                    Preview de 30 segundos • Cortesía de Spotify
                </p>
            </div>

            <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
        </div>
    );
}

