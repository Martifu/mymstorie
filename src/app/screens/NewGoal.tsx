
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { createGoal } from '../../features/entries/entriesService';
import { TextT, Tag, ArrowLeft } from 'phosphor-react';
import { motion } from 'framer-motion';

type FormValues = {
    title: string;
    goalCategory: 'viaje' | 'actividad' | 'logro';
    goalIcon: string;
};

const categoryIcons = {
    viaje: ['✈️', '🏖️', '🗺️', '🎒', '🚗', '🏔️', '🌍', '🚢',
        '🏝️', '🎡', '🎢', '🎠', '🗽', '🏰', '🗼', '⛵',
        '🚁', '🎿', '🏄', '🚵', '🧗', '🎣', '⛺', '🎪'],
    actividad: ['⚽', '🎨', '📚', '🎵', '🍳', '🧘', '🎭', '🎪',
        '🏃', '🏊', '🚴', '🧗', '🎸', '🎹', '🎤', '🎬',
        '📷', '🎮', '🧩', '🎲', '♟️', '🎳', '🏓', '🏸'],
    logro: ['🎯', '🏆', '💪', '🌟', '🎓', '💰', '🏅', '🔥',
        '💎', '👑', '🚀', '🏠', '🌈', '💡', '🎊', '🎉',
        '📈', '💯', '✨', '🎖️', '🏵️', '🥇', '🥈', '🥉']
};

const categoryColors = {
    viaje: 'bg-purple-100 border-purple-400 text-purple-800',
    actividad: 'bg-orange-100 border-orange-400 text-orange-800',
    logro: 'bg-blue-100 border-blue-400 text-blue-800'
};

export default function NewGoal() {
    const { spaceId } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const prefilledTitle = location.state?.prefilledTitle || '';

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
        defaultValues: {
            goalCategory: 'logro',
            goalIcon: '🎯',
            title: prefilledTitle
        }
    });

    const selectedCategory = watch('goalCategory');
    const selectedIcon = watch('goalIcon');

    const handleCategoryChange = (category: 'viaje' | 'actividad' | 'logro') => {
        setValue('goalCategory', category);
        // Cambiar icono por defecto según categoría
        const defaultIcons = { viaje: '✈️', actividad: '⚽', logro: '🎯' };
        setValue('goalIcon', defaultIcons[category]);
    };

    const onSubmit = handleSubmit(async (values) => {
        if (!spaceId) return;

        const fd = new FormData();
        fd.append('title', values.title);
        fd.append('goalCategory', values.goalCategory);
        fd.append('goalIcon', values.goalIcon);
        fd.append('status', 'pending'); // Nuevo objetivo siempre empieza como pendiente

        try {
            await createGoal(spaceId, fd);
            navigate('/goals');
        } catch (error) {
            console.error('Error al crear objetivo:', error);
        }
    });

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="mx-auto max-w-screen-sm">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-4 p-4 pb-2"
                >
                    <button
                        onClick={() => navigate('/goals')}
                        className="p-2 rounded-full bg-white shadow-sm border hover:bg-gray-50 transition"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Nuevo Objetivo</h1>
                        <p className="text-sm text-gray-500">Define tu próxima meta familiar</p>
                    </div>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    onSubmit={onSubmit}
                    className="p-4 space-y-6"
                >
                    {/* Título */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                            <TextT size={16} className="text-brand-blue" weight="bold" />
                            Título del objetivo
                        </label>
                        <input
                            className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition"
                            placeholder="¿Qué quieres lograr?"
                            {...register('title', { required: 'El título es requerido' })}
                        />
                        {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                            <Tag size={16} className="text-brand-blue" weight="bold" />
                            Categoría
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { k: 'viaje', l: 'Viaje', desc: 'Aventuras y destinos por explorar', emoji: '✈️' },
                                { k: 'actividad', l: 'Actividad', desc: 'Hobbies y actividades familiares', emoji: '⚽' },
                                { k: 'logro', l: 'Logro', desc: 'Metas personales y familiares', emoji: '🎯' },
                            ].map(({ k, l, desc, emoji }) => (
                                <motion.div
                                    key={k}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleCategoryChange(k as 'viaje' | 'actividad' | 'logro')}
                                    className={`flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all ${selectedCategory === k
                                        ? categoryColors[k as keyof typeof categoryColors] + ' shadow-md'
                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        value={k}
                                        className="sr-only"
                                        {...register('goalCategory', { required: true })}
                                        checked={selectedCategory === k}
                                        readOnly
                                    />
                                    <div className="text-2xl">{emoji}</div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-sm">{l}</div>
                                        <div className="text-xs text-gray-500">{desc}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Selección de icono */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Icono del objetivo
                        </label>
                        <div className="bg-white rounded-xl border p-4">
                            <div className="text-center mb-3">
                                <div className="text-4xl mb-2">{selectedIcon}</div>
                                <p className="text-xs text-gray-500">Icono seleccionado</p>
                            </div>
                            <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto scrollbar-hide">
                                {categoryIcons[selectedCategory].map((icon, index) => (
                                    <motion.button
                                        key={icon}
                                        type="button"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.2, delay: index * 0.02 }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setValue('goalIcon', icon)}
                                        className={`p-2 rounded-lg text-xl transition-all ${selectedIcon === icon
                                            ? 'bg-brand-blue/20 ring-2 ring-brand-blue/50'
                                            : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        {icon}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Botón de crear */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-brand-blue text-white py-4 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {isSubmitting ? 'Creando objetivo...' : 'Crear objetivo'}
                    </motion.button>

                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            Podrás completar este objetivo más tarde agregando fotos y comentarios
                        </p>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}