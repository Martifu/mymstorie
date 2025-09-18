import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Calendar, X } from 'phosphor-react';
import { FileUpload } from './FileUpload';
import { SpotifySearch } from './SpotifySearch';
import { LoadingSpinner } from './LoadingSpinner';
import { updateEntry } from '../features/entries/entriesService';

type Media = {
    url: string;
    type: 'image' | 'video';
    width?: number;
    height?: number;
};

type Entry = {
    id: string;
    type: 'memory' | 'goal' | 'child_event';
    title: string;
    description?: string;
    date: Date | any;
    media?: Media[];
    spotify?: {
        id: string;
        name: string;
        artists: string;
        preview_url: string | null;
        spotify_url: string;
        album_name: string;
        album_image: string | null;
        duration_ms: number;
    };
};

interface EditEntryModalProps {
    entry: Entry;
    spaceId: string;
    isOpen: boolean;
    onClose: () => void;
    onSave?: (updatedEntry: Entry) => Promise<void>;
    onUpdated?: () => void;
}

// Helper function para convertir fecha de manera segura
const convertToDateString = (date: any): string => {
    try {
        let dateObj: Date;

        if (date instanceof Date) {
            dateObj = date;
        } else if (date && typeof date.toDate === 'function') {
            // Firebase Timestamp
            dateObj = date.toDate();
        } else if (date && typeof date === 'object' && date.seconds) {
            // Firebase Timestamp object
            dateObj = new Date(date.seconds * 1000);
        } else if (date) {
            // String or number
            dateObj = new Date(date);
        } else {
            // Default to today
            dateObj = new Date();
        }

        // Verificar si la fecha es válida
        if (isNaN(dateObj.getTime())) {
            dateObj = new Date();
        }

        return dateObj.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error converting date:', error, date);
        return new Date().toISOString().split('T')[0];
    }
};

