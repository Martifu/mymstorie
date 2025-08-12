import { useParams, useNavigate } from 'react-router-dom';

import { useEntries } from '../../features/entries/useEntries';
import { ArrowLeft, Calendar } from 'iconsax-react';
import { LoadingSpinner } from '../../components';

import birthdayIcon from '../../assets/birthday-icon.svg';
import milestoneIcon from '../../assets/milestone-icon.svg';
import memoryIcon from '../../assets/memory-icon.svg';

type Media = { url: string; type: 'image' | 'video' };
type Entry = {
    title: string;
    description?: string;
    date?: any;
    media?: Media[];
    type: 'memory' | 'goal' | 'child_event';
    childCategory?: 'birthday' | 'milestone' | 'memory';
    milestoneType?: string;
};

function getEntryCategory(entry: Entry) {
    if (entry.type === 'memory') return { label: 'Recuerdo', color: 'text-brand-purple', bg: 'bg-brand-purple/10' };
    if (entry.type === 'goal') return { label: 'Objetivo', color: 'text-brand-blue', bg: 'bg-brand-blue/10' };

    // Para child_event, usar childCategory si existe
    const childCat = entry.childCategory;
    if (childCat === 'birthday') return { label: 'Cumpleaños', color: 'text-pink-600', bg: 'bg-pink-50' };
    if (childCat === 'memory') return { label: 'Recuerdo del Hijo', color: 'text-brand-purple', bg: 'bg-brand-purple/10' };

    // Fallback para hitos
    return { label: 'Hito', color: 'text-brand-gold', bg: 'bg-brand-gold/10' };
}

function getCategoryIcon(entry: Entry) {
    if (entry.type === 'memory') return <img src={memoryIcon} alt="Recuerdo" className="w-4 h-4 object-contain" />;
    if (entry.type === 'goal') return <img src={milestoneIcon} alt="Objetivo" className="w-4 h-4 object-contain" />;

    const childCat = entry.childCategory;
    if (childCat === 'birthday') return <img src={birthdayIcon} alt="Cumpleaños" className="w-4 h-4 object-contain" />;
    if (childCat === 'memory') return <img src={memoryIcon} alt="Recuerdo del Hijo" className="w-4 h-4 object-contain" />;

    return <img src={milestoneIcon} alt="Hito" className="w-4 h-4 object-contain" />;
}

export default function MemoryDetail() {
    const { spaceId, entryId } = useParams();
    const navigate = useNavigate();

    const { entries: memories } = useEntries(spaceId || null, 'memory');
    const { entries: goals } = useEntries(spaceId || null, 'goal');
    const { entries: childEvents } = useEntries(spaceId || null, 'child_event');

    // Buscar el entry en todas las colecciones
    const entry = [...memories, ...goals, ...childEvents].find(e => e.id === entryId);

    if (!entry) return (
        <div className=" bg-gray-50 flex items-center justify-center">
            <LoadingSpinner text="Cargando detalles..." variant="pulse" size="lg" />
        </div>
    );
    const cover = entry.media?.[0];
    const category = getEntryCategory(entry);
    const categoryIcon = getCategoryIcon(entry);

    return (
        <div className="min-h-dvh bg-surface text-text">
            <div className="relative">
                <div className="aspect-[4/5] bg-surface-muted overflow-hidden rounded-2xl m-3">
                    {cover?.type === 'image' ? (
                        <img src={cover.url} alt={entry.title} className="h-full w-full object-cover" />
                    ) : cover?.type === 'video' ? (
                        <video src={cover.url} controls className="h-full w-full object-cover" />
                    ) : null}
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-5 left-6 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-text shadow-soft"
                    >
                        <ArrowLeft size={18} color="#3B3923" /> Atrás
                    </button>
                </div>
            </div>
            <div className="px-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                    <h1 className="text-2xl font-bold">{entry.title}</h1>
                    <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-medium ${category.bg} ${category.color}`}>
                            {categoryIcon}
                            {category.label}
                        </span>
                    </div>
                </div>
                {entry.description && (
                    <div className="mt-3 flex items-start gap-2 text-base leading-relaxed">
                        <p>{entry.description}</p>
                    </div>
                )}
                {entry.date && (
                    <div className="flex items-center gap-1 text-text-muted text-sm mt-3">
                        <Calendar size={18} color="#736F4E" />
                        <span>{new Date((entry.date as any)?.toDate?.() ?? entry.date).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
            {entry.media && entry.media.length > 1 && (
                <div className="p-4">
                    <h2 className="text-lg font-semibold mb-2">Más fotos</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {entry.media.slice(1).map((m, idx) => (
                            <div key={idx} className="aspect-square overflow-hidden rounded-lg bg-surface-muted">
                                {m.type === 'image' ? (
                                    <img src={m.url} className="h-full w-full object-cover" />
                                ) : (
                                    <video src={m.url} controls className="h-full w-full object-cover" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}


        </div>
    );
}


