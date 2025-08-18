import { useState, useEffect } from 'react';
import { spotifyService, type SpotifyTrack, type EntrySpotifyData } from '../features/spotify/spotifyService';
import { SpotifyPlayer } from '../components/SpotifyPlayer';

interface SpotifySearchProps {
    onTrackSelect: (track: EntrySpotifyData) => void;
    selectedTrack?: EntrySpotifyData | null;
}

export function SpotifySearch({ onTrackSelect, selectedTrack }: SpotifySearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SpotifyTrack[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showMoodSuggestions, setShowMoodSuggestions] = useState(true);

    const moodSuggestions = [
        { mood: 'happy', label: '😄 Alegre', emoji: '😄' },
        { mood: 'calm', label: '😌 Tranquilo', emoji: '😌' },
        { mood: 'nostalgic', label: '🥺 Nostálgico', emoji: '🥺' },
        { mood: 'romantic', label: '💕 Romántico', emoji: '💕' },
        { mood: 'family', label: '👨‍👩‍👧‍👦 Familiar', emoji: '👨‍👩‍👧‍👦' },
        { mood: 'celebration', label: '🎉 Celebración', emoji: '🎉' },
    ];

    const searchTracks = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setShowMoodSuggestions(true);
            return;
        }

        setLoading(true);
        setError(null);
        setShowMoodSuggestions(false);

        try {
            const tracks = await spotifyService.searchTracks(searchQuery, 15);
            setResults(tracks);

            if (tracks.length === 0) {
                setError('No se encontraron canciones. Intenta con otras palabras o términos más específicos.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al buscar canciones');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMoodSelect = async (mood: string) => {
        setLoading(true);
        setError(null);
        setShowMoodSuggestions(false);
        setQuery('');

        try {
            const tracks = await spotifyService.getTracksByMood(mood, 12);
            setResults(tracks);

            if (tracks.length === 0) {
                setError('No se encontraron canciones para este ambiente. Intenta con búsqueda manual.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al buscar canciones');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };



    const handleClearSelection = () => {
        onTrackSelect(null as any);
    };

    // Debounce search
    useEffect(() => {
        if (!query) return;

        const timeoutId = setTimeout(() => {
            searchTracks(query);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [query]);

    if (selectedTrack) {
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Música seleccionada</h3>
                    <button
                        onClick={handleClearSelection}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                        Cambiar
                    </button>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                        {selectedTrack.album_image && (
                            <img
                                src={selectedTrack.album_image}
                                alt={selectedTrack.album_name}
                                className="w-12 h-12 rounded-lg object-cover"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{selectedTrack.name}</p>
                            <p className="text-gray-600 text-xs truncate">{selectedTrack.artists}</p>
                            <p className="text-gray-500 text-xs truncate">{selectedTrack.album_name}</p>
                        </div>
                    </div>

                    {selectedTrack.preview_url && (
                        <div className="mt-3">
                            <SpotifyPlayer previewUrl={selectedTrack.preview_url} />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold mb-2">Buscar música de fondo</label>

                {/* Search Input */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar canciones en Spotify..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Info message and Mood Suggestions */}
            {showMoodSuggestions && !query && (
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L9.53 8.611a.75.75 0 00-1.06 1.06l3.5 3.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium text-green-800">Solo canciones reproducibles</span>
                        </div>
                        <p className="text-xs text-green-700">
                            Los previews se cargan bajo demanda cuando haces clic en reproducir o seleccionar una canción.
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-600 mb-3">O elige un ambiente:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {moodSuggestions.map(({ mood, label, emoji }) => (
                                <button
                                    key={mood}
                                    onClick={() => handleMoodSelect(mood)}
                                    className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left text-sm transition-colors"
                                >
                                    <span className="text-lg">{emoji}</span>
                                    <span className="text-gray-700">{label.split(' ')[1]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-3"></div>
                    <p className="text-sm text-gray-600 mb-1">Buscando canciones...</p>
                    <p className="text-xs text-gray-500 text-center max-w-sm">
                        Buscando en Spotify API oficial - previews disponibles bajo demanda
                    </p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Results */}
            {results.length > 0 && !loading && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">{results.length} canciones con preview</p>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-500">Reproducibles</span>
                        </div>
                    </div>
                    {results.map((track) => (
                        <TrackItem
                            key={track.id}
                            track={track}
                            onSelect={(trackWithPreview) => {
                                const finalTrack = trackWithPreview || track;
                                const formattedTrack = spotifyService.formatTrackForStorage(finalTrack);
                                onTrackSelect(formattedTrack);
                                console.log('Selected track:', finalTrack);
                            }}
                        />
                    ))}
                </div>
            )}

            {/* No results */}
            {results.length === 0 && !loading && !showMoodSuggestions && query && !error && (
                <div className="text-center py-8">
                    <div className="mb-3">
                        <svg className="w-12 h-12 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-sm mb-2">No se encontraron canciones</p>
                    <p className="text-gray-400 text-xs">Intenta con otros términos de búsqueda</p>
                </div>
            )}
        </div>
    );
}

function TrackItem({ track, onSelect }: { track: SpotifyTrack; onSelect: (trackWithPreview?: SpotifyTrack) => void }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(track.preview_url);
    const [isSelecting, setIsSelecting] = useState(false);

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handlePlayPreview = async () => {
        if (isPlaying) {
            setIsPlaying(false);
            return;
        }

        if (currentPreviewUrl) {
            setIsPlaying(true);
            return;
        }

        // No tiene preview, intentar obtenerlo de la API personalizada
        setIsLoadingPreview(true);
        try {
            const previewUrl = await spotifyService.getPreviewForTrack(track);
            if (previewUrl) {
                setCurrentPreviewUrl(previewUrl);
                setIsPlaying(true);
            } else {
                alert('No se pudo obtener preview para esta canción');
            }
        } catch (error) {
            console.error('Error obteniendo preview:', error);
            alert('Error al cargar preview');
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleSelect = async () => {
        setIsSelecting(true);
        try {
            // Obtener preview antes de seleccionar (para guardarlo)
            let previewUrl = currentPreviewUrl;

            if (!previewUrl) {
                previewUrl = await spotifyService.getPreviewForTrack(track);
            }

            if (previewUrl) {
                // Crear una copia del track con el preview_url actualizado
                const trackWithPreview = {
                    ...track,
                    preview_url: previewUrl
                };
                onSelect(trackWithPreview);
            } else {
                // Seleccionar sin preview 
                onSelect(track);
            }
        } catch (error) {
            console.error('Error preparando canción:', error);
            // En caso de error, seleccionar de todos modos
            onSelect(track);
        } finally {
            setIsSelecting(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
                {/* Album Cover */}
                <div className="flex-shrink-0">
                    {track.album.images[0] ? (
                        <img
                            src={track.album.images[0].url}
                            alt={track.album.name}
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{track.name}</p>
                    <p className="text-gray-600 text-xs truncate">
                        {track.artists.map(a => a.name).join(', ')}
                    </p>
                    <p className="text-gray-500 text-xs truncate">{track.album.name}</p>
                </div>

                {/* Duration and Actions */}
                <div className="flex-shrink-0 flex items-center gap-2">
                    <div className="text-center">
                        <span className="text-xs text-gray-500 block">
                            {formatDuration(track.duration_ms)}
                        </span>
                        {track.preview_url ? (
                            <span className="text-xs text-green-600 font-medium">
                                30s preview
                            </span>
                        ) : (
                            <span className="text-xs text-orange-600 font-medium">
                                Preview bajo demanda
                            </span>
                        )}
                    </div>

                    {/* Preview Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPreview();
                        }}
                        disabled={isLoadingPreview}
                        className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors disabled:opacity-50"
                        title={isPlaying ? 'Pausar preview' : 'Reproducir preview'}
                    >
                        {isLoadingPreview ? (
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        ) : isPlaying ? (
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>

                    {/* Select Button */}
                    <button
                        onClick={handleSelect}
                        disabled={isSelecting}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                        {isSelecting ? (
                            <>
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                Preparando...
                            </>
                        ) : (
                            'Seleccionar'
                        )}
                    </button>
                </div>
            </div>

            {/* Preview Player */}
            {currentPreviewUrl && isPlaying && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <SpotifyPlayer
                        previewUrl={currentPreviewUrl}
                        onEnded={() => setIsPlaying(false)}
                    />
                </div>
            )}
        </div>
    );
}
