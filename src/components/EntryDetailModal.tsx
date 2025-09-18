import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar } from 'phosphor-react';
import { ArrowLeft } from 'iconsax-react';
import { useAuth } from '../features/auth/useAuth';
import { EntryOptionsMenu } from '../components';

import { ImageViewer } from './ImageViewer';
import { FloatingVinylPlayer } from './FloatingVinylPlayer';
import { ZoomableImage } from './ZoomableImage';
import { EditEntryModal } from './EditEntryModal';

import birthdayIcon from '../assets/birthday-icon.svg';
import milestoneIcon from '../assets/milestone-icon.svg';
import memoryIcon from '../assets/memory-icon.svg';

interface EntryDetailModalProps {
    entryId: string | null;
    spaceId?: string;
    onClose: () => void;
    onDeleted?: () => void;
}

// Componente para video lazy loading en modal con controles centrados
function LazyVideo({ src, className, onError }: { src: string; className?: string; onError?: (e: any) => void }) {
    const [shouldLoad, setShouldLoad] = useState(false);
    const [hasError, setHasError] = useState(false);
    const videoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleError = (e: any) => {
        setHasError(true);
        onError?.(e);
    };

    return (
        <div ref={videoRef} className={className}>
            {!shouldLoad ? (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                        <p className="text-xs">Cargando video...</p>
                    </div>
                </div>
            ) : hasError ? (
                <div className="w-full h-full bg-red-100 flex items-center justify-center">
                    <div className="text-center text-red-500">
                        <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center mb-2">
                            <X size={20} />
                        </div>
                        <p className="text-xs">Error al cargar video</p>
                    </div>
                </div>
            ) : (
                <video
                    src={src}
                    className="w-full h-full object-cover"
                    controls
                    muted
                    preload="metadata"
                    playsInline
                    onError={handleError}
                    onLoadStart={() => console.log('🎬 Cargando video lazy en modal:', src)}
                    onCanPlay={() => console.log('✅ Video lazy listo en modal:', src)}
                />
            )}
        </div>
    );
}

// Hook para obtener entry específica
function useSpecificEntry(spaceId: string | null, entryId: string | null) {
    const [entry, setEntry] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!spaceId || !entryId) {
            setEntry(null);
            setLoading(false);
            return;
        }

        const fetchEntry = async () => {
            try {
                setLoading(true);
                setError(null);

                const { doc, getDoc } = await import('firebase/firestore');
                const { db } = await import('../lib/firebase');

                const entryRef = doc(db, `spaces/${spaceId}/entries/${entryId}`);
                const entrySnap = await getDoc(entryRef);

                if (entrySnap.exists()) {
                    setEntry({ id: entrySnap.id, ...entrySnap.data() });
                } else {
                    setError('Entry no encontrada');
                }
            } catch (err) {
                console.error('Error fetching entry:', err);
                setError('Error al cargar la entry');
            } finally {
                setLoading(false);
            }
        };

        fetchEntry();
    }, [spaceId, entryId]);

    return { entry, loading, error };
}

// Función para obtener categoría de entry
const getEntryCategory = (entry: any) => {
    if (entry?.type === 'memory') {
        return {
            label: 'Recuerdo',
            bg: 'bg-brand-purple/10',
            color: 'text-brand-purple'
        };
    }
    if (entry?.type === 'goal') {
        const goalCategory = entry.goalCategory || 'logro';
        const categoryMap: Record<string, any> = {
            viaje: { label: 'Viaje', bg: 'bg-purple-100', color: 'text-purple-800' },
            logro: { label: 'Logro', bg: 'bg-blue-100', color: 'text-blue-800' },
            experiencia: { label: 'Experiencia', bg: 'bg-green-100', color: 'text-green-800' },
            aprendizaje: { label: 'Aprendizaje', bg: 'bg-yellow-100', color: 'text-yellow-800' }
        };
        return categoryMap[goalCategory] || categoryMap.logro;
    }
    if (entry?.type === 'child_event') {
        const eventType = entry.eventType || 'milestone';
        const categoryMap: Record<string, any> = {
            birth: { label: 'Nacimiento', bg: 'bg-pink-100', color: 'text-pink-800' },
            birthday: { label: 'Cumpleaños', bg: 'bg-yellow-100', color: 'text-yellow-800' },
            milestone: { label: 'Hito', bg: 'bg-brand-gold/20', color: 'text-brand-gold' }
        };
        return categoryMap[eventType] || categoryMap.milestone;
    }
    return { label: 'Entrada', bg: 'bg-gray-100', color: 'text-gray-800' };
};

