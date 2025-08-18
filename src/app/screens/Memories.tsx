import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { useEntries } from '../../features/entries/useEntries';
import { FeedPost, AppBar, EntryDetailModal } from '../../components';
import { Camera, Plus } from 'phosphor-react';


export function Memories() {
    const { spaceId } = useAuth();
    const { entries } = useEntries(spaceId, 'memory');
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    return (
        <div className="bg-gray-50 p-4">
            <AppBar
                actionButton={{
                    label: "Nuevo",
                    to: "/memories/new",
                    color: "purple"
                }}
            />
            {entries.length > 0 ? (
                <div className="space-y-4 mt-4">
                    {entries.map((entry) => (
                        <FeedPost
                            key={entry.id}
                            entry={{
                                ...entry,
                                type: 'memory' as const,
                                date: (entry as any).date?.toDate?.() || new Date(entry.date)
                            }}
                            onClick={() => setSelectedEntryId(entry.id)}
                            onOptionsClick={() => {
                                // TODO: Implementar menú de opciones
                                console.log('Opciones para:', entry.id);
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-8 text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                        <Camera size={36} className="text-purple-600" weight="fill" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Tus recuerdos te están esperando
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
                        Cada momento cuenta una historia. Guarda tus primeros recuerdos familiares y crea tu legado
                    </p>
                    <div className="px-4">
                        <Link
                            to="/memories/new"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus size={20} weight="bold" />
                            Crear primer recuerdo
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


