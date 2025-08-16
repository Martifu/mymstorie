import { useMemo, useRef, useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/useAuth';
import { useEntries, type EntryDoc } from '../../features/entries/useEntries';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUp, Plus, FlagBanner, PencilSimple, X, Check } from 'phosphor-react';
import { useForm } from 'react-hook-form';
import birthdayIcon from '../../assets/birthday-icon.svg';
import milestoneIcon from '../../assets/milestone-icon.svg';
import memoryIcon from '../../assets/memory-icon.svg';
import birthIcon from '../../assets/birth-icon.svg';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

import { useNavigate } from 'react-router-dom';
import { AppBar, EntryDetailModal } from '../../components';

type Category = 'memory' | 'birthday' | 'milestone' | 'birth';

function asDate(d: any): Date {
    // Normaliza fechas Firestore Timestamp o string a fecha local sin desfases
    if (d?.toDate) return d.toDate();
    if (typeof d === 'string') {
        const iso = d;
        const [y, m, dd] = iso.split('T')[0].split('-').map((n) => Number(n));
        if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(dd)) return new Date(y, m - 1, dd);
        return new Date(iso);
    }
    return new Date(d);
}

function getCategory(entry: EntryDoc): Category {
    // prioridad: campo explícito guardado en el doc
    const explicit = (entry as any).childCategory as Category | undefined;
    if (explicit) return explicit;
    // fallback por compatibilidad
    const milestoneType = (entry as any).milestoneType as string | undefined;
    const label = ((entry as any).milestoneLabel || entry.title || '') as string;
    if (milestoneType === 'birth' || /nacimiento/i.test(label)) return 'birth';
    if (milestoneType === 'first_birthday' || /cumplea/i.test(label)) return 'birthday';
    return 'milestone';
}

function categoryClasses(cat: Category) {
    switch (cat) {
        case 'memory':
            return {
                ring: 'ring-brand-purple/30',
                fg: 'text-brand-purple',
                bg: 'bg-brand-purple/10',
            };
        case 'birthday':
            return {
                ring: 'ring-pink-200',
                fg: 'text-pink-600',
                bg: 'bg-pink-50',
            };
        case 'birth':
            return {
                ring: 'ring-emerald-200',
                fg: 'text-emerald-600',
                bg: 'bg-emerald-50',
            };
        default: // milestone/hito
            return {
                ring: 'ring-brand-gold/30',
                fg: 'text-brand-gold',
                bg: 'bg-brand-gold/10',
            };
    }
}

