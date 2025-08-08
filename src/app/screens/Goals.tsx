import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { useEntries } from '../../features/entries/useEntries';
import { EntryCard } from '../../components/EntryCard';
import { FlagBanner, Plus } from 'phosphor-react';

export function Goals() {
    const { spaceId } = useAuth();
    const { entries } = useEntries(spaceId, 'goal');
    return (
        <div>
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Objetivos</h2>
                <Link to="/goals/new" className="text-brand-blue font-semibold">Nuevo</Link>
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
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-blue/10 flex items-center justify-center">
                        <FlagBanner size={32} className="text-brand-blue" weight="fill" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hay objetivos aún
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                        Define tus primeras metas familiares y alcanza tus sueños
                    </p>
                    <Link
                        to="/goals/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl font-medium hover:bg-brand-blue/90 transition shadow-sm"
                    >
                        <Plus size={20} weight="bold" />
                        Crear primer objetivo
                    </Link>
                </div>
            )}
        </div>
    );
}


