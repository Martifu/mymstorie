import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../features/auth/useAuth';
import { ArrowLeft, Calendar } from 'iconsax-react';
import { SimpleImage, EntryOptionsMenu, SpotifyPlayer } from '../../components';

import birthdayIcon from '../../assets/birthday-icon.svg';
import milestoneIcon from '../../assets/milestone-icon.svg';
import memoryIcon from '../../assets/memory-icon.svg';

type Media = { url: string; type: 'image' | 'video' };
type Entry = {
    title: string;
    description?: string;
    date?: any;
    media?: Media[];
    type: 'memory' | 'goal' | 'child_event';
    childCategory?: 'birthday' | 'milestone' | 'memory';
    milestoneType?: string;
};

function getEntryCategory(entry: Entry) {
    if (entry.type === 'memory') return { label: 'Recuerdo', color: 'text-brand-purple', bg: 'bg-brand-purple/10' };
    if (entry.type === 'goal') return { label: 'Objetivo', color: 'text-brand-blue', bg: 'bg-brand-blue/10' };

    // Para child_event, usar childCategory si existe
    const childCat = entry.childCategory;
    if (childCat === 'birthday') return { label: 'Cumpleaños', color: 'text-pink-600', bg: 'bg-pink-50' };
    if (childCat === 'memory') return { label: 'Recuerdo del Hijo', color: 'text-brand-purple', bg: 'bg-brand-purple/10' };

    // Fallback para hitos
    return { label: 'Hito', color: 'text-brand-gold', bg: 'bg-brand-gold/10' };
}

function getCategoryIcon(entry: Entry) {
    if (entry.type === 'memory') return <img src={memoryIcon} alt="Recuerdo" className="w-4 h-4 object-contain" />;
    if (entry.type === 'goal') return <img src={milestoneIcon} alt="Objetivo" className="w-4 h-4 object-contain" />;

    const childCat = entry.childCategory;
    if (childCat === 'birthday') return <img src={birthdayIcon} alt="Cumpleaños" className="w-4 h-4 object-contain" />;
    if (childCat === 'memory') return <img src={memoryIcon} alt="Recuerdo del Hijo" className="w-4 h-4 object-contain" />;

    return <img src={milestoneIcon} alt="Hito" className="w-4 h-4 object-contain" />;
}

// Hook optimizado para cargar una entry específica
function useSpecificEntry(spaceId: string | null, entryId: string | undefined) {
    const [entry, setEntry] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEntry = async () => {
        if (!spaceId || !entryId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const { doc, getDoc } = await import('firebase/firestore');
            const { db } = await import('../../lib/firebase');

            // Primero intentar en memories
            const memoryRef = doc(db, `spaces/${spaceId}/entries/${entryId}`);
            const memorySnap = await getDoc(memoryRef);

            if (memorySnap.exists()) {
                const data = memorySnap.data();
                setEntry({ id: memorySnap.id, ...data });
                return;
            }

            setError('Entry not found');
        } catch (err) {
            console.error('Error fetching entry:', err);
            setError('Error loading entry');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntry();
    }, [spaceId, entryId]);

    // Función para refrescar la entrada
    const refreshEntry = () => {
        fetchEntry();
    };

    return { entry, loading, error, refreshEntry };
}

