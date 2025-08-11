import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MagnifyingGlass } from 'phosphor-react';
import { useState } from 'react';

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
    children
}: AppBarProps) {
    const [localSearchValue, setLocalSearchValue] = useState(searchValue);

    const handleSearchChange = (value: string) => {
        setLocalSearchValue(value);
        onSearchChange?.(value);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
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
    );
}
