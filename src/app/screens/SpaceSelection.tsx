import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, ArrowRight, X, Check, Warning, CheckCircle, Copy } from 'phosphor-react';
import { useSpaces } from '../../features/spaces/useSpaces';
import type { SpaceData, UserRole } from '../../features/spaces/spacesService';
import { FullScreenLoader } from '../../components';

export function SpaceSelection() {
    const { createSpace, findSpace, joinSpace, loading } = useSpaces();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showSpaceInfo, setShowSpaceInfo] = useState<SpaceData | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState<{ code: string; name: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    // Estados para crear espacio
    const [spaceName, setSpaceName] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole>('mama');

    // Estados para unirse a espacio
    const [spaceCode, setSpaceCode] = useState('');
    const [joinRole, setJoinRole] = useState<UserRole>('papa');

    const handleCreateSpace = async () => {
        if (!spaceName.trim()) return;

        setIsSubmitting(true);
        setError('');

        try {
            const { spaceCode } = await createSpace(spaceName.trim(), selectedRole);

            // Cerrar modal de creación y mostrar modal de éxito
            setShowCreateModal(false);
            setShowSuccessModal({ code: spaceCode, name: spaceName.trim() });

        } catch (error) {
            console.error('Error creating space:', error);
            setError('Error al crear el espacio. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFindSpace = async () => {
        if (!spaceCode.trim()) return;

        setIsSubmitting(true);
        setError('');

        try {
            const space = await findSpace(spaceCode.trim());

            if (!space) {
                setError('No se encontró un espacio con ese código.');
                return;
            }

            setShowSpaceInfo(space);
        } catch (error) {
            console.error('Error finding space:', error);
            setError('Error al buscar el espacio. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleJoinSpace = async (spaceId: string) => {
        setIsSubmitting(true);
        setError('');

        try {
            await joinSpace(spaceId, joinRole);

            // Recargar la página para ir al Home
            window.location.reload();
        } catch (error) {
            console.error('Error joining space:', error);
            setError('Error al unirse al espacio. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
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

    // Limpiar errores al abrir modales
    const handleOpenCreateModal = () => {
        setError('');
        setShowCreateModal(true);
    };

    const handleOpenJoinModal = () => {
        setError('');
        setShowJoinModal(true);
    };

    // Copiar código al portapapeles
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
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

    // Continuar a la app después de crear espacio
    const handleContinueToApp = () => {
        setShowSuccessModal(null);
        window.location.reload();
    };

    if (loading) {
        return <FullScreenLoader text="Preparando tu espacio familiar..." variant="dots" />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="pt-12 pb-8 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-3xl font-bold text-brand-purple mb-2">mymstorie</h1>
                    <p className="text-gray-600">Tu rincón familiar privado ✨</p>
                </motion.div>
            </div>

            {/* Contenido principal */}
            <div className="px-6 max-w-md mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8 text-center"
                >
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        ¡Bienvenido!
                    </h2>
                    <p className="text-gray-600">
                        Para comenzar, crea un nuevo espacio familiar o únete a uno existente
                    </p>
                </motion.div>

                {/* Opciones principales */}
                <div className="space-y-4">
                    {/* Crear espacio */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        onClick={handleOpenCreateModal}
                        className="w-full p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center group-hover:bg-brand-purple/20 transition">
                                <Plus size={24} className="text-brand-purple" weight="bold" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-semibold text-gray-900 mb-1">Crear nuevo espacio</h3>
                                <p className="text-sm text-gray-600">Comienza tu historia familiar desde cero</p>
                            </div>
                            <ArrowRight size={20} className="text-gray-400 group-hover:text-brand-purple transition" />
                        </div>
                    </motion.button>

                    {/* Unirse a espacio */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        onClick={handleOpenJoinModal}
                        className="w-full p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center group-hover:bg-brand-blue/20 transition">
                                <Users size={24} className="text-brand-blue" weight="bold" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-semibold text-gray-900 mb-1">Unirse a espacio</h3>
                                <p className="text-sm text-gray-600">Conéctate con tu familia usando un código</p>
                            </div>
                            <ArrowRight size={20} className="text-gray-400 group-hover:text-brand-blue transition" />
                        </div>
                    </motion.button>
                </div>
            </div>

            {/* Modal Crear Espacio */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Crear nuevo espacio</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Nombre del espacio */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre del espacio familiar
                                    </label>
                                    <input
                                        type="text"
                                        value={spaceName}
                                        onChange={(e) => setSpaceName(e.target.value)}
                                        placeholder="ej. Familia García"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition"
                                    />
                                </div>

                                {/* Selección de rol */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        ¿Quién eres?
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setSelectedRole('mama')}
                                            className={`p-4 rounded-xl border-2 transition ${selectedRole === 'mama'
                                                ? 'border-brand-purple bg-brand-purple/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="text-2xl mb-2">👩</div>
                                            <div className="font-medium text-gray-900">Mamá</div>
                                        </button>
                                        <button
                                            onClick={() => setSelectedRole('papa')}
                                            className={`p-4 rounded-xl border-2 transition ${selectedRole === 'papa'
                                                ? 'border-brand-purple bg-brand-purple/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="text-2xl mb-2">👨</div>
                                            <div className="font-medium text-gray-900">Papá</div>
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                                        <Warning size={16} />
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}

                                {/* Botones */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleCreateSpace}
                                        disabled={!spaceName.trim() || isSubmitting}
                                        className="flex-1 px-4 py-3 bg-brand-purple text-white rounded-xl hover:bg-brand-purple/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Creando...
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={16} weight="bold" />
                                                Crear espacio
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Unirse a Espacio */}
            <AnimatePresence>
                {showJoinModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowJoinModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Unirse a espacio</h3>
                                <button
                                    onClick={() => setShowJoinModal(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Código del espacio */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Código del espacio
                                    </label>
                                    <input
                                        type="text"
                                        value={spaceCode}
                                        onChange={(e) => setSpaceCode(e.target.value.toUpperCase())}
                                        placeholder="Ingresa el código de 6 dígitos"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition text-center font-mono text-lg tracking-wider"
                                        maxLength={6}
                                    />
                                </div>

                                {/* Selección de rol */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        ¿Quién eres?
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setJoinRole('mama')}
                                            className={`p-4 rounded-xl border-2 transition ${joinRole === 'mama'
                                                ? 'border-brand-purple bg-brand-purple/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="text-2xl mb-2">👩</div>
                                            <div className="font-medium text-gray-900">Mamá</div>
                                        </button>
                                        <button
                                            onClick={() => setJoinRole('papa')}
                                            className={`p-4 rounded-xl border-2 transition ${joinRole === 'papa'
                                                ? 'border-brand-purple bg-brand-purple/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="text-2xl mb-2">👨</div>
                                            <div className="font-medium text-gray-900">Papá</div>
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                                        <Warning size={16} />
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}

                                {/* Botones */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowJoinModal(false)}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleFindSpace}
                                        disabled={spaceCode.length !== 6 || isSubmitting}
                                        className="flex-1 px-4 py-3 bg-brand-blue text-white rounded-xl hover:bg-brand-blue/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Buscando...
                                            </>
                                        ) : (
                                            <>
                                                <Users size={16} weight="bold" />
                                                Buscar espacio
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Información del Espacio */}
            <AnimatePresence>
                {showSpaceInfo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowSpaceInfo(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                        >
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Espacio encontrado</h3>
                                <p className="text-gray-600">¿Te quieres unir a este espacio familiar?</p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <div className="text-center mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900">{showSpaceInfo.name}</h4>
                                </div>

                                {/* Creador */}
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-brand-purple flex items-center justify-center overflow-hidden">
                                        {showSpaceInfo.members[showSpaceInfo.createdBy]?.photoURL ? (
                                            <img
                                                src={showSpaceInfo.members[showSpaceInfo.createdBy].photoURL}
                                                alt="Creador"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white font-semibold">
                                                {getInitials(showSpaceInfo.members[showSpaceInfo.createdBy]?.displayName || 'U')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            {showSpaceInfo.members[showSpaceInfo.createdBy]?.displayName || 'Usuario'}
                                        </p>
                                        <p className="text-sm text-gray-600">Creador del espacio</p>
                                    </div>
                                </div>

                                <div className="mt-4 text-sm text-gray-600">
                                    <p>Miembros: {Object.keys(showSpaceInfo.members).length}</p>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg mb-4">
                                    <Warning size={16} />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSpaceInfo(null)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleJoinSpace(showSpaceInfo.id)}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 bg-brand-purple text-white rounded-xl hover:bg-brand-purple/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Uniéndose...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} weight="bold" />
                                            Unirme
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Éxito - Espacio Creado */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                        >
                            {/* Icono de éxito */}
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} className="text-green-600" weight="fill" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">¡Espacio creado!</h3>
                                <p className="text-gray-600">
                                    Tu espacio familiar <strong>"{showSuccessModal.name}"</strong> está listo
                                </p>
                            </div>

                            {/* Código para compartir */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <p className="text-sm text-gray-600 mb-2 text-center">Código para invitar familiares:</p>
                                <div className="bg-white rounded-lg p-3 border-2 border-dashed border-gray-300 mb-4">
                                    <p className="text-2xl font-bold text-center font-mono text-brand-purple tracking-wider">
                                        {showSuccessModal.code}
                                    </p>
                                </div>

                                {/* Botones de compartir */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => copyToClipboard(showSuccessModal.code)}
                                        className="flex items-center justify-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                    >
                                        <Copy size={16} />
                                        <span className="text-sm font-medium">Copiar</span>
                                    </button>
                                    <button
                                        onClick={() => shareToWhatsApp(showSuccessModal.code, showSuccessModal.name)}
                                        className="flex items-center justify-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                                    >
                                        <span className="text-sm">📱</span>
                                        <span className="text-sm font-medium">WhatsApp</span>
                                    </button>
                                </div>
                            </div>

                            {/* Botón continuar */}
                            <button
                                onClick={handleContinueToApp}
                                className="w-full px-4 py-3 bg-brand-purple text-white rounded-xl hover:bg-brand-purple/90 transition font-medium"
                            >
                                Continuar a la app
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