export function EditEntryModal({ entry, spaceId, isOpen, onClose, onSave, onUpdated }: EditEntryModalProps) {
    const [formData, setFormData] = useState({
        title: entry.title,
        description: entry.description || '',
        date: convertToDateString(entry.date)
    });
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [existingMedia, setExistingMedia] = useState<Media[]>(entry.media || []);
    const [spotifyTrack, setSpotifyTrack] = useState(entry.spotify || null);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSpotifySearch, setShowSpotifySearch] = useState(false);

    // Resetear formulario cuando cambia la entrada
    useEffect(() => {
        if (entry) {
            setFormData({
                title: entry.title,
                description: entry.description || '',
                date: convertToDateString(entry.date)
            });
            setExistingMedia(entry.media || []);
            setSpotifyTrack(entry.spotify || null);
            setMediaFiles([]);
            setUploadProgress({});
        }
    }, [entry]);

    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Cerrar con tecla Escape
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleRemoveExistingMedia = (index: number) => {
        setExistingMedia(prev => prev.filter((_, i) => i !== index));
    };

    const handleSpotifyTrackSelect = (track: any) => {
        // El track puede venir como SpotifyTrack (con artists array) o como EntrySpotifyData (con artists string)
        let artistsString: string;
        if (Array.isArray(track.artists)) {
            // Es SpotifyTrack
            artistsString = track.artists.map((a: any) => a.name).join(', ');
        } else {
            // Es EntrySpotifyData
            artistsString = track.artists;
        }

        setSpotifyTrack({
            id: track.id,
            name: track.name,
            artists: artistsString,
            preview_url: track.preview_url,
            spotify_url: track.external_urls?.spotify || track.spotify_url,
            album_name: track.album?.name || track.album_name,
            album_image: track.album?.images?.[0]?.url || track.album_image || null,
            duration_ms: track.duration_ms
        });
        setShowSpotifySearch(false);
    };

    const handleRemoveSpotify = () => {
        setSpotifyTrack(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Convertir media existente al formato correcto
            const mediaForFirebase = existingMedia.map(media => ({
                id: crypto.randomUUID(), // Generar ID si no existe
                url: media.url,
                type: media.type,
                width: media.width,
                height: media.height,
                storagePath: '' // No tenemos el storagePath de archivos existentes
            }));

            // Datos para actualizar
            const updateData = {
                title: formData.title.trim(),
                description: formData.description.trim() || undefined,
                date: new Date(formData.date),
                media: mediaForFirebase,
                spotify: spotifyTrack || null
            };

            // Actualizar en Firebase
            await updateEntry(
                spaceId,
                entry.id,
                updateData,
                mediaFiles, // Nuevos archivos para subir
                (fileName, progress) => {
                    setUploadProgress(prev => ({
                        ...prev,
                        [fileName]: progress
                    }));
                }
            );

            // Si se proporciona onSave personalizado, ejecutarlo también
            if (onSave) {
                const updatedEntry: Entry = {
                    ...entry,
                    ...updateData,
                    media: existingMedia, // Usar el formato original para onSave
                    spotify: spotifyTrack || undefined // Convertir null a undefined
                };
                await onSave(updatedEntry);
            }

            // Notificar que se actualizó
            onUpdated?.();
            onClose();
        } catch (error) {
            console.error('Error updating entry:', error);
            alert('Error al actualizar la entrada. Por favor intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
            setUploadProgress({});
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100001]"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="bg-white w-full max-w-md max-h-[90vh] flex flex-col shadow-xl rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={isSubmitting}
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">Editar entrada</h2>
                    <button
                        type="submit"
                        form="edit-entry-form"
                        disabled={isSubmitting || !formData.title.trim()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <form id="edit-entry-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Título */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Título *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Título de la entrada"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Descripción</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                placeholder="Describe tu recuerdo..."
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Fecha */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Fecha</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    disabled={isSubmitting}
                                />
                                <Calendar size={20} className="absolute left-3 top-2.5 text-gray-400" />
                            </div>
                        </div>

                        {/* Media existente */}
                        {existingMedia.length > 0 && (
                            <div>
                                <label className="block text-sm font-semibold mb-2">Multimedia actual</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {existingMedia.map((media, index) => (
                                        <div key={index} className="relative group">
                                            {media.type === 'image' ? (
                                                <img
                                                    src={media.url}
                                                    alt={`Media ${index + 1}`}
                                                    className="w-full aspect-square object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingMedia(index)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                disabled={isSubmitting}
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Agregar nueva multimedia */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Agregar multimedia</label>
                            <FileUpload
                                files={mediaFiles}
                                onChange={setMediaFiles}
                                uploadProgress={uploadProgress}
                                isUploading={isSubmitting}
                                maxFiles={10 - existingMedia.length}
                            />
                        </div>

                        {/* Música de Spotify */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Música de Spotify</label>
                            {spotifyTrack ? (
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                    {spotifyTrack.album_image && (
                                        <img
                                            src={spotifyTrack.album_image}
                                            alt={spotifyTrack.album_name}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-green-800 font-medium text-sm truncate">
                                            {spotifyTrack.name}
                                        </p>
                                        <p className="text-green-600 text-xs truncate">
                                            {spotifyTrack.artists}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveSpotify}
                                        className="p-1 hover:bg-green-100 rounded-full transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        <X size={16} className="text-green-600" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowSpotifySearch(true)}
                                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    <div className="text-center">
                                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 14.5c-.2.3-.5.4-.8.4-.2 0-.4-.1-.5-.2-1.9-1.2-4.3-1.4-7.1-.8-.4.1-.8-.2-.9-.6s.2-.8.6-.9c3.1-.7 5.9-.4 8.1.9.3.2.4.7.2 1zm1.1-2.7c-.2.4-.6.5-1 .3-2.2-1.4-5.6-1.8-8.2-1-.4.1-.8-.2-.9-.6s.2-.8.6-.9c3-.9 6.8-.5 9.4 1.1.4.2.5.7.3 1.1zm.1-2.8c-2.7-1.6-7.1-1.7-9.7-.9-.4.1-.9-.2-1-.6s.2-.9.6-1c3-.9 7.9-.7 11 1.1.4.2.6.8.4 1.2-.2.4-.8.5-1.2.3z" />
                                        </svg>
                                        <p className="text-sm text-gray-600">Buscar música en Spotify</p>
                                    </div>
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Loading overlay */}
                {isSubmitting && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <LoadingSpinner />
                    </div>
                )}
            </div>

            {/* Spotify Search Modal */}
            {showSpotifySearch && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100002]">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">Buscar música</h3>
                            <button
                                onClick={() => setShowSpotifySearch(false)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4">
                            <SpotifySearch onTrackSelect={handleSpotifyTrackSelect} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return createPortal(modalContent, document.body);
}
