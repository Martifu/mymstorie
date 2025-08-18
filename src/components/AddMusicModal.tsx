import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MusicNote } from 'phosphor-react';
import { SpotifySearch } from './SpotifySearch';
import { addSpotifyToEntry } from '../features/entries/entriesService';
import type { EntrySpotifyData } from '../features/spotify/spotifyService';

interface AddMusicModalProps {
    isOpen: boolean;
    onClose: () => void;
    entryId: string;
    entryTitle: string;
    spaceId: string;
    onMusicAdded?: () => void;
}

export function AddMusicModal({
    isOpen,
    onClose,
    entryId,
    entryTitle,
    spaceId,
    onMusicAdded
}: AddMusicModalProps) {
    const [selectedTrack, setSelectedTrack] = useState<EntrySpotifyData | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    if (!isOpen) return null;

    const handleAddMusic = async () => {
        if (!selectedTrack) return;

        setIsAdding(true);
        try {
            await addSpotifyToEntry(spaceId, entryId, selectedTrack);
            onMusicAdded?.();
            onClose();
            // Opcional: mostrar notificación de éxito
            console.log('Música agregada exitosamente');
        } catch (error) {
            console.error('Error al agregar música:', error);
            alert('Error al agregar la música. Intenta de nuevo.');
        } finally {
            setIsAdding(false);
        }
    };

    const handleClose = () => {
        if (!isAdding) {
            setSelectedTrack(null);
            onClose();
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            style={{
                zIndex: 999999,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <MusicNote size={20} className="text-green-600" weight="fill" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                Agregar música
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                                A "{entryTitle}"
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isAdding}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <SpotifySearch
                        onTrackSelect={setSelectedTrack}
                        selectedTrack={selectedTrack}
                    />

                    {/* Preview de la canción seleccionada */}
                    {selectedTrack && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                    <MusicNote size={20} className="text-white" weight="fill" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-green-900 truncate">
                                        {selectedTrack.name}
                                    </h4>
                                    <p className="text-sm text-green-700 truncate">
                                        {selectedTrack.artists}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={handleClose}
                        disabled={isAdding}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleAddMusic}
                        disabled={!selectedTrack || isAdding}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isAdding ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Agregando...
                            </>
                        ) : (
                            <>
                                <MusicNote size={16} weight="fill" />
                                Agregar música
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
