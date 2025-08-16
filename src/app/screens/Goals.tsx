import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { useEntries } from '../../features/entries/useEntries';
import { AppBar, EntryDetailModal } from '../../components';
import { FlagBanner, Plus, CheckCircle, Clock } from 'phosphor-react';


export function Goals() {
    const { spaceId } = useAuth();
    const { entries } = useEntries(spaceId, 'goal');
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

    return (
        <div className="bg-gray-50 p-4">
            <AppBar
                actionButton={{
                    label: "Nuevo",
                    to: "/goals/new",
                    color: "blue"
                }}
            />

            {entries.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                    {entries.map((goal) => (
                        <div key={goal.id}>
                            <GoalCard
                                goal={goal}
                                onClick={() => {
                                    if ((goal as any).status === 'completed') {
                                        setSelectedEntryId(goal.id);
                                    } else {
                                        // Para objetivos pendientes, mantener la navegación al completar
                                        window.location.href = `/goals/${goal.id}/complete`;
                                    }
                                }}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mt-8 text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-blue/10 flex items-center justify-center">
                        <FlagBanner size={32} className="text-brand-blue" weight="fill" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hay objetivos aún
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                        Define tus primeras metas familiares y alcanza tus sueños
                    </p>
                    <div>
                        <Link
                            to="/goals/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl font-medium hover:bg-brand-blue/90 transition shadow-sm hover:scale-105 active:scale-95"
                        >
                            <Plus size={20} weight="bold" />
                            Crear primer objetivo
                        </Link>
                    </div>
                </div>
            )}

            {/* Modal de detalle de entry */}
            <EntryDetailModal
                entryId={selectedEntryId}
                spaceId={spaceId || undefined}
                onClose={() => setSelectedEntryId(null)}
                onDeleted={() => {
                    setSelectedEntryId(null);
                    // El hook useEntries se refresca automáticamente
                }}
            />
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


