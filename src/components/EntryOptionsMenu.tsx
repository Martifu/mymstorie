import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DotsThreeVertical, PencilSimple, Trash } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';

interface EntryOptionsMenuProps {
    entryId: string;
    entryType: 'memory' | 'goal' | 'child_event';
    entryTitle: string;
    spaceId: string;
    media?: Array<{ url: string; type: 'image' | 'video' }>;
    onDeleted?: () => void;
}

export function EntryOptionsMenu({
    entryId,
    entryType,
    entryTitle,
    spaceId,
    media = [],
    onDeleted
}: EntryOptionsMenuProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();



    // Cerrar menú al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        }

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showMenu]);

    // Cleanup al desmontar componente
    useEffect(() => {
        return () => {
            if (showDeleteDialog) {
                setShowDeleteDialog(false);
            }
        };
    }, []);

    // Prevenir scroll del body cuando el dialog está abierto
    useEffect(() => {
        if (showDeleteDialog) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showDeleteDialog]);

    // Cerrar dialog con tecla Escape
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showDeleteDialog && !isDeleting) {
                setShowDeleteDialog(false);
            }
        };

        if (showDeleteDialog) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [showDeleteDialog, isDeleting]);

    const handleEdit = () => {
        setShowMenu(false);
        // Redirigir a página de edición según el tipo
        switch (entryType) {
            case 'memory':
                navigate(`/memories/${entryId}/edit`);
                break;
            case 'goal':
                navigate(`/goals/${entryId}/edit`);
                break;
            case 'child_event':
                navigate(`/child/${entryId}/edit`);
                break;
        }
    };

    const deleteMediaFiles = async (mediaUrls: Array<{ url: string }>) => {
        try {
            const { deleteObject, ref } = await import('firebase/storage');
            const { storage } = await import('../lib/firebase');

            const deletePromises = mediaUrls.map(async (mediaItem) => {
                try {
                    // Extraer el path del archivo de la URL
                    const url = mediaItem.url;
                    if (url.includes('firebasestorage.googleapis.com')) {
                        const pathMatch = url.match(/o\/(.+?)(\?|$)/);
                        if (pathMatch && pathMatch[1]) {
                            const filePath = decodeURIComponent(pathMatch[1]);
                            const fileRef = ref(storage, filePath);
                            await deleteObject(fileRef);
                            console.log(`Deleted file: ${filePath}`);
                        }
                    }
                } catch (error) {
                    console.warn('Could not delete media file:', mediaItem.url, error);
                    // No fallar por un archivo que no se puede eliminar
                }
            });

            await Promise.allSettled(deletePromises);
        } catch (error) {
            console.error('Error deleting media files:', error);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            // 1. Eliminar archivos multimedia de Storage
            if (media && media.length > 0) {
                console.log('Deleting media files...');
                await deleteMediaFiles(media);
            }

            // 2. Eliminar el documento de Firestore
            const { doc, deleteDoc } = await import('firebase/firestore');
            const { db } = await import('../lib/firebase');

            const entryRef = doc(db, `spaces/${spaceId}/entries/${entryId}`);
            await deleteDoc(entryRef);

            console.log(`Entry ${entryId} deleted successfully`);

            // 3. Notificar y navegar
            setShowDeleteDialog(false);
            onDeleted?.();

            // Navegar de vuelta según el tipo
            switch (entryType) {
                case 'memory':
                    navigate('/memories');
                    break;
                case 'goal':
                    navigate('/goals');
                    break;
                case 'child_event':
                    navigate('/child');
                    break;
            }

        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('Error al eliminar. Por favor intenta de nuevo.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            {/* Botón del menú */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="Opciones"
                >
                    <DotsThreeVertical size={20} className="text-gray-700" weight="bold" />
                </button>

                {/* Menú desplegable */}
                {showMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border shadow-lg z-50">
                        <div className="py-2">
                            <button
                                onClick={handleEdit}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                            >
                                <PencilSimple size={18} className="text-blue-500" weight="bold" />
                                <span className="font-medium">Editar</span>
                            </button>

                            <div className="border-t border-gray-100 my-1" />

                            <button
                                onClick={() => {
                                    setShowMenu(false);
                                    // Pequeño delay para que se cierre el menú completamente
                                    setTimeout(() => {
                                        setShowDeleteDialog(true);
                                    }, 100);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors"
                            >
                                <Trash size={18} className="text-red-500" weight="bold" />
                                <span className="font-medium">Eliminar</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Dialog de confirmación usando Portal */}
            {showDeleteDialog && createPortal(
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
                            setShowDeleteDialog(false);
                        }
                    }}
                >
                    <div
                        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl mx-auto"
                        style={{
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Trash size={24} className="text-red-600" weight="bold" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    ¿Eliminar definitivamente?
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Estás a punto de eliminar <span className="font-semibold">"{entryTitle}"</span>.
                                    {media && media.length > 0 && (
                                        <> También se eliminarán <span className="font-semibold">{media.length} archivo(s)</span> multimedia.</>
                                    )}
                                </p>
                                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                    <p className="text-red-700 text-xs font-medium">
                                        ⚠️ Esta acción no se puede deshacer
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteDialog(false)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Eliminando...
                                    </>
                                ) : (
                                    <>
                                        <Trash size={16} weight="bold" />
                                        Eliminar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
