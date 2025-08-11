import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { useEntries } from '../../features/entries/useEntries';
import { EntryCard, AppBar } from '../../components';
import { Camera, Plus } from 'phosphor-react';
import { motion } from 'framer-motion';

export function Memories() {
    const { spaceId } = useAuth();
    const { entries } = useEntries(spaceId, 'memory');
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <AppBar
                title="Recuerdos"
                subtitle="Tus momentos familiares más preciados"
                actionButton={{
                    label: "Nuevo",
                    to: "/memories/new",
                    color: "purple"
                }}
            />
            {entries.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-2 gap-3"
                >
                    {entries.map((e, index) => (
                        <motion.div
                            key={e.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.05 * index }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        >
                            <EntryCard
                                entry={{ id: e.id, type: e.type, title: e.title, description: e.description, date: String((e as any).date?.toDate?.() ?? e.date), media: e.media }}
                                onClick={() => window.location.href = `/memories/${spaceId}/${e.id}`}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-8 text-center py-16"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2, type: "spring", bounce: 0.3 }}
                        className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-purple/10 flex items-center justify-center"
                    >
                        <Camera size={32} className="text-brand-purple" weight="fill" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hay recuerdos aún
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                        Comienza guardando tus primeros momentos familiares especiales
                    </p>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="px-4"
                    >
                        <Link
                            to="/memories/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-purple text-white rounded-xl font-medium hover:bg-brand-purple/90 transition shadow-sm hover:scale-105 active:scale-95"
                        >
                            <Plus size={20} weight="bold" />
                            Crear primer recuerdo
                        </Link>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}


