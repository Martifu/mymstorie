import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { useEntries } from '../../features/entries/useEntries';
import { ArrowLeft, CheckCircle, Calendar, ChatText, Image } from 'phosphor-react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '../../components';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const categoryColors = {
    viaje: 'from-purple-100 to-purple-50 border-purple-200 text-purple-800',
    actividad: 'from-orange-100 to-orange-50 border-orange-200 text-orange-800',
    logro: 'from-blue-100 to-blue-50 border-blue-200 text-blue-800'
};

export default function GoalDetail() {
    const { goalId } = useParams<{ goalId: string }>();
    const { spaceId } = useAuth();
    const navigate = useNavigate();

    // Obtener todos los objetivos y buscar el específico
    const { entries } = useEntries(spaceId, 'goal');
    const currentGoal = entries.find(goal => goal.id === goalId);

    // Redirigir si no se encuentra el objetivo
    useEffect(() => {
        if (entries.length > 0 && !currentGoal) {
            navigate('/goals');
        }
    }, [currentGoal, entries, navigate]);

    if (!currentGoal) {
        return (
            <div className=" bg-gray-50 flex items-center justify-center">
                <LoadingSpinner text="Cargando objetivo..." variant="dots" size="lg" />
            </div>
        );
    }

    const goalData = currentGoal as any;
    const isCompleted = goalData.status === 'completed';
    const category = goalData.goalCategory || 'logro';
    const completedDate = goalData.completedAt?.toDate();
    const media = goalData.media || [];

    return (
        <div className=" bg-gray-50 p-4">
            <div className="mx-auto max-w-screen-sm">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-4 p-4 pb-2"
                >
                    <button
                        onClick={() => navigate('/goals')}
                        className="p-2 rounded-full bg-white shadow-sm border hover:bg-gray-50 transition"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-900">Detalles del Objetivo</h1>
                        <p className="text-sm text-gray-500">
                            {isCompleted ? 'Objetivo completado' : 'Objetivo pendiente'}
                        </p>
                    </div>
                    <div className="text-3xl">{goalData.goalIcon}</div>
                </motion.div>

                {/* Objetivo Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className={`mx-4 mb-6 p-6 bg-gradient-to-r ${categoryColors[category as keyof typeof categoryColors]} rounded-2xl border shadow-sm`}
                >
                    <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm ${isCompleted ? 'ring-2 ring-emerald-400' : ''
                            }`}>
                            <div className="text-3xl">{goalData.goalIcon}</div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-xl font-bold">{currentGoal.title}</h2>
                                {isCompleted && (
                                    <CheckCircle size={24} className="text-emerald-600" weight="fill" />
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-sm opacity-75">
                                <span className="capitalize font-medium">{category}</span>
                                {completedDate && (
                                    <div className="flex items-center gap-1">
                                        <Calendar size={16} />
                                        <span>
                                            Completado {formatDistanceToNow(completedDate, {
                                                addSuffix: true,
                                                locale: es
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Descripción */}
                {isCompleted && goalData.description && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mx-4 mb-6"
                    >
                        <div className="bg-white rounded-2xl p-6 border shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <ChatText size={24} className="text-brand-purple" weight="bold" />
                                <h3 className="text-lg font-bold text-gray-900">Comentarios</h3>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{goalData.description}</p>
                        </div>
                    </motion.div>
                )}

                {/* Multimedia */}
                {isCompleted && media.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mx-4 mb-6"
                    >
                        <div className="bg-white rounded-2xl p-6 border shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <Image size={24} className="text-brand-purple" weight="bold" />
                                <h3 className="text-lg font-bold text-gray-900">
                                    Fotos y Videos ({media.length})
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {media.map((item: any, index: number) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: 0.1 * index }}
                                        className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
                                    >
                                        {item.type === 'video' ? (
                                            <video
                                                src={item.url}
                                                controls
                                                className="w-full h-full object-cover"
                                                poster={item.thumbnail}
                                            />
                                        ) : (
                                            <img
                                                src={item.url}
                                                alt={`Media ${index + 1}`}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                                onClick={() => window.open(item.url, '_blank')}
                                            />
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Estado pendiente */}
                {!isCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mx-4 mb-6 text-center py-12"
                    >
                        <div className="text-6xl mb-4">⏳</div>
                        <h3 className="text-lg font-bold text-gray-700 mb-2">Objetivo Pendiente</h3>
                        <p className="text-gray-500 mb-6">
                            ¡Completa este objetivo para agregar fotos y comentarios!
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/goals/${goalId}/complete`)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-purple to-purple-600 text-white rounded-xl font-medium hover:from-brand-purple/90 hover:to-purple-700 transition shadow-sm"
                        >
                            <CheckCircle size={20} weight="bold" />
                            ¡Completar Objetivo!
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
