import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/useAuth';
import { useEntries } from '../../features/entries/useEntries';
import { useSpaces } from '../../features/spaces/useSpaces';
import { useNavigate } from 'react-router-dom';
import { Camera, Baby, Target, Heart, Plus, Bell } from 'phosphor-react';

import { SimpleImage, EntryDetailModal, FeedPost } from '../../components';

export function Home() {
    const { spaceId, user } = useAuth();
    const { userProfile } = useSpaces();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showEventSelector, setShowEventSelector] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

    // Detectar scroll para hacer el header fixed
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    // Procesar datos para el feed estilo red social
    const feedData = useMemo(() => {
        // Combinar todas las entries en un solo feed
        const allEntries = [
            ...memories.map(entry => ({ ...entry, type: 'memory' as const })),
            ...childEvents.map(entry => ({ ...entry, type: 'child_event' as const })),
            ...goals.map(entry => ({ ...entry, type: 'goal' as const }))
        ];

        // Ordenar por fecha de creación/modificación más reciente
        const sortedEntries = allEntries.sort((a, b) => {
            const dateA = (a as any).date?.toDate?.() || (a as any).createdAt?.toDate?.() || new Date(a.date);
            const dateB = (b as any).date?.toDate?.() || (b as any).createdAt?.toDate?.() || new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        });

        return {
            feedEntries: sortedEntries.slice(0, 10), // Mostrar últimas 10 entries
            totalCount: allEntries.length
        };
    }, [memories, goals, childEvents]);



    return (
        <>
            <div className="bg-gray-50">
                {/* Header con perfil y notificaciones - Fixed */}
                <div
                    className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                        ? 'bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200'
                        : 'bg-transparent'
                        } pt-6 pb-4`}
                >
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                                <SimpleImage
                                    src={userProfile?.photoURL || user?.photoURL || ''}
                                    alt="Foto de perfil"
                                    className="w-full h-full object-cover"
                                    priority={true}
                                    fallback={
                                        <span className="text-white font-bold text-lg">
                                            {userName?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || '👨‍👩‍👧‍👦'}
                                        </span>
                                    }
                                />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">¡Hola {userName}!</p>
                                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    {greeting.text} {greeting.emoji}
                                </h1>
                            </div>
                        </div>
                        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border">
                            <Bell size={18} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Espaciador para el header fixed */}
                <div className="h-20" />

                {/* CTA Principal - Normal */}
                <div className="mb-6 mt-8">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-4 mx-4">
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
                            <button
                                onClick={() => setShowEventSelector(true)}
                                className="bg-brand-purple hover:bg-brand-purple/90 text-white px-4 py-3 rounded-xl font-medium transition flex items-center gap-2"
                            >
                                <Plus size={16} weight="bold" />
                                Crear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feed estilo red social */}
                <section className="pb-6">
                    <div className="mb-6 px-4">
                        <h2 className="text-xl font-bold text-gray-900">Tu historia familiar</h2>
                        <p className="text-gray-600 text-sm mt-1">Los momentos más recientes de tu familia</p>
                    </div>

                    <div className="space-y-4 px-4">
                        {feedData.feedEntries.map((entry) => (
                            <FeedPost
                                key={`${entry.type}-${entry.id}`}
                                entry={{
                                    ...entry,
                                    date: (entry as any).date?.toDate?.() || (entry as any).createdAt?.toDate?.() || new Date(entry.date)
                                }}
                                onClick={() => {
                                    if (entry.type === 'goal') {
                                        navigate(`/goals/${entry.id}/complete`);
                                    } else {
                                        setSelectedEntryId(entry.id);
                                    }
                                }}
                                onOptionsClick={() => {
                                    // TODO: Implementar menú de opciones
                                    console.log('Opciones para:', entry.id);
                                }}
                            />
                        ))}
                    </div>

                    {/* Estado vacío */}
                    {feedData.totalCount === 0 && (
                        <div className="text-center py-16 px-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Heart size={32} className="text-purple-500" weight="fill" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                ¡Tu historia familiar está esperando!
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
                                Comparte tu primer momento especial y empieza a construir los recuerdos que durarán para siempre
                            </p>
                            <button
                                onClick={() => navigate('/memories/new')}
                                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
                            >
                                ✨ Crear mi primer post
                            </button>
                        </div>
                    )}

                    {/* Botón para ver más si hay más contenido */}
                    {feedData.totalCount > 10 && (
                        <div className="text-center mt-6">
                            <button
                                onClick={() => navigate('/memories')}
                                className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
                            >
                                Ver todos los {feedData.totalCount} posts →
                            </button>
                        </div>
                    )}
                </section>

                {/* Modal Selector de Tipo de Evento */}
                {showEventSelector && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowEventSelector(false)}
                    >
                        <div
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
                                <button
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
                                </button>

                                <button
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
                                </button>

                                <button
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
                                </button>
                            </div>

                            <button
                                onClick={() => setShowEventSelector(false)}
                                className="w-full mt-4 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* Espaciador para el header fixed */}
            <div className="h-32" />

            {/* Modal de detalle de entry */}
            <EntryDetailModal
                entryId={selectedEntryId}
                spaceId={spaceId || undefined}
                onClose={() => setSelectedEntryId(null)}
                onDeleted={() => {
                    setSelectedEntryId(null);
                    // Opcional: refresh data si es necesario
                }}
            />
        </>
    );
}

