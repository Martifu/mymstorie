import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { useEntries } from '../../features/entries/useEntries';
import { EntryCard } from '../../components/EntryCard';
import { Camera, Plus } from 'phosphor-react';

export function Memories() {
    const { spaceId } = useAuth();
    const { entries } = useEntries(spaceId, 'memory');
    return (
        <div>
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recuerdos</h2>
                <Link to="/memories/new" className="text-brand-purple font-semibold">Nuevo</Link>
            </div>
            {entries.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                    {entries.map(e => (
                        <EntryCard
                            key={e.id}
                            entry={{ id: e.id, type: e.type, title: e.title, description: e.description, date: String((e as any).date?.toDate?.() ?? e.date), media: e.media }}
                            onClick={() => window.location.href = `/memories/${spaceId}/${e.id}`}
                        />
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
                    <Link
                        to="/memories/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-purple text-white rounded-xl font-medium hover:bg-brand-purple/90 transition shadow-sm"
                    >
                        <Plus size={20} weight="bold" />
                        Crear primer recuerdo
                    </Link>
                </div>
            )}
        </div>
    );
}


