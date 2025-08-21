interface BasicVideoPlayerProps {
    src: string;
    className?: string;
    onError?: (e: any) => void;
    autoPlay?: boolean;
    muted?: boolean;
}

export function BasicVideoPlayer({
    src,
    className = "",
    onError,
    autoPlay = false,
    muted = true,
}: BasicVideoPlayerProps) {

    const handleVideoError = (e: any) => {
        console.error('Video error:', {
            src,
            error: e.target?.error,
            networkState: e.target?.networkState,
            readyState: e.target?.readyState
        });
        onError?.(e);
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl ${className}`}>
            <video
                src={src}
                className="w-full h-full object-cover"
                controls={true}
                muted={muted}
                autoPlay={autoPlay}
                playsInline
                preload="metadata"
                onError={handleVideoError}
                onLoadStart={() => console.log('🎬 Cargando video:', src)}
                onCanPlay={() => console.log('✅ Video listo para reproducir:', src)}
                onLoadedData={() => console.log('📦 Datos del video cargados:', src)}
            />
        </div>
    );
}