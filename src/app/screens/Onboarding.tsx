import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Camera, Heart, Users, Target, Baby, Calendar } from 'phosphor-react';

interface OnboardingProps {
    onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [currentPage, setCurrentPage] = useState(0);

    const pages = [
        {
            id: 1,
            title: "Tu rincón familiar privado",
            subtitle: "Guarda y comparte los momentos más especiales de tu familia",
            description: "mymstorie es el lugar perfecto para crear, organizar y revivir todos esos momentos únicos que hacen especial a tu familia.",
            icon: <Heart size={80} className="text-brand-purple" weight="duotone" />,
            gradient: "from-brand-purple to-purple-600",
            features: [
                { icon: <Camera size={20} />, text: "Recuerdos con fotos y videos" },
                { icon: <Users size={20} />, text: "Comparte con toda la familia" },
                { icon: <Heart size={20} />, text: "Momentos privados y seguros" }
            ]
        },
        {
            id: 2,
            title: "Organiza la vida familiar",
            subtitle: "Objetivos, hitos y recuerdos en un solo lugar",
            description: "Desde los primeros pasos del bebé hasta las metas familiares, mantén todo organizado y nunca olvides los momentos importantes.",
            icon: <Target size={80} className="text-brand-blue" weight="duotone" />,
            gradient: "from-brand-blue to-blue-600",
            features: [
                { icon: <Target size={20} />, text: "Objetivos familiares" },
                { icon: <Baby size={20} />, text: "Hitos del crecimiento" },
                { icon: <Calendar size={20} />, text: "Línea de tiempo visual" }
            ]
        },
        {
            id: 3,
            title: "Conecta con tu familia",
            subtitle: "Crea o únete a espacios familiares privados",
            description: "Invita a tu pareja, padres y familiares cercanos para que todos puedan participar y disfrutar juntos de estos momentos especiales.",
            icon: <Users size={80} className="text-brand-purple" weight="duotone" />,
            gradient: "from-brand-purple to-brand-blue",
            features: [
                { icon: <Users size={20} />, text: "Espacios familiares privados" },
                { icon: <Heart size={20} />, text: "Invitaciones por código" },
                { icon: <Camera size={20} />, text: "Todos pueden contribuir" }
            ]
        }
    ];

    const nextPage = () => {
        if (currentPage < pages.length - 1) {
            setCurrentPage(currentPage + 1);
        } else {
            onComplete();
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToPage = (index: number) => {
        setCurrentPage(index);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col">
            {/* Header con logo */}
            <div className="pt-12 pb-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">mymstorie</h1>
                    <div className="w-12 h-1 bg-gradient-to-r from-brand-purple to-brand-blue rounded-full mx-auto"></div>
                </motion.div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="text-center"
                    >
                        {/* Icono principal con gradiente */}
                        <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${pages[currentPage].gradient} p-6 mx-auto mb-8 shadow-xl`}>
                            <div className="w-full h-full flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-2xl">
                                {pages[currentPage].icon}
                            </div>
                        </div>

                        {/* Título y descripción */}
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            {pages[currentPage].title}
                        </h2>

                        <h3 className="text-lg font-medium text-gray-600 mb-4">
                            {pages[currentPage].subtitle}
                        </h3>

                        <p className="text-gray-500 leading-relaxed mb-8 px-2">
                            {pages[currentPage].description}
                        </p>

                        {/* Features */}
                        <div className="space-y-4 mb-8">
                            {pages[currentPage].features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                                    className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-sm"
                                >
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${pages[currentPage].gradient} flex items-center justify-center text-white`}>
                                        {feature.icon}
                                    </div>
                                    <span className="text-gray-700 font-medium">{feature.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Indicadores de página */}
            <div className="flex justify-center gap-2 mb-6">
                {pages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToPage(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentPage
                            ? `bg-gradient-to-r ${pages[currentPage].gradient} shadow-lg`
                            : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                    />
                ))}
            </div>

            {/* Botones de navegación */}
            <div className="flex justify-between items-center px-6 pb-8">
                <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${currentPage === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                        }`}
                >
                    <ArrowLeft size={20} />
                    Anterior
                </button>

                <button
                    onClick={nextPage}
                    className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 bg-gradient-to-r ${pages[currentPage].gradient}`}
                >
                    {currentPage === pages.length - 1 ? (
                        <>
                            Comenzar
                            <Heart size={20} weight="fill" />
                        </>
                    ) : (
                        <>
                            Siguiente
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </div>

            {/* Decoraciones de fondo */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-brand-purple/20 to-purple-300/20 rounded-full opacity-60 blur-xl"></div>
            <div className="absolute bottom-40 right-10 w-16 h-16 bg-gradient-to-br from-brand-blue/20 to-blue-300/20 rounded-full opacity-60 blur-xl"></div>
            <div className="absolute top-1/2 left-5 w-12 h-12 bg-gradient-to-br from-brand-purple/20 to-brand-blue/20 rounded-full opacity-60 blur-xl"></div>
        </div>
    );
}
