import { useMemo, useState } from 'react';
import { useAuth } from '../../features/auth/useAuth';
import { useEntries } from '../../features/entries/useEntries';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Camera, Baby, Target, Calendar, Heart, Plus, Clock, CheckCircle, MagnifyingGlass, Bell } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function Home() {
    const { spaceId, user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showEventSelector, setShowEventSelector] = useState(false);

    // Función para obtener el saludo basado en la hora
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return { text: 'Buenos días', emoji: '🌅' };
        } else if (hour >= 12 && hour < 18) {
            return { text: 'Buenas tardes', emoji: '☀️' };
        } else {
            return { text: 'Buenas noches', emoji: '🌙' };
        }
    };

    const greeting = getGreeting();
    const userName = user?.displayName || user?.email?.split('@')[0] || 'familia';

    // Función para manejar la creación de eventos
    const handleCreateEvent = (type: 'memory' | 'goal' | 'child_event') => {
        setShowEventSelector(false);
        const routes = {
            memory: '/memories/new',
            goal: '/goals/new',
            child_event: '/child/new'
        };

        // Navegar con el título pre-llenado si hay texto
        if (searchQuery.trim()) {
            navigate(routes[type], {
                state: { prefilledTitle: searchQuery.trim() }
            });
        } else {
            navigate(routes[type]);
        }
        setSearchQuery(''); // Limpiar el campo
    };

    // Obtener todos los tipos de entradas
    const { entries: memories } = useEntries(spaceId, 'memory');
    const { entries: goals } = useEntries(spaceId, 'goal');
    const { entries: childEvents } = useEntries(spaceId, 'child_event');

    // Procesar datos para el feed
    const feedData = useMemo(() => {
        // Últimos 3 recuerdos
        const recentMemories = memories
            .sort((a, b) => {
                const dateA = (a as any).date?.toDate?.() || new Date(a.date);
                const dateB = (b as any).date?.toDate?.() || new Date(b.date);
                return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 3);

        // Últimos 3 eventos del hijo
        const recentChildEvents = childEvents
            .sort((a, b) => {
                const dateA = (a as any).date?.toDate?.() || new Date(a.date);
                const dateB = (b as any).date?.toDate?.() || new Date(b.date);
                return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 3);

        // Próximos 3 objetivos pendientes
        const pendingGoals = goals
            .filter(goal => (goal as any).status !== 'completed')
            .sort((a, b) => {
                const dateA = (a as any).createdAt?.toDate?.() || new Date(a.date);
                const dateB = (b as any).createdAt?.toDate?.() || new Date(b.date);
                return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 3);

        return {
            memories: recentMemories,
            childEvents: recentChildEvents,
            goals: pendingGoals,
            totalCount: memories.length + goals.length + childEvents.length
        };
    }, [memories, goals, childEvents]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-gray-50"
        >
            {/* Header con perfil y notificaciones */}
            <motion.div variants={itemVariants} className="pt-6 pb-4">
                <div className="flex items-center justify-between mb-4 px-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">👨‍👩‍👧‍👦</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">¡Hola {userName}!</p>
                            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                {greeting.text} {greeting.emoji}
                            </h1>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border"
                    >
                        <Bell size={18} className="text-gray-600" />
                    </motion.button>
                </div>

                {/* CTA Principal */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-4 mb-6 mx-4">
                    <h2 className="text-white text-xl font-bold mb-2">
                        Comparte tu momento especial hoy 💡
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                            <input
                                type="text"
                                placeholder="¿Qué momento quieres guardar?"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-white placeholder-white/70 text-sm focus:outline-none"
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowEventSelector(true)}
                            className="bg-brand-purple hover:bg-brand-purple/90 text-white px-4 py-3 rounded-xl font-medium transition flex items-center gap-2"
                        >
                            <Plus size={16} weight="bold" />
                            Crear
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Quick Access Cards */}
            <motion.section variants={itemVariants} className="mb-6">
                <div className="mb-4 px-4">
                    <h2 className="text-lg font-bold text-gray-900">Acceso Rápido</h2>
                </div>

                <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide pb-2">
                    <QuickAccessCard
                        title="Recuerdos"
                        subtitle="Fotos y videos"
                        icon="📸"
                        gradient="from-brand-purple to-purple-600"
                        onClick={() => navigate('/memories')}
                    />
                    <QuickAccessCard
                        title="Objetivos"
                        subtitle="Metas familiares"
                        icon="🎯"
                        gradient="from-brand-blue to-blue-600"
                        onClick={() => navigate('/goals')}
                    />
                    <QuickAccessCard
                        title="Hijo"
                        subtitle="Hitos y eventos"
                        icon="👶"
                        gradient="from-brand-gold to-yellow-600"
                        onClick={() => navigate('/child')}
                    />
                </div>
            </motion.section>

            {/* Recent Activity Feed */}
            <motion.section variants={itemVariants} className="pb-6">
                <div className="mb-4 px-4">
                    <h2 className="text-lg font-bold text-gray-900">Actividad Reciente</h2>
                </div>

                <div className="space-y-3 px-4">
                    {/* Mostrar recuerdos recientes */}
                    {feedData.memories.slice(0, 2).map((memory, index) => (
                        <ActivityFeedItem
                            key={`memory-${memory.id}`}
                            type="memory"
                            title={memory.title}
                            subtitle={memory.description || "Nuevo recuerdo guardado"}
                            time={format((memory as any).date?.toDate?.() || new Date(memory.date), "d 'de' MMM", { locale: es })}
                            avatar="📸"
                            hasMedia={memory.media && memory.media.length > 0}
                            mediaUrl={memory.media?.[0]?.url}
                            onClick={() => navigate(`/memories/${spaceId}/${memory.id}`)}
                            index={index}
                        />
                    ))}

                    {/* Mostrar eventos del hijo */}
                    {feedData.childEvents.slice(0, 2).map((event, index) => (
                        <ActivityFeedItem
                            key={`child-${event.id}`}
                            type="child"
                            title={event.title}
                            subtitle={event.description || "Nuevo hito registrado"}
                            time={format((event as any).date?.toDate?.() || new Date(event.date), "d 'de' MMM", { locale: es })}
                            avatar="👶"
                            onClick={() => navigate('/child')}
                            index={index + feedData.memories.slice(0, 2).length}
                        />
                    ))}

                    {/* Mostrar objetivos pendientes */}
                    {feedData.goals.slice(0, 1).map((goal, index) => (
                        <ActivityFeedItem
                            key={`goal-${goal.id}`}
                            type="goal"
                            title={goal.title}
                            subtitle="Objetivo pendiente"
                            time="Pendiente"
                            avatar={(goal as any).goalIcon || "🎯"}
                            onClick={() => navigate(`/goals/${goal.id}/complete`)}
                            index={index + feedData.memories.slice(0, 2).length + feedData.childEvents.slice(0, 2).length}
                        />
                    ))}
                </div>

                {feedData.totalCount === 0 && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            ¡Comienza tu historia familiar!
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Crea tu primer recuerdo, objetivo o evento del hijo
                        </p>
                        <div className="flex flex-col gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/memories/new')}
                                className="bg-brand-purple text-white px-6 py-3 rounded-xl font-medium"
                            >
                                📸 Crear primer recuerdo
                            </motion.button>
                        </div>
                    </div>
                )}
            </motion.section>

            {/* Modal Selector de Tipo de Evento */}
            <AnimatePresence>
                {showEventSelector && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowEventSelector(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
                        >
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    ¿Qué tipo de evento quieres crear?
                                </h3>
                                {searchQuery.trim() && (
                                    <p className="text-sm text-gray-600">
                                        Título: "<span className="font-medium">{searchQuery}</span>"
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleCreateEvent('memory')}
                                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-brand-purple to-purple-600 text-white rounded-xl hover:from-brand-purple/90 hover:to-purple-700 transition"
                                >
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <Camera size={24} weight="bold" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold">Recuerdo</h4>
                                        <p className="text-sm text-white/80">Fotos, videos y momentos especiales</p>
                                    </div>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleCreateEvent('goal')}
                                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-brand-blue to-blue-600 text-white rounded-xl hover:from-brand-blue/90 hover:to-blue-700 transition"
                                >
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <Target size={24} weight="bold" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold">Objetivo</h4>
                                        <p className="text-sm text-white/80">Metas familiares por cumplir</p>
                                    </div>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleCreateEvent('child_event')}
                                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-brand-gold to-yellow-600 text-white rounded-xl hover:from-brand-gold/90 hover:to-yellow-700 transition"
                                >
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <Baby size={24} weight="bold" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold">Hito del Hijo</h4>
                                        <p className="text-sm text-white/80">Momentos especiales del pequeño</p>
                                    </div>
                                </motion.button>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowEventSelector(false)}
                                className="w-full mt-4 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                            >
                                Cancelar
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Componente Quick Access Card
function QuickAccessCard({
    title,
    subtitle,
    icon,
    gradient,
    onClick
}: {
    title: string;
    subtitle: string;
    icon: string;
    gradient: string;
    onClick: () => void;
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 cursor-pointer relative overflow-hidden min-w-[160px] flex-shrink-0`}
        >
            <div className="absolute top-2 right-2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">{icon}</span>
            </div>
            <div className="text-white mt-8">
                <h3 className="font-bold text-lg mb-1">{title}</h3>
                <p className="text-white/80 text-sm">{subtitle}</p>
            </div>
        </motion.div>
    );
}

// Componente Activity Feed Item
function ActivityFeedItem({
    type,
    title,
    subtitle,
    time,
    avatar,
    hasMedia = false,
    mediaUrl,
    onClick,
    index
}: {
    type: 'memory' | 'child' | 'goal';
    title: string;
    subtitle: string;
    time: string;
    avatar: string;
    hasMedia?: boolean;
    mediaUrl?: string;
    onClick: () => void;
    index: number;
}) {
    const getStatusColor = () => {
        switch (type) {
            case 'memory': return 'bg-green-500';
            case 'child': return 'bg-blue-500';
            case 'goal': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={onClick}
            className="bg-white rounded-2xl p-4 border hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
        >
            <div className="flex items-start gap-3">
                <div className="relative">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        {hasMedia && mediaUrl ? (
                            <img
                                src={mediaUrl}
                                alt={title}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-xl">{avatar}</span>
                        )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor()} rounded-full border-2 border-white`} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
                        <span className="text-xs text-gray-500 flex-shrink-0">{time}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{subtitle}</p>
                </div>
            </div>
        </motion.div>
    );
}