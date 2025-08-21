import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar } from 'phosphor-react';
import { ArrowLeft } from 'iconsax-react';
import { useAuth } from '../features/auth/useAuth';
import { EntryOptionsMenu } from '../components';

import { ImageViewer } from './ImageViewer';
import { FloatingVinylPlayer } from './FloatingVinylPlayer';

import birthdayIcon from '../assets/birthday-icon.svg';
import milestoneIcon from '../assets/milestone-icon.svg';
import memoryIcon from '../assets/memory-icon.svg';

interface EntryDetailModalProps {
    entryId: string | null;
    spaceId?: string;
    onClose: () => void;
    onDeleted?: () => void;
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
    const [imageViewerIndex, setImageViewerIndex] = useState(0);

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

    if (!entryId) return null;

    const modalContent = (
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

                {entry && (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                            >
                                <ArrowLeft size={20} color="#3B3923" />
                            </button>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-medium ${getEntryCategory(entry).bg} ${getEntryCategory(entry).color}`}>
                                        {getCategoryIcon(entry)}
                                        {getEntryCategory(entry).label}
                                    </span>
                                </div>
                            </div>

                            {/* Menú de opciones */}
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
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="px-4 py-6 space-y-6">
                                {/* Title */}
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{entry.title}</h1>
                                </div>

                                {/* Description/Comments */}
                                {entry.description && (
                                    <div className="bg-white rounded-2xl p-4 border shadow-sm">
                                        <h3 className="text-lg font-semibold mb-3 text-gray-900">Descripción</h3>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {entry.description}
                                        </p>
                                    </div>
                                )}

                                {/* Media Grid - Two columns for images and videos */}
                                {entry.media && entry.media.length > 0 && (
                                    <div className="bg-white rounded-2xl p-4 border shadow-sm">
                                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Media</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {entry.media.map((item: any, index: number) => (
                                                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                                    {item.type === 'image' ? (
                                                        <img
                                                            src={item.url}
                                                            alt={`${entry.title} - imagen ${index + 1}`}
                                                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                                                            onClick={() => {
                                                                // Open image viewer with all images
                                                                const images = entry.media.filter((m: any) => m.type === 'image');
                                                                const imageIndex = images.findIndex((img: any) => img.url === item.url);
                                                                setImageViewerIndex(imageIndex);
                                                                setShowImageViewer(true);
                                                            }}
                                                        />
                                                    ) : (
                                                        <video
                                                            src={item.url}
                                                            className="w-full h-full object-cover"
                                                            controls
                                                            muted
                                                            preload="metadata"
                                                            playsInline
                                                            onError={(e: any) => {
                                                                console.error('❌ Error loading video:', {
                                                                    url: item.url,
                                                                    index,
                                                                    error: e.target?.error,
                                                                    networkState: e.target?.networkState,
                                                                    readyState: e.target?.readyState,
                                                                    userAgent: navigator.userAgent
                                                                });
                                                            }}
                                                            onLoadStart={() => console.log('🎬 Cargando video:', item.url)}
                                                            onCanPlay={() => console.log('✅ Video listo:', item.url)}
                                                            onLoadedData={() => console.log('📦 Video cargado:', item.url)}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Date */}
                                {entry.date && (
                                    <div className="bg-white rounded-2xl p-4 border shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <Calendar size={20} className="text-gray-500" weight="bold" />
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Fecha</h3>
                                                <p className="text-gray-600">
                                                    {entry.date?.toDate ?
                                                        entry.date.toDate().toLocaleDateString('es-ES', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        }) : entry.date}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vinyl Player FAB - Fixed en esquina inferior derecha */}
                        {entry.spotify && (
                            <div className="fixed bottom-4 right-4 z-50">
                                <FloatingVinylPlayer
                                    trackData={{
                                        preview_url: entry.spotify.preview_url,
                                        album_image: entry.spotify.album_image
                                    }}
                                    size="medium"
                                />
                            </div>
                        )}

                        {/* Image Viewer Modal */}
                        <ImageViewer
                            images={entry.media?.filter((m: any) => m.type === 'image') || []}
                            initialIndex={imageViewerIndex}
                            isOpen={showImageViewer}
                            onClose={() => setShowImageViewer(false)}
                            title={entry.title}
                        />
                    </>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
