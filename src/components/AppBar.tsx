import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MagnifyingGlass } from 'phosphor-react';
import { useState, useEffect } from 'react';

interface AppBarProps {
    title: string;
    subtitle?: string;
    showSearch?: boolean;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    actionButton?: {
        label: string;
        to: string;
        color?: 'purple' | 'blue' | 'gold';
    };
    children?: React.ReactNode;
    fixedHeader?: boolean; // Nueva prop para hacer solo el header principal fixed
}

const colorClasses = {
    purple: 'text-brand-purple',
    blue: 'text-brand-blue',
    gold: 'text-brand-gold'
};

export function AppBar({
    title,
    subtitle,
    showSearch = false,
    searchPlaceholder = "Buscar...",
    searchValue = "",
    onSearchChange,
    actionButton,
    children,
    fixedHeader = false
}: AppBarProps) {
    const [localSearchValue, setLocalSearchValue] = useState(searchValue);
    const [isScrolled, setIsScrolled] = useState(false);

    // Detectar scroll cuando fixedHeader está habilitado
    useEffect(() => {
        if (!fixedHeader) return;

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [fixedHeader]);

    const handleSearchChange = (value: string) => {
        setLocalSearchValue(value);
        onSearchChange?.(value);
    };

    const containerClasses = fixedHeader
        ? `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
            ? 'bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200'
            : 'bg-transparent'
        } px-4 pt-4 pb-2`
        : 'mb-6';

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={containerClasses}
            >
                {/* Header principal */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-brand-purple">mymstorie</h1>
                                <p className="text-sm text-text-muted">Tu rincón familiar privado ✨</p>
                            </div>
                            {showSearch && (
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={searchPlaceholder}
                                        value={localSearchValue}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="w-48 pl-10 pr-4 py-2 rounded-pill border border-gray-200 bg-white text-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition"
                                    />
                                    <MagnifyingGlass
                                        size={18}
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"
                                        weight="regular"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sección de título de página y acción */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                        {subtitle && (
                            <p className="text-sm text-text-muted mt-1">{subtitle}</p>
                        )}
                    </div>
                    {actionButton && (
                        <Link
                            to={actionButton.to}
                            className={`font-semibold hover:underline transition ${colorClasses[actionButton.color || 'purple']}`}
                        >
                            {actionButton.label}
                        </Link>
                    )}
                </motion.div>

                {/* Contenido adicional (filtros, etc.) */}
                {children && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="mt-4"
                    >
                        {children}
                    </motion.div>
                )}
            </motion.div>
            {/* Espaciador cuando el AppBar es fixed */}
            {fixedHeader && (
                <div className="h-24" />
            )}
        </>
    );
}
