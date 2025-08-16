import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { useEntries } from '../../features/entries/useEntries';
import { EntryCard, AppBar, EntryDetailModal } from '../../components';
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
                <div className="grid grid-cols-2 gap-3">
                    {entries.map((e) => (
                        <div key={e.id}>
                            <EntryCard
                                entry={{ id: e.id, type: e.type, title: e.title, description: e.description, date: String((e as any).date?.toDate?.() ?? e.date), media: e.media }}
                                onClick={() => setSelectedEntryId(e.id)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mt-8 text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-purple/10 flex items-center justify-center">
                        <Camera size={32} className="text-brand-purple" weight="fill" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hay recuerdos aún
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                        Comienza guardando tus primeros momentos familiares especiales
                    </p>
                    <div className="px-4">
                        <Link
                            to="/memories/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-purple text-white rounded-xl font-medium hover:bg-brand-purple/90 transition shadow-sm hover:scale-105 active:scale-95"
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