const getCategoryIcon = (entry: any) => {
    if (entry?.type === 'child_event') {
        const eventType = entry.eventType || 'milestone';
        const iconMap: Record<string, string> = {
            birth: birthdayIcon,
            birthday: birthdayIcon,
            milestone: milestoneIcon
        };
        const iconSrc = iconMap[eventType] || milestoneIcon;
        return <img src={iconSrc} alt={eventType} className="w-3 h-3" />;
    }
    return <img src={memoryIcon} alt="memory" className="w-3 h-3" />;
};

export function EntryDetailModal({ entryId, spaceId: propSpaceId, onClose, onDeleted }: EntryDetailModalProps) {
    const { spaceId: authSpaceId } = useAuth();
    const currentSpaceId = propSpaceId || authSpaceId;
    const { entry, loading, error } = useSpecificEntry(currentSpaceId, entryId);

    // Image viewer state
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [imageViewerIndex] = useState(0);

    // Media navigation state
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    // Auto-hide controls state
    const [showControls, setShowControls] = useState(true);
    const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

    // Touch/Slide gestures state
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

    // Edit modal state
    const [showEditModal, setShowEditModal] = useState(false);

    // Prevenir scroll del body
    useEffect(() => {
        if (entryId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [entryId]);

    // Cerrar con tecla Escape
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (entryId) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [entryId, onClose]);

    // Auto-hide controls after 3 seconds
    const resetHideTimer = () => {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
        }

        setShowControls(true);

        const newTimeout = setTimeout(() => {
            setShowControls(false);
        }, 5000);

        setHideTimeout(newTimeout);
    };

    // Initialize auto-hide timer
    useEffect(() => {
        if (entryId) {
            resetHideTimer();
        }

        return () => {
            if (hideTimeout) {
                clearTimeout(hideTimeout);
            }
        };
    }, [entryId]);

    // Toggle controls visibility
    const toggleControls = () => {
        if (showControls) {
            setShowControls(false);
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                setHideTimeout(null);
            }
        } else {
            resetHideTimer();
        }
    };

    // Handle touch gestures for slide navigation
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        });
    };

    // Funciones de navegación de media
    const goToNextMedia = () => {
        if (entry?.media && entry.media.length > 1) {
            setCurrentMediaIndex((prev) => (prev + 1) % entry.media.length);
            resetHideTimer();
        }
    };

    const goToPrevMedia = () => {
        if (entry?.media && entry.media.length > 1) {
            setCurrentMediaIndex((prev) => (prev - 1 + entry.media.length) % entry.media.length);
            resetHideTimer();
        }
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distanceX = touchStart.x - touchEnd.x;
        const distanceY = touchStart.y - touchEnd.y;
        const minSwipeDistance = 50;

        // Solo procesar swipes horizontales (más horizontales que verticales)
        if (Math.abs(distanceX) > Math.abs(distanceY) && Math.abs(distanceX) > minSwipeDistance) {
            if (distanceX > 0) {
                // Swipe left - siguiente
                goToNextMedia();
            } else {
                // Swipe right - anterior
                goToPrevMedia();
            }
        }

        setTouchStart(null);
        setTouchEnd(null);
    };

    if (!entryId) return null;

    const modalContent = (
        <>
            {/* Agregar estilos CSS para animaciones */}
            <style>
                {`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }
                    
                    @keyframes fadeOut {
                        from {
                            opacity: 1;
                        }
                        to {
                            opacity: 0;
                        }
                    }
                `}
            </style>
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-0 z-[100000]"
            style={{ zIndex: 100000 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="bg-white w-full h-full max-w-md max-h-full flex flex-col shadow-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '448px' }}
            >
                {loading && (
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="text-center">
                            <div className="w-8 h-8 border-2 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Cargando...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X size={24} className="text-red-600" weight="bold" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}

                    {entry && (() => {
                        // Obtener todas las medias disponibles
                        const allMedia = entry.media || [];
                        const hasMedia = allMedia.length > 0;
                        const hasMultipleMedia = allMedia.length > 1;

                        // Media actual basada en el índice
                        const currentMedia = hasMedia ? allMedia[currentMediaIndex] : null;


                        return (
                            <>
                                {/* Netflix-style Layout - Media como fondo con overlay */}
                                <div
                                    className="relative w-full h-full overflow-hidden cursor-pointer"
                                    onClick={toggleControls}
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    {/* Fondo de media (imagen o video) */}
                                    {currentMedia ? (
                                        <div className="absolute inset-0">
                                            {currentMedia.type === 'image' ? (
                                                <ZoomableImage
                                                    src={currentMedia.url}
                                                    alt={entry.title}
                                                    className="w-full h-full"
                                                />
                                            ) : (
                                                <div className="relative w-full h-full">
                                                    <LazyVideo
                                                        src={currentMedia.url}
                                                        className="w-full h-full"
                                                        onError={(e: any) => {
                                                            console.error('❌ Error loading video:', {
                                                                url: currentMedia.url,
                                                                error: e.target?.error,
                                                                networkState: e.target?.networkState,
                                                                readyState: e.target?.readyState,
                                                                userAgent: navigator.userAgent
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        // Fondo de degradado si no hay media
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
                                    )}

                                    {/* Ícono de mostrar controles cuando están ocultos */}
                                    {!showControls && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                resetHideTimer();
                                            }}
                                            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all opacity-0 animate-fade-in"
                                            style={{ animation: 'fadeIn 0.3s ease-in-out forwards' }}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                    )}

                                    {/* Controles de navegación de media - Solo si hay múltiples medias y controles visibles */}
                                    {hasMultipleMedia && showControls && (
                                        <div
                                            className="opacity-0 animate-fade-in"
                                            style={{ animation: 'fadeIn 0.3s ease-in-out forwards' }}
                                        >
                                            {/* Botón anterior */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    goToPrevMedia();
                                                }}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all"
                                            >
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                                </svg>
                                            </button>

                                            {/* Botón siguiente */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    goToNextMedia();
                                                }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all"
                                            >
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}


                                    {/* Header flotante con controles - Siempre visible el botón de atrás */}
                                    <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
                                        <div className="flex items-center justify-between">
                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onClose();
                                                }}
                                                className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all"
                                            >
                                                <ArrowLeft size={20} color="white" />
                            </button>

                                            {showControls && (
                                                <div
                                                    className="flex items-center gap-3 opacity-0 animate-fade-in"
                                                    style={{ animation: 'fadeIn 0.3s ease-in-out forwards' }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30`}>
                                        {getCategoryIcon(entry)}
                                        {getEntryCategory(entry).label}
                                    </span>

                            <EntryOptionsMenu
                                entryId={entryId}
                                entryType={entry.type}
                                entryTitle={entry.title}
                                spaceId={currentSpaceId!}
                                media={entry.media}
                                hasSpotify={!!entry.spotify}
                                onDeleted={() => {
                                    onDeleted?.();
                                    onClose();
                                }}
                                                        onEdit={() => setShowEditModal(true)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contenido principal superpuesto en la parte inferior - Solo visible cuando showControls */}
                                    {showControls && (
                                        <div
                                            className="absolute inset-x-0 bottom-0 z-30 pointer-events-none opacity-0 animate-fade-in"
                                            style={{ animation: 'fadeIn 0.3s ease-in-out forwards' }}
                                        >
                                            {/* Overlay negro específico para el texto */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 via-black/40 to-transparent" />

                                            <div className="relative p-6 pb-20 space-y-4 pointer-events-auto">
                                                {/* Título principal */}
                                                <div>
                                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                                                        {entry.title}
                                                    </h1>
                                                </div>

                                                {/* Fecha */}
                                {entry.date && (
                                                    <div className="flex items-center gap-2 text-white/90">
                                                        <Calendar size={16} className="text-white/70" weight="bold" />
                                                        <p className="text-sm font-medium">
                                                    {entry.date?.toDate ?
                                                        entry.date.toDate().toLocaleDateString('es-ES', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        }) : entry.date}
                                                </p>
                                                    </div>
                                                )}

                                                {/* Descripción */}
                                                {entry.description && (
                                                    <div>
                                                        <p className="text-white/90 leading-relaxed text-sm md:text-base drop-shadow-md max-w-2xl">
                                                            {entry.description}
                                                        </p>
                                                    </div>
                                                )}

                                        </div>
                                    </div>
                                )}
                        </div>

                        {/* Vinyl Player FAB - Fixed en esquina inferior derecha */}
                        {entry.spotify && (
                                    <div className="fixed bottom-6 right-6 z-50">
                                <FloatingVinylPlayer
                                    trackData={{
                                        preview_url: entry.spotify.preview_url,
                                        album_image: entry.spotify.album_image
                                    }}
                                    size="medium"
                                />
                            </div>
                        )}

                                {/* Edit Entry Modal */}
                                <EditEntryModal
                                    entry={entry}
                                    spaceId={currentSpaceId!}
                                    isOpen={showEditModal}
                                    onClose={() => setShowEditModal(false)}
                                    onUpdated={() => {
                                        // Refrescar la entrada después de actualizar
                                        window.location.reload(); // Simple refresh por ahora
                                    }}
                                />

                        {/* Image Viewer Modal */}
                        <ImageViewer
                            images={entry.media?.filter((m: any) => m.type === 'image') || []}
                            initialIndex={imageViewerIndex}
                            isOpen={showImageViewer}
                            onClose={() => setShowImageViewer(false)}
                            title={entry.title}
                        />
                    </>
                        );
                    })()}
                </div>
            </div>
        </>
    );

    return createPortal(modalContent, document.body);
}
