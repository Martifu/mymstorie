import { useState } from 'react';
import { useAuth } from '../../features/auth/useAuth';
import { useEntries } from '../../features/entries/useEntries';
import { EntryCard } from '../../components/EntryCard';
import { useNavigate } from 'react-router-dom';
import { Plus, Heart, Camera, FlagBanner } from 'phosphor-react';

export function Home() {
    const [filter, setFilter] = useState<'all' | 'memory' | 'goal' | 'child_event'>('all');
    const { spaceId } = useAuth();
    const { entries } = useEntries(spaceId, filter);
    const navigate = useNavigate();
    return (
        <div>
            <h2 className="text-xl font-semibold">Inicio</h2>
            <div className="mt-3 flex gap-2 overflow-x-auto">
                {[
                    { k: 'all', l: 'Todos' },
                    { k: 'memory', l: 'Recuerdos' },
                    { k: 'goal', l: 'Objetivos' },
                    { k: 'child_event', l: 'Hijo' },
                ].map(({ k, l }) => (
                    <button key={k} onClick={() => setFilter(k as any)} className={`px-3 py-1.5 rounded-pill border ${filter === k ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white'}`}>{l}</button>
                ))}
            </div>
            {entries.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                    {entries.map((e) => (
                        <EntryCard key={e.id} entry={{
                            id: e.id,
                            type: e.type,
                            title: e.title,
                            description: e.description,
                            date: String((e as any).date?.toDate?.() ?? e.date),
                            media: e.media,
                            favorites: e.favorites,
                            reactions: e.reactions
                        }} onClick={() => window.location.href = `/memories/${spaceId}/${e.id}`} />
                    ))}
                </div>
            ) : (
                <div className="mt-8 text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-purple/10 flex items-center justify-center">
                        <Heart size={32} className="text-brand-purple" weight="fill" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {filter === 'all' ? 'No hay momentos aún' :
                            filter === 'memory' ? 'No hay recuerdos aún' :
                                filter === 'goal' ? 'No hay objetivos aún' :
                                    'No hay eventos del hijo aún'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                        {filter === 'all' ? 'Comienza creando tu primer momento especial' :
                            filter === 'memory' ? 'Guarda tus primeros recuerdos familiares' :
                                filter === 'goal' ? 'Define tus primeras metas familiares' :
                                    'Registra los primeros hitos de tu pequeño'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {(filter === 'all' || filter === 'memory') && (
                            <button
                                onClick={() => navigate('/memories/new')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-xl font-medium hover:bg-brand-purple/90 transition"
                            >
                                <Camera size={18} weight="bold" />
                                Crear recuerdo
                            </button>
                        )}
                        {(filter === 'all' || filter === 'goal') && (
                            <button
                                onClick={() => navigate('/goals/new')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl font-medium hover:bg-brand-blue/90 transition"
                            >
                                <FlagBanner size={18} weight="bold" />
                                Crear objetivo
                            </button>
                        )}
                        {(filter === 'all' || filter === 'child_event') && (
                            <button
                                onClick={() => navigate('/child/new')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-xl font-medium hover:bg-brand-gold/90 transition"
                            >
                                <Plus size={18} weight="bold" />
                                Crear evento
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