export function Child() {
    const { spaceId } = useAuth();
    const navigate = useNavigate();
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

    // Usar sólo la colección de Hitos del hijo
    const { entries } = useEntries(spaceId, 'child_event');

    // Buscar evento de nacimiento
    const birthEvent = useMemo(() => {
        return entries
            .filter((e) => e.type === 'child_event')
            .find((e) => getCategory(e) === 'birth' || (e as any).milestoneType === 'birth');
    }, [entries]);

    // Form para editar nombre (después de definir birthEvent)
    const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<{ childName: string }>({
        defaultValues: { childName: (birthEvent as any)?.childName || '' }
    });

    // Actualizar el formulario cuando cambie birthEvent
    useEffect(() => {
        if (birthEvent) {
            setValue('childName', (birthEvent as any).childName || '');
        }
    }, [birthEvent, setValue]);

    // Función para actualizar el nombre del hijo
    const updateChildName = async (data: { childName: string }) => {
        if (!spaceId || !birthEvent) return;

        try {
            // Importar updateDoc dinámicamente
            const { updateDoc, doc } = await import('firebase/firestore');
            const { db } = await import('../../lib/firebase');

            const refDoc = doc(db, `spaces/${spaceId}/entries/${birthEvent.id}`);
            await updateDoc(refDoc, {
                childName: data.childName.trim()
            });

            setShowEditDialog(false);

            // Forzar recarga de la página para reflejar cambios
            window.location.reload();
        } catch (error) {
            console.error('Error al actualizar nombre:', error);
        }
    };

    // Calcular edad desde el nacimiento
    const calculateAge = (birthDate: Date) => {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - birthDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            const remainingDays = diffDays % 30;
            if (remainingDays === 0) {
                return `${months} ${months === 1 ? 'mes' : 'meses'}`;
            }
            return `${months} ${months === 1 ? 'mes' : 'meses'} y ${remainingDays} ${remainingDays === 1 ? 'día' : 'días'}`;
        } else {
            const years = Math.floor(diffDays / 365);
            const remainingMonths = Math.floor((diffDays % 365) / 30);
            if (remainingMonths === 0) {
                return `${years} ${years === 1 ? 'año' : 'años'}`;
            }
            return `${years} ${years === 1 ? 'año' : 'años'} y ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
        }
    };

    // Procesar todos los eventos sin filtros
    const events = useMemo(() => {
        return entries
            .filter((e) => e.type === 'child_event')
            .map((e) => ({ ...e, _date: asDate(e.date), _category: getCategory(e) }))
            .sort((a, b) => b._date.getTime() - a._date.getTime());
    }, [entries]);

    // Group events by day key YYYY-MM-DD
    const groupedByDay = useMemo(() => {
        const map = new Map<string, (EntryDoc & { _date: Date })[]>();
        for (const e of events as (EntryDoc & { _date: Date })[]) {
            const key = format(e._date, 'yyyy-MM-dd');
            const existing = map.get(key);
            if (existing) existing.push(e);
            else map.set(key, [e]);
        }
        return map;
    }, [events]);

    const dayKeysDesc = useMemo(
        () => Array.from(groupedByDay.keys()).sort((a, b) => (a < b ? 1 : -1)),
        [groupedByDay]
    );



    // Refs para hacer scroll a un día al tocarlo en la tira superior
    const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Detectar scroll para mostrar/ocultar botón
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY;
            setShowScrollToTop(scrolled > 400);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-gray-50 p-4 space-y-4">
            <AppBar
                actionButton={{
                    label: "Nuevo",
                    to: "/child/new",
                    color: "gold"
                }}
            />

            {/* Widget de información del hijo si existe evento de nacimiento */}
            {birthEvent && (
                <div
                    onClick={() => setShowEditDialog(true)}
                    className="mb-6 mx-4 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {(birthEvent as any).childName || 'Mi bebé'}
                                </h3>
                                <PencilSimple
                                    size={16}
                                    className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <div>
                                    Nació el {format(asDate((birthEvent as any).date), "d 'de' LLLL 'de' yyyy", { locale: es })}
                                </div>
                                <div className="font-medium text-brand-purple">
                                    {calculateAge(asDate((birthEvent as any).date))} de vida
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline: TODOS los eventos, agrupados por día, del más reciente al más antiguo */}
            <div className="space-y-6">
                {dayKeysDesc.map((dk) => {
                    const dayDate = new Date(dk);
                    const items = (groupedByDay.get(dk) ?? []) as (EntryDoc & { _date: Date })[];
                    return (
                        <div key={dk} ref={(el) => { dayRefs.current[dk] = el; }}>
                            <div className="sticky top-[98px] z-0 -mx-4 px-4">
                                <div className="inline-block rounded-pill bg-brand-purple/10 text-brand-purple px-3 py-1 text-xs font-semibold">
                                    {format(addDays(dayDate, 1), "d 'de' LLLL 'de' yyyy", { locale: es })}
                                </div>
                            </div>
                            <div className="mt-3">
                                <VerticalTimeline animate={false} lineColor="#EAE7E3" layout="1-column">
                                    {items.map((e) => (
                                        <div key={e.id}>
                                            <TimelineItem
                                                entry={e}
                                                onClick={() => setSelectedEntryId(e.id)}
                                            />
                                        </div>
                                    ))}
                                </VerticalTimeline>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Estado vacío */}
            {events.length === 0 && (
                <div className="mt-8 text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-gold/10 flex items-center justify-center">
                        <FlagBanner size={32} className="text-brand-gold" weight="fill" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hay eventos aún
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                        Comienza registrando los primeros momentos especiales de tu pequeño
                    </p>
                    <button
                        onClick={() => navigate('/child/new')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-white rounded-xl font-medium hover:bg-brand-gold/90 transition shadow-sm"
                    >
                        <Plus size={20} weight="bold" />
                        Crear primer evento
                    </button>
                </div>
            )}

            {/* Botón flotante para scroll to top */}
            {showScrollToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-24 left-6 z-40 h-12 w-12 rounded-full bg-white text-brand-purple border-2 border-brand-purple shadow-md active:scale-pressed transition"
                    aria-label="Volver arriba"
                >
                    <ArrowUp size={20} weight="bold" className="m-auto" />
                </button>
            )}

            {/* Diálogo para editar nombre del hijo */}
            {showEditDialog && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowEditDialog(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Editar nombre</h3>
                            <button
                                onClick={() => setShowEditDialog(false)}
                                className="p-1 rounded-full hover:bg-gray-100 transition"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(updateChildName)} className="space-y-4">
                            <div>
                                <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del bebé
                                </label>
                                <input
                                    id="childName"
                                    type="text"
                                    {...register('childName', {
                                        required: 'El nombre es requerido',
                                        minLength: { value: 1, message: 'El nombre no puede estar vacío' }
                                    })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition"
                                    placeholder="Ingresa el nombre del bebé"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditDialog(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 bg-brand-purple text-white rounded-xl hover:bg-brand-purple/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} weight="bold" />
                                            Guardar
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
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

function TimelineItem({ entry, onClick }: { entry: EntryDoc & { _date: Date }; onClick?: () => void }) {
    const cat = getCategory(entry);
    const classes = categoryClasses(cat);
    const hasMedia = (entry.media?.length || 0) > 0;
    const thumb = hasMedia ? entry.media![0].url : '';

    const getBadgeLabel = (cat: Category) => {
        switch (cat) {
            case 'birth': return 'Nacimiento';
            case 'birthday': return 'Cumpleaños';
            case 'memory': return 'Recuerdo';
            default: return 'Hito';
        }
    };

    const getIconImage = (cat: Category) => {
        switch (cat) {
            case 'birth': return birthIcon;
            case 'birthday': return birthdayIcon;
            case 'memory': return memoryIcon;
            default: return milestoneIcon;
        }
    };

    const iconNode = (
        <div className="flex items-center justify-center h-full w-full rounded-full bg-white shadow-sm">
            <img
                src={getIconImage(cat)}
                alt={getBadgeLabel(cat)}
                className="w-8 h-8 object-contain"
            />
        </div>
    );



    return (
        <VerticalTimelineElement
            contentStyle={{
                background: '#FFFFFF',
                boxShadow: '0 10px 30px rgba(0,0,0,0.10)',
                borderRadius: '16px',
                border: '1px solid #F0ECE7',
                cursor: 'pointer'
            }}
            contentArrowStyle={{ borderRight: '7px solid #FFFFFF' }}
            date={format(entry._date, "d 'de' LLL, yyyy", { locale: es })}
            dateClassName={`timeline-date-${cat}`}
            icon={iconNode}
            iconStyle={{
                boxShadow: '0 0 0 4px rgba(209, 122, 34, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div className="cursor-pointer" onClick={onClick}>
                <div className="flex items-start gap-3">
                    <div className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-2 ${classes.ring} ${hasMedia ? '' : classes.bg}`}>
                        {hasMedia ? (
                            <img src={thumb} alt={entry.title} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-white">
                                <img
                                    src={getIconImage(cat)}
                                    alt={getBadgeLabel(cat)}
                                    className="w-10 h-10 object-contain"
                                />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="text-[15px] font-semibold leading-tight truncate">{entry.title}</div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-medium ${classes.bg} ${classes.fg}`}>
                                {getBadgeLabel(cat)}
                            </span>
                        </div>
                        {entry.description && (
                            <div className="text-[13px] text-text-muted leading-snug line-clamp-2">{entry.description}</div>
                        )}
                    </div>
                </div>
            </div>
        </VerticalTimelineElement>
    );
}

