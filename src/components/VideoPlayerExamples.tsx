import { VideoPlayer } from './VideoPlayer';
import { VideoPlayerLegacy } from './VideoPlayerLegacy';

interface VideoPlayerExampleProps {
    videoUrl: string;
    posterUrl?: string;
}

export function VideoPlayerExample({ videoUrl, posterUrl }: VideoPlayerExampleProps) {
    return (
        <div className="space-y-8 p-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Video.js Player (Avanzado)</h3>
                <div className="max-w-2xl">
                    <VideoPlayer
                        src={videoUrl}
                        poster={posterUrl}
                        className="aspect-video"
                        showControls={true}
                        preload="metadata"
                        muted={true}
                        onError={(error) => console.error('Video.js error:', error)}
                    />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                    Utiliza Video.js para mejor rendimiento, streaming adaptativo y controles avanzados.
                    Ideal para videos largos o cuando necesitas funcionalidades adicionales.
                </p>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Legacy Player (Ligero)</h3>
                <div className="max-w-2xl">
                    <VideoPlayerLegacy
                        src={videoUrl}
                        poster={posterUrl}
                        className="aspect-video"
                        showControls={true}
                        preload="metadata"
                        muted={true}
                        onError={(error) => console.error('Legacy player error:', error)}
                    />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                    Reproductor nativo HTML5 mejorado con controles personalizados.
                    Más ligero y rápido para videos cortos o cuando el tamaño del bundle es importante.
                </p>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Autoplay con Video.js</h3>
                <div className="max-w-2xl">
                    <VideoPlayer
                        src={videoUrl}
                        poster={posterUrl}
                        className="aspect-video"
                        showControls={true}
                        autoPlay={true}
                        muted={true}
                        preload="auto"
                    />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                    Ejemplo con autoplay habilitado (requiere que esté muted).
                </p>
            </div>
        </div>
    );
}

// Ejemplo de uso en diferentes contextos
export function VideoInFeed({ videoUrl, posterUrl }: VideoPlayerExampleProps) {
    return (
        <div className="rounded-xl overflow-hidden shadow-lg">
            <VideoPlayer
                src={videoUrl}
                poster={posterUrl}
                className="aspect-video"
                showControls={true}
                preload="metadata"
                muted={true}
            />
        </div>
    );
}

export function VideoInModal({ videoUrl, posterUrl }: VideoPlayerExampleProps) {
    return (
        <div className="w-full max-w-4xl mx-auto">
            <VideoPlayer
                src={videoUrl}
                poster={posterUrl}
                className="aspect-video"
                showControls={true}
                autoPlay={true}
                muted={false}
                preload="auto"
            />
        </div>
    );
}

export function VideoThumbnailGrid({ videos }: { videos: { url: string; poster?: string; title: string }[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video, index) => (
                <div key={index} className="space-y-2">
                    <VideoPlayerLegacy
                        src={video.url}
                        poster={video.poster}
                        className="aspect-video"
                        showControls={false}
                        preload="metadata"
                        muted={true}
                    />
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {video.title}
                    </h4>
                </div>
            ))}
        </div>
    );
}
