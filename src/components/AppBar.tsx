import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface AppBarProps {
    actionButton?: {
        label: string;
        to: string;
        color?: 'purple' | 'blue' | 'gold';
    };
}

const colorClasses = {
    purple: 'text-brand-purple',
    blue: 'text-brand-blue',
    gold: 'text-brand-gold'
};

export function AppBar({
    actionButton
}: AppBarProps) {
    const [isScrolled, setIsScrolled] = useState(false);

    // Detectar scroll para el header fixed
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const containerClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-white/80 backdrop-blur-2xl shadow-2xl shadow-black/5 border-b border-white/20'
        : 'bg-transparent'
        } px-4 pt-4 pb-2`;

    return (
        <>
            <div className={containerClasses}>
                {/* Header principal */}
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div>
                            <h1 className="text-2xl font-bold text-brand-purple">mymstorie</h1>
                            <p className="text-sm text-text-muted">Tu rincón familiar privado ✨</p>
                        </div>
                    </div>
                    {actionButton && (
                        <Link
                            to={actionButton.to}
                            className={`font-semibold hover:underline transition ${colorClasses[actionButton.color || 'purple']}`}
                        >
                            {actionButton.label}
                        </Link>
                    )}
                </div>
            </div>
            {/* Espaciador cuando el AppBar es fixed */}
            <div className="h-16" />
        </>
    );
}
