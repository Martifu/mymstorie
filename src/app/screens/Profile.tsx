import { useAuth } from '../../features/auth/useAuth';
import { useEntries } from '../../features/entries/useEntries';
import { useSpaces } from '../../features/spaces/useSpaces';
import { useMemo, useRef, useState } from 'react';
import { Camera, Target, Baby, CheckCircle, Clock, PencilSimple, Plus, Copy, Share, X } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SimpleImage } from '../../components';

export function Profile() {
    const { user, signOutApp, spaceId } = useAuth();
    const { userProfile, currentSpace, spaceCode, uploadPhoto, updateSpaceName } = useSpaces();
    const { entries: memories } = useEntries(spaceId, 'memory');
    const { entries: goals } = useEntries(spaceId, 'goal');
    const { entries: childEvents } = useEntries(spaceId, 'child_event');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [showEditSpaceName, setShowEditSpaceName] = useState(false);
    const [newSpaceName, setNewSpaceName] = useState('');
    const [isUpdatingSpaceName, setIsUpdatingSpaceName] = useState(false);

    // Calcular estadísticas
    const stats = useMemo(() => {
        const completedGoals = goals.filter((g: any) => g.status === 'completed').length;
        const pendingGoals = goals.length - completedGoals;

        // Buscar evento de nacimiento para obtener nombre del hijo
        const birthEvent = childEvents.find((event: any) => event.childCategory === 'birth');
        const childName = (birthEvent as any)?.childName || 'Tu bebé';

        return {
            totalMemories: memories.length,
            completedGoals,
            pendingGoals,
            totalChildEvents: childEvents.length,
            childName
        };
    }, [memories, goals, childEvents]);

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona una imagen válida');
            return;
        }

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen es muy grande. Máximo 5MB');
            return;
        }

        setIsUploadingPhoto(true);
        try {
            await uploadPhoto(file);
            // La foto se actualiza automáticamente via useSpaces
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Error al subir la foto. Inténtalo de nuevo.');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const currentPhotoURL = userProfile?.photoURL || user?.photoURL;

    // Obtener el rol del usuario en el espacio actual
    const userRole = useMemo(() => {
        if (!currentSpace || !user?.uid) return null;
        const member = currentSpace.members[user.uid];
        return member?.role || null;
    }, [currentSpace, user?.uid]);

    // Copiar código al portapapeles
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Código copiado al portapapeles');
        } catch (err) {
            console.error('Error copying to clipboard:', err);
        }
    };

    // Compartir por WhatsApp
    const shareToWhatsApp = (code: string, spaceName: string) => {
        const message = `¡Te invito a unirte a nuestro espacio familiar "${spaceName}" en mymstorie! 👨‍👩‍👧‍👦\n\nCódigo: ${code}\n\nÚnete aquí: https://mymstorie.vercel.app/\n\nIngresa el código cuando te registres para acceder a nuestro espacio familiar.`;
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // Verificar si el usuario es el owner del espacio
    const isSpaceOwner = useMemo(() => {
        return currentSpace && user && currentSpace.createdBy === user.uid;
    }, [currentSpace, user]);

    // Abrir modal para editar nombre del espacio
    const handleEditSpaceName = () => {
        if (currentSpace) {
            setNewSpaceName(currentSpace.name);
            setShowEditSpaceName(true);
        }
    };

    // Actualizar nombre del espacio
    const handleUpdateSpaceName = async () => {
        if (!currentSpace || !newSpaceName.trim()) return;

        setIsUpdatingSpaceName(true);
        try {
            await updateSpaceName(currentSpace.id, newSpaceName.trim());
            setShowEditSpaceName(false);
            setNewSpaceName('');
        } catch (error: any) {
            alert(error.message || 'Error al actualizar el nombre del espacio');
        } finally {
            setIsUpdatingSpaceName(false);
        }
    };
    return (
        <div className="bg-gray-50 p-4">
            <h2 className="text-xl font-semibold mb-6">Perfil</h2>

            {/* Información del usuario */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6 rounded-2xl border bg-white p-6 shadow-soft"
            >
                {/* Foto de perfil */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-brand-purple flex items-center justify-center overflow-hidden">
                            <SimpleImage
                                src={currentPhotoURL || ''}
                                alt="Foto de perfil"
                                className="w-full h-full object-cover"
                                fallback={
                                    <span className="text-white font-bold text-xl">
                                        {getInitials(user?.displayName || user?.email?.split('@')[0] || 'U')}
                                    </span>
                                }
                            />
                        </div>

                        {/* Botón para cambiar foto */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingPhoto}
                            className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-purple text-white rounded-full flex items-center justify-center hover:bg-brand-purple/90 transition shadow-sm disabled:opacity-50"
                        >
                            {isUploadingPhoto ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : currentPhotoURL ? (
                                <PencilSimple size={14} weight="bold" />
                            ) : (
                                <Plus size={14} weight="bold" />
                            )}
                        </button>

                        {/* Input oculto para seleccionar archivo */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                        />
                    </div>

                    <div className="flex-1">
                        <p className="text-sm text-gray-600">Sesión iniciada como:</p>
                        <p className="font-semibold text-gray-900">{user?.displayName}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        {userRole && (
                            <div className="mt-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${userRole === 'mama'
                                    ? 'bg-pink-100 text-pink-700'
                                    : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {userRole === 'mama' ? '👩 Mamá' : '👨 Papá'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <button onClick={signOutApp} className="w-full rounded-pill bg-brand-blue text-white py-3 font-semibold active:scale-pressed transition">
                    Cerrar sesión
                </button>
            </motion.div>

            {/* Estadísticas */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de actividad</h3>

                <div className="grid grid-cols-1 gap-4">
                    {/* Recuerdos */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center">
                                <Camera size={24} className="text-brand-purple" weight="bold" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">Recuerdos</h4>
                                <p className="text-sm text-gray-600">Momentos guardados</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-brand-purple">{stats.totalMemories}</p>
                                <p className="text-xs text-gray-500">total</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Objetivos */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center">
                                <Target size={24} className="text-brand-blue" weight="bold" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">Objetivos</h4>
                                <p className="text-sm text-gray-600">Metas familiares</p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-3">
                                    <div className="text-center">
                                        <div className="flex items-center gap-1">
                                            <CheckCircle size={16} className="text-emerald-500" weight="fill" />
                                            <span className="text-lg font-bold text-emerald-600">{stats.completedGoals}</span>
                                        </div>
                                        <p className="text-xs text-gray-500">completados</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center gap-1">
                                            <Clock size={16} className="text-amber-500" weight="fill" />
                                            <span className="text-lg font-bold text-amber-600">{stats.pendingGoals}</span>
                                        </div>
                                        <p className="text-xs text-gray-500">pendientes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Eventos del hijo */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center">
                                <Baby size={24} className="text-brand-gold" weight="bold" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">Hitos de {stats.childName}</h4>
                                <p className="text-sm text-gray-600">Momentos especiales</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-brand-gold">{stats.totalChildEvents}</p>
                                <p className="text-xs text-gray-500">eventos</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Compartir espacio */}
            {currentSpace && spaceCode && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Invitar familia</h3>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="text-center mb-4">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{currentSpace.name}</h4>
                                {isSpaceOwner && (
                                    <button
                                        onClick={handleEditSpaceName}
                                        className="p-1 rounded-full hover:bg-gray-100 transition"
                                    >
                                        <PencilSimple size={16} className="text-gray-500" />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-gray-600">Comparte el código para invitar familiares</p>
                        </div>

                        {/* Código */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-xs text-gray-600 mb-1 text-center">Código del espacio:</p>
                            <p className="text-2xl font-bold text-center font-mono text-brand-purple tracking-wider">
                                {spaceCode}
                            </p>
                        </div>

                        {/* Botones de compartir */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => copyToClipboard(spaceCode)}
                                className="flex items-center justify-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                            >
                                <Copy size={16} />
                                <span className="text-sm font-medium">Copiar</span>
                            </button>
                            <button
                                onClick={() => shareToWhatsApp(spaceCode, currentSpace.name)}
                                className="flex items-center justify-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                            >
                                <Share size={16} />
                                <span className="text-sm font-medium">WhatsApp</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Modal para editar nombre del espacio */}
            <AnimatePresence>
                {showEditSpaceName && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowEditSpaceName(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Cambiar nombre del espacio</h3>
                                <button
                                    onClick={() => setShowEditSpaceName(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nuevo nombre del espacio
                                    </label>
                                    <input
                                        type="text"
                                        value={newSpaceName}
                                        onChange={(e) => setNewSpaceName(e.target.value)}
                                        placeholder="ej. Familia García"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition"
                                        maxLength={50}
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowEditSpaceName(false)}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleUpdateSpaceName}
                                        disabled={!newSpaceName.trim() || isUpdatingSpaceName || newSpaceName.trim() === currentSpace?.name}
                                        className="flex-1 px-4 py-3 bg-brand-purple text-white rounded-xl hover:bg-brand-purple/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isUpdatingSpaceName ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Guardando...
                                            </>
                                        ) : (
                                            'Guardar cambios'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


