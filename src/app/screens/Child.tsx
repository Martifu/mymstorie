import { useMemo, useRef, useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/useAuth';
import { useEntries, type EntryDoc } from '../../features/entries/useEntries';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUp, Plus, FlagBanner } from 'phosphor-react';
import birthdayIcon from '../../assets/birthday-icon.svg';
import milestoneIcon from '../../assets/milestone-icon.svg';
import memoryIcon from '../../assets/memory-icon.svg';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

type Category = 'memory' | 'birthday' | 'milestone';

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
    const [typeFilter, setTypeFilter] = useState<'all' | 'birthday' | 'milestone' | 'memory'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    // Usar sólo la colección de Hitos del hijo
    const { entries } = useEntries(spaceId, 'child_event');

    // Filtrar por tipo y búsqueda
    const events = useMemo(() => {
        return entries
            .filter((e) => e.type === 'child_event')
            .map((e) => ({ ...e, _date: asDate(e.date), _category: getCategory(e) }))
            .filter((e) => {
                // Filtro por tipo
                if (typeFilter !== 'all' && e._category !== typeFilter) return false;
                // Filtro por búsqueda
                if (searchTerm.trim()) {
                    const term = searchTerm.toLowerCase();
                    return e.title.toLowerCase().includes(term) ||
                        (e.description && e.description.toLowerCase().includes(term));
                }
                return true;
            })
            .sort((a, b) => b._date.getTime() - a._date.getTime());
    }, [entries, typeFilter, searchTerm]);

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

    // Build months list (YYYY-MM) having events
    const monthKeysDesc = useMemo(() => {
        const set = new Set(dayKeysDesc.map((d) => d.slice(0, 7)));
        return Array.from(set).sort((a, b) => (a < b ? 1 : -1));
    }, [dayKeysDesc]);

    const initialMonth = monthKeysDesc[0];
    const [selectedMonth, setSelectedMonth] = useState<string | undefined>(initialMonth);
    const daysInSelectedMonth = useMemo(
        () => dayKeysDesc.filter((d) => d.startsWith(selectedMonth || '')),
        [dayKeysDesc, selectedMonth]
    );
    const initialDay = daysInSelectedMonth[0];
    const [selectedDay, setSelectedDay] = useState<string | undefined>(initialDay);

    // Refs para hacer scroll a un día al tocarlo en la tira superior
    const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const scrollToDay = (key: string) => {
        setSelectedDay(key);
        const el = dayRefs.current[key];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Hijo</h2>
            </div>

            {/* Filtros y búsqueda */}
            <div className="space-y-3">
                <div className="flex gap-3">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        className="px-3 py-2 rounded-xl border bg-white text-sm"
                    >
                        <option value="all">Todos los tipos</option>
                        <option value="birthday">🎂 Cumpleaños</option>
                        <option value="milestone">🚩 Hitos</option>
                        <option value="memory">🖼️ Recuerdos</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Buscar eventos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border bg-white text-sm placeholder-text-muted"
                    />
                </div>
            </div>

            {/* Cabecera con meses y días (sólo los que tienen eventos) */}
            <div className="sticky top-0 z-10 bg-surface pt-2 -mx-4 px-4 pb-2 border-b">
                {/* Meses */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {monthKeysDesc.map((mk) => {
                        const dt = new Date(mk + '-01');
                        const label = format(dt, 'LLLL', { locale: es });
                        const isSel = selectedMonth === mk;
                        return (
                            <button
                                key={mk}
                                onClick={() => {
                                    setSelectedMonth(mk);
                                    const firstDayInMonth = dayKeysDesc.find((d) => d.startsWith(mk));
                                    if (firstDayInMonth) setSelectedDay(firstDayInMonth);
                                }}
                                className={`px-3 py-1.5 rounded-pill border whitespace-nowrap ${isSel ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white'
                                    }`}
                            >
                                {label.charAt(0).toUpperCase() + label.slice(1)}
                                <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-brand-purple align-middle" />
                            </button>
                        );
                    })}
                </div>
                {/* Días dentro del mes seleccionado */}
                <div className="flex gap-2 overflow-x-auto">
                    {daysInSelectedMonth.map((dk) => {
                        const dt = new Date(dk);
                        const isSel = selectedDay === dk;
                        return (
                            <button
                                key={dk}
                                onClick={() => scrollToDay(dk)}
                                className={`px-3 py-1.5 rounded-2xl border text-left ${isSel ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white'
                                    }`}
                            >
                                <div className="text-sm font-semibold leading-none">{format(dt, 'd')}</div>
                                <div className={`text-[11px] ${isSel ? 'text-white/90' : 'text-text-muted'}`}>
                                    {format(dt, 'EEE', { locale: es })}
                                </div>
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-purple" />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Timeline: TODOS los eventos, agrupados por día, del más reciente al más antiguo */}
            <div className="space-y-6">
                {dayKeysDesc.map((dk) => {
                    const dayDate = new Date(dk);
                    const items = (groupedByDay.get(dk) ?? []) as (EntryDoc & { _date: Date })[];
                    return (
                        <div key={dk} ref={(el) => { dayRefs.current[dk] = el; }}>
                            <div className="sticky top-[98px] z-0 -mx-4 px-4">
                                <div className="inline-block rounded-pill bg-brand-purple/10 text-brand-purple px-3 py-1 text-xs font-semibold">
                                    {format(dayDate, "d 'de' LLLL 'de' yyyy", { locale: es })}
                                </div>
                            </div>
                            <div className="mt-3">
                                <VerticalTimeline animate={false} lineColor="#EAE7E3" layout="1-column">
                                    {items.map((e, idx) => (
                                        <motion.div
                                            key={e.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: '0px 0px -20% 0px' }}
                                            transition={{ duration: 0.25, delay: idx * 0.03 }}
                                        >
                                            <TimelineItem
                                                entry={e}
                                                onClick={() => window.location.href = `/memories/${spaceId}/${e.id}`}
                                            />
                                        </motion.div>
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
                        {typeFilter === 'all' ? 'No hay eventos aún' :
                            typeFilter === 'birthday' ? 'No hay cumpleaños registrados' :
                                typeFilter === 'milestone' ? 'No hay hitos registrados' :
                                    'No hay recuerdos del hijo'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                        {typeFilter === 'all' ? 'Comienza registrando los primeros momentos especiales de tu pequeño' :
                            typeFilter === 'birthday' ? 'Registra los cumpleaños y celebraciones especiales' :
                                typeFilter === 'milestone' ? 'Documenta los logros y hitos importantes' :
                                    'Guarda los recuerdos más preciados de tu hijo'}
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
            <AnimatePresence>
                {showScrollToTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        onClick={scrollToTop}
                        className="fixed bottom-24 left-6 z-40 h-12 w-12 rounded-full bg-white text-brand-purple border-2 border-brand-purple shadow-md active:scale-pressed transition"
                        aria-label="Volver arriba"
                    >
                        <ArrowUp size={20} weight="bold" className="m-auto" />
                    </motion.button>
                )}
            </AnimatePresence>
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
            case 'birthday': return 'Cumpleaños';
            case 'memory': return 'Recuerdo';
            default: return 'Hito';
        }
    };

    const getIconImage = (cat: Category) => {
        switch (cat) {
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

