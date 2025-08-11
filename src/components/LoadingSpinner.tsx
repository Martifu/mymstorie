import { motion } from 'framer-motion';
import { Heart, Spinner } from 'phosphor-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    variant?: 'default' | 'heart' | 'dots' | 'pulse';
    className?: string;
}

export function LoadingSpinner({
    size = 'md',
    text,
    variant = 'default',
    className = ''
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    if (variant === 'heart') {
        return (
            <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="text-pink-500"
                >
                    <Heart size={size === 'sm' ? 24 : size === 'md' ? 32 : 40} weight="fill" />
                </motion.div>
                {text && (
                    <p className={`text-gray-600 font-medium ${textSizes[size]}`}>
                        {text}
                    </p>
                )}
            </div>
        );
    }

    if (variant === 'dots') {
        return (
            <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [0, -8, 0],
                                opacity: [0.4, 1, 0.4]
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut"
                            }}
                            className={`bg-gradient-to-r from-purple-500 to-pink-500 rounded-full ${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
                                }`}
                        />
                    ))}
                </div>
                {text && (
                    <p className={`text-gray-600 font-medium ${textSizes[size]}`}>
                        {text}
                    </p>
                )}
            </div>
        );
    }

    if (variant === 'pulse') {
        return (
            <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={`bg-gradient-to-r from-purple-500 to-pink-500 rounded-full ${sizeClasses[size]}`}
                />
                {text && (
                    <p className={`text-gray-600 font-medium ${textSizes[size]}`}>
                        {text}
                    </p>
                )}
            </div>
        );
    }

    // Default spinner
    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div className={`relative ${sizeClasses[size]}`}>
                <div className={`absolute inset-0 border-4 border-gray-200 rounded-full ${sizeClasses[size]}`}></div>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-0 border-4 border-transparent border-t-purple-500 border-r-pink-500 rounded-full ${sizeClasses[size]}`}
                />
            </div>
            {text && (
                <p className={`text-gray-600 font-medium ${textSizes[size]}`}>
                    {text}
                </p>
            )}
        </div>
    );
}

// Componente para pantallas de carga completas
export function FullScreenLoader({ text = "Cargando...", variant = 'heart' }: { text?: string; variant?: 'heart' | 'dots' | 'pulse' }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
            <LoadingSpinner
                size="lg"
                text={text}
                variant={variant}
                className="p-8"
            />
        </div>
    );
}
