import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { useEntries } from '../../features/entries/useEntries';
import { AppBar } from '../../components';
import { FlagBanner, Plus, CheckCircle, Clock } from 'phosphor-react';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';

export function Goals() {
    const { spaceId } = useAuth();
    const { entries } = useEntries(spaceId, 'goal');
    const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

    // Filtrar objetivos por estado
    const filteredGoals = useMemo(() => {
        return entries.filter((goal) => {
            const isCompleted = (goal as any).status === 'completed';
            if (filter === 'completed') return isCompleted;
            if (filter === 'pending') return !isCompleted;
            return true; // 'all'
        });
    }, [entries, filter]);

    // Estadísticas
    const stats = useMemo(() => {
        const completed = entries.filter((g) => (g as any).status === 'completed').length;
        const pending = entries.length - completed;
        return { total: entries.length, completed, pending };
    }, [entries]);

    return (
        <div className="bg-gray-50 p-4">
            <AppBar
                title="Objetivos"
                subtitle="Tus metas familiares y sueños por cumplir"
                actionButton={{
                    label: "Nuevo",
                    to: "/goals/new",
                    color: "blue"
                }}
            >
                {/* Estadísticas y filtros */}
                {entries.length > 0 && (
                    <div className="space-y-4">
                        {/* Estadísticas */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white p-3 rounded-xl border text-center">
                                <div className="text-lg font-bold text-brand-blue">{stats.total}</div>
                                <div className="text-xs text-gray-500">Total</div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border text-center">
                                <div className="text-lg font-bold text-emerald-600">{stats.completed}</div>
                                <div className="text-xs text-gray-500">Completados</div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border text-center">
                                <div className="text-lg font-bold text-amber-600">{stats.pending}</div>
                                <div className="text-xs text-gray-500">Pendientes</div>
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {[
                                { k: 'all', l: 'Todos', icon: FlagBanner, color: 'brand-blue' },
                                { k: 'completed', l: 'Completados', icon: CheckCircle, color: 'emerald-600' },
                                { k: 'pending', l: 'Pendientes', icon: Clock, color: 'amber-600' },
                            ].map(({ k, l, icon: Icon, color }, index) => (
                                <motion.button
                                    key={k}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setFilter(k as any)}
                                    className={`px-4 py-2 rounded-pill border whitespace-nowrap flex items-center gap-2 transition-all ${filter === k
                                        ? `bg-${color}/10 text-${color} border-${color}/30 shadow-sm`
                                        : 'bg-white hover:bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    <Icon size={16} weight={filter === k ? 'bold' : 'regular'} />
                                    <span className="text-sm font-medium">{l}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                )}
            </AppBar>

            {filteredGoals.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 gap-3"
                >
                    {filteredGoals.map((goal, index) => (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.05 * index }}
                            whileHover={{ y: -2, transition: { duration: 0.2 } }}
                        >
                            <GoalCard
                                goal={goal}
                                onClick={() => {
                                    if ((goal as any).status === 'completed') {
                                        window.location.href = `/goals/${goal.id}`;
                                    } else {
                                        window.location.href = `/goals/${goal.id}/complete`;
                                    }
                                }}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            ) : entries.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-8 text-center py-12"
                >
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hay objetivos {filter === 'completed' ? 'completados' : 'pendientes'}
                    </h3>
                    <p className="text-gray-600 max-w-sm mx-auto">
                        {filter === 'completed'
                            ? 'Aún no has completado ningún objetivo. ¡Sigue trabajando!'
                            : 'Todos tus objetivos están completados. ¡Felicitaciones!'
                        }
                    </p>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-8 text-center py-16"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2, type: "spring", bounce: 0.3 }}
                        className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-blue/10 flex items-center justify-center"
                    >
                        <FlagBanner size={32} className="text-brand-blue" weight="fill" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hay objetivos aún
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                        Define tus primeras metas familiares y alcanza tus sueños
                    </p>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                    >
                        <Link
                            to="/goals/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl font-medium hover:bg-brand-blue/90 transition shadow-sm hover:scale-105 active:scale-95"
                        >
                            <Plus size={20} weight="bold" />
                            Crear primer objetivo
                        </Link>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}

// Componente para mostrar cada objetivo
function GoalCard({ goal, onClick }: { goal: any; onClick?: () => void }) {
    const isCompleted = goal.status === 'completed';
    const category = goal.goalCategory || 'logro';
    const icon = goal.goalIcon || '🎯';

    return (
        <div className="bg-white rounded-xl border hover:shadow-md transition-all">
            <div
                onClick={onClick}
                className="p-4 cursor-pointer active:scale-[0.98] transition-transform"
            >
                <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl relative ${isCompleted ? 'bg-emerald-100' : 'bg-brand-blue/10'
                        }`}>
                        {icon}
                        {isCompleted && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                <CheckCircle size={12} weight="fill" className="text-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                                {goal.title}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-pill text-xs font-medium ${category === 'viaje' ? 'bg-purple-100 text-purple-700' :
                                category === 'actividad' ? 'bg-orange-100 text-orange-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                {category}
                            </span>
                        </div>
                        {goal.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                                {goal.description}
                            </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-pill text-xs font-medium ${isCompleted
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                                }`}>
                                {isCompleted ? <CheckCircle size={12} weight="fill" /> : <Clock size={12} />}
                                {isCompleted ? 'Completado' : 'Pendiente'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botón para completar objetivo si está pendiente */}
            {!isCompleted && (
                <div className="px-4 pb-4">
                    <Link
                        to={`/goals/${goal.id}/complete`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-purple to-purple-600 text-white rounded-lg font-medium hover:from-brand-purple/90 hover:to-purple-700 transition text-sm shadow-sm"
                    >
                        <CheckCircle size={16} weight="bold" />
                        ¡Completar objetivo!
                    </Link>
                </div>
            )}
        </div>
    );
}