export default function MemoryDetail() {
    const { spaceId, entryId } = useParams();
    const navigate = useNavigate();
    const { spaceId: authSpaceId } = useAuth();

    // Usar el spaceId de la URL o el del auth como fallback
    const currentSpaceId = spaceId || authSpaceId;

    const { entry, loading, error, refreshEntry } = useSpecificEntry(currentSpaceId, entryId);

    // Skeleton loading optimizado
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="relative">
                    <div className="aspect-[3/4] bg-gray-200 overflow-hidden rounded-2xl m-3 animate-pulse">
                        <div className="absolute top-5 left-6 w-16 h-8 bg-white/80 rounded-full" />
                    </div>
                </div>
                <div className="px-4 pb-2 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="h-8 bg-gray-200 rounded-lg flex-1 animate-pulse" />
                        <div className="w-20 h-6 bg-gray-200 rounded-pill animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !entry) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-6xl mb-4">😕</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No encontrado</h2>
                <p className="text-gray-600 mb-6 text-center">
                    No pudimos encontrar este contenido. Puede que haya sido eliminado.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-xl hover:bg-brand-purple/90 transition"
                >
                    <ArrowLeft size={18} />
                    Volver
                </button>
            </div>
        );
    }
    const cover = entry.media?.[0];
    const category = getEntryCategory(entry);
    const categoryIcon = getCategoryIcon(entry);

    return (
        <div className="min-h-screen bg-gray-50 text-text">
            {/* Header compacto */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200">
                <div className="flex items-center gap-3 px-4 py-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    >
                        <ArrowLeft size={20} color="#3B3923" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-semibold text-gray-900 truncate">{entry.title}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-medium ${category.bg} ${category.color}`}>
                                {categoryIcon}
                                {category.label}
                            </span>
                        </div>
                    </div>

                    {/* Menú de opciones */}
                    <EntryOptionsMenu
                        entryId={entryId!}
                        entryType={entry.type}
                        entryTitle={entry.title}
                        spaceId={currentSpaceId!}
                        media={entry.media}
                        hasSpotify={!!entry.spotify}
                        onDeleted={() => navigate(-1)}
                        onUpdated={refreshEntry}
                    />
                </div>
            </div>

            {/* Imagen principal optimizada */}
            {cover && (
                <div className="relative mx-3 mt-4 mb-6">
                    <div className="aspect-[3/4] bg-gray-100 overflow-hidden rounded-2xl">
                        {cover.type === 'image' ? (
                            <SimpleImage
                                src={cover.url}
                                alt={entry.title}
                                className="h-full w-full object-cover"
                                priority={true}
                                blur={true}
                                fallback={
                                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                        <div className="text-gray-400 text-center">
                                            <div className="text-4xl mb-2">🖼️</div>
                                            <div className="text-sm">Imagen no disponible</div>
                                        </div>
                                    </div>
                                }
                            />
                        ) : cover.type === 'video' ? (
                            <video
                                src={cover.url}
                                controls
                                className="h-full w-full object-cover"
                                preload="metadata"
                                onError={(e) => {
                                    console.error('Error loading video:', cover.url, e);
                                }}
                            />
                        ) : null}
                    </div>
                </div>
            )}
            {/* Contenido principal */}
            <div className="px-4 pb-6">
                {/* Descripción */}
                {entry.description && (
                    <div className="bg-white rounded-2xl p-4 mb-4 border shadow-sm">
                        <p className="text-gray-700 leading-relaxed">{entry.description}</p>
                    </div>
                )}

                {/* Información de Spotify */}
                {entry.spotify && (
                    <div className="bg-white rounded-2xl p-4 mb-4 border shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">Música de fondo</span>
                        </div>

                        <div className="mb-3">
                            <h4 className="font-semibold text-gray-900 mb-1">{entry.spotify.name}</h4>
                            <p className="text-sm text-gray-600">{entry.spotify.artists}</p>
                            {entry.spotify.album_name && (
                                <p className="text-xs text-gray-500 mt-1">De "{entry.spotify.album_name}"</p>
                            )}
                        </div>

                        {/* Reproductor de música */}
                        {entry.spotify.preview_url && (
                            <SpotifyPlayer
                                previewUrl={entry.spotify.preview_url}
                                compact={true}
                            />
                        )}

                        {/* Enlace a Spotify */}
                        {entry.spotify.spotify_url && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <a
                                    href={entry.spotify.spotify_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium"
                                >
                                    <span>Abrir en Spotify</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {/* Fecha */}
                {entry.date && (
                    <div className="bg-white rounded-2xl p-4 mb-4 border shadow-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={18} color="#666" />
                            <span className="text-sm font-medium">
                                {new Date((entry.date as any)?.toDate?.() ?? entry.date).toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                )}

                {/* Imágenes adicionales optimizadas */}
                {entry.media && entry.media.length > 1 && (
                    <div className="bg-white rounded-2xl p-4 border shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">
                            Más contenido ({entry.media.length - 1})
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {entry.media.slice(1).map((m: any, idx: number) => (
                                <div key={idx} className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                                    {m.type === 'image' ? (
                                        <SimpleImage
                                            src={m.url}
                                            alt={`${entry.title} - imagen ${idx + 2}`}
                                            className="h-full w-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                            blur={true}
                                            fallback={
                                                <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                                    <div className="text-gray-400 text-2xl">🖼️</div>
                                                </div>
                                            }
                                        />
                                    ) : (
                                        <video
                                            src={m.url}
                                            controls
                                            className="h-full w-full object-cover"
                                            preload="metadata"
                                            onError={(e) => {
                                                console.error('Error loading video:', m.url, e);
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>


        </div>
    );
}


