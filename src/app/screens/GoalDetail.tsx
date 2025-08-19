import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { ArrowLeft, CheckCircle, Calendar, ChatText, Image } from 'phosphor-react';
import { SimpleImage, EntryOptionsMenu, VideoThumbnail } from '../../components';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const categoryColors = {
    viaje: 'from-purple-100 to-purple-50 border-purple-200 text-purple-800',
    actividad: 'from-orange-100 to-orange-50 border-orange-200 text-orange-800',
    logro: 'from-blue-100 to-blue-50 border-blue-200 text-blue-800'
};

// Hook optimizado para cargar goal específico
function useSpecificGoal(spaceId: string | null, goalId: string | undefined) {
    const [goal, setGoal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!spaceId || !goalId) {
            setLoading(false);
            return;
        }

        const fetchGoal = async () => {
            try {
                setLoading(true);
                setError(null);

                const { doc, getDoc } = await import('firebase/firestore');
                const { db } = await import('../../lib/firebase');

                const goalRef = doc(db, `spaces/${spaceId}/entries/${goalId}`);
                const goalSnap = await getDoc(goalRef);

                if (goalSnap.exists()) {
                    const data = goalSnap.data();
                    setGoal({ id: goalSnap.id, ...data });
                } else {
                    setError('Goal not found');
                }
            } catch (err) {
                console.error('Error fetching goal:', err);
                setError('Error loading goal');
            } finally {
                setLoading(false);
            }
        };

        fetchGoal();
    }, [spaceId, goalId]);

    return { goal, loading, error };
}

export default function GoalDetail() {
    const { goalId } = useParams<{ goalId: string }>();
    const { spaceId } = useAuth();
    const navigate = useNavigate();

    const { goal: currentGoal, loading, error } = useSpecificGoal(spaceId, goalId);

    // Skeleton loading
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="mx-auto max-w-screen-sm">
                    {/* Header skeleton */}
                    <div className="flex items-center gap-4 p-4 pb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                        <div className="flex-1">
                            <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                        </div>
                        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                    </div>

                    {/* Content skeleton */}
                    <div className="mx-4 mb-6 p-6 bg-white rounded-2xl border">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-2xl animate-pulse" />
                            <div className="flex-1">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !currentGoal) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Objetivo no encontrado</h2>
                <p className="text-gray-600 mb-6 text-center">
                    No pudimos encontrar este objetivo. Puede que haya sido eliminado.
                </p>
                <button
                    onClick={() => navigate('/goals')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl hover:bg-brand-blue/90 transition"
                >
                    <ArrowLeft size={18} />
                    Volver a Objetivos
                </button>
            </div>
        );
    }

    const goalData = currentGoal as any;
    const isCompleted = goalData.status === 'completed';
    const category = goalData.goalCategory || 'logro';
    const completedDate = goalData.completedAt?.toDate();
    const media = goalData.media || [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header sticky */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200">
                <div className="flex items-center gap-4 px-4 py-3">
                    <button
                        onClick={() => navigate('/goals')}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-semibold text-gray-900 truncate">{currentGoal.title}</h1>
                        <p className="text-sm text-gray-500">
                            {isCompleted ? 'Completado' : 'Pendiente'}
                        </p>
                    </div>
                    <div className="text-2xl">{goalData.goalIcon}</div>

                    {/* Menú de opciones */}
                    <EntryOptionsMenu
                        entryId={goalId!}
                        entryType="goal"
                        entryTitle={currentGoal.title}
                        spaceId={spaceId!}
                        media={media}
                        hasSpotify={false} // Los objetivos no tienen música
                        onDeleted={() => navigate('/goals')}
                    />
                </div>
            </div>

            <div className="px-4 py-6 space-y-4">
                {/* Objetivo Card optimizado */}
                <div className={`p-6 bg-gradient-to-r ${categoryColors[category as keyof typeof categoryColors]} rounded-2xl border shadow-sm`}>
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
                </div>

                {/* Descripción optimizada */}
                {isCompleted && goalData.description && (
                    <div className="bg-white rounded-2xl p-6 border shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <ChatText size={24} className="text-brand-purple" weight="bold" />
                            <h3 className="text-lg font-bold text-gray-900">Comentarios</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{goalData.description}</p>
                    </div>
                )}

                {/* Multimedia optimizado */}
                {isCompleted && media.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Image size={24} className="text-brand-purple" weight="bold" />
                            <h3 className="text-lg font-bold text-gray-900">
                                Fotos y Videos ({media.length})
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {media.map((item: any, index: number) => (
                                <div key={item.id || index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                                    {item.type === 'video' ? (
                                        <VideoThumbnail
                                            src={item.url}
                                            className="w-full h-full"
                                            onError={(e) => {
                                                console.error('Error loading video:', item.url, e);
                                            }}
                                        />
                                    ) : (
                                        <SimpleImage
                                            src={item.url}
                                            alt={`Objetivo ${currentGoal.title} - imagen ${index + 1}`}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                            blur={true}
                                            fallback={
                                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                    <div className="text-gray-400 text-2xl">📸</div>
                                                </div>
                                            }
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Estado pendiente optimizado */}
                {!isCompleted && (
                    <div className="bg-white rounded-2xl p-8 border shadow-sm text-center">
                        <div className="text-6xl mb-4">⏳</div>
                        <h3 className="text-lg font-bold text-gray-700 mb-2">Objetivo Pendiente</h3>
                        <p className="text-gray-500 mb-6">
                            ¡Completa este objetivo para agregar fotos y comentarios!
                        </p>
                        <button
                            onClick={() => navigate(`/goals/${goalId}/complete`)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-purple to-purple-600 text-white rounded-xl font-medium hover:from-brand-purple/90 hover:to-purple-700 transition shadow-sm"
                        >
                            <CheckCircle size={20} weight="bold" />
                            ¡Completar Objetivo!
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
