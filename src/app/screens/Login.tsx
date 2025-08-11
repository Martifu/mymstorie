import { motion } from 'framer-motion';
import { GoogleLogo, Users, Heart, Camera, ArrowRight } from 'phosphor-react';

interface LoginProps {
    onSignIn: () => Promise<void>;
    loading: boolean;
}

export function Login({ onSignIn, loading }: LoginProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
            {/* Decoraciones de fondo */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-brand-purple/20 to-purple-300/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/4 -right-20 w-60 h-60 bg-gradient-to-br from-brand-blue/20 to-blue-300/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 left-1/4 w-50 h-50 bg-gradient-to-br from-brand-purple/20 to-brand-blue/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 flex flex-col justify-center flex-1 px-6 max-w-md mx-auto w-full">
                {/* Logo y título */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-brand-purple to-brand-blue rounded-3xl mx-auto mb-6 shadow-2xl flex items-center justify-center">
                        <Heart size={40} className="text-white" weight="fill" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent mb-3">
                        mymstorie
                    </h1>
                    <p className="text-gray-600 text-lg">Tu rincón familiar privado ✨</p>
                </motion.div>

                {/* Información sobre la app */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                            ¿Cómo funciona?
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-purple-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">1</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-700 font-medium">Regístrate con Google</p>
                                    <p className="text-gray-500 text-sm">Rápido, seguro y fácil</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">2</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-700 font-medium">Crea o únete a un espacio</p>
                                    <p className="text-gray-500 text-sm">Tu familia privada y segura</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">3</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-700 font-medium">Comparte momentos especiales</p>
                                    <p className="text-gray-500 text-sm">Recuerdos, objetivos e hitos</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Características destacadas */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-8"
                >
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-purple-600 rounded-xl mx-auto mb-2 flex items-center justify-center">
                                <Camera size={24} className="text-white" weight="duotone" />
                            </div>
                            <p className="text-xs font-medium text-gray-600">Recuerdos</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-blue-600 rounded-xl mx-auto mb-2 flex items-center justify-center">
                                <Users size={24} className="text-white" weight="duotone" />
                            </div>
                            <p className="text-xs font-medium text-gray-600">Familia</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-brand-blue rounded-xl mx-auto mb-2 flex items-center justify-center">
                                <Heart size={24} className="text-white" weight="duotone" />
                            </div>
                            <p className="text-xs font-medium text-gray-600">Privado</p>
                        </div>
                    </div>
                </motion.div>

                {/* Botón de login */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <button
                        onClick={onSignIn}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-brand-purple to-brand-blue hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 relative overflow-hidden"
                    >
                        {/* Efecto de brillo */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>

                        {loading ? (
                            <>
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Iniciando sesión...
                            </>
                        ) : (
                            <>
                                <GoogleLogo size={24} weight="bold" />
                                Continuar con Google
                                <ArrowRight size={20} weight="bold" />
                            </>
                        )}
                    </button>
                </motion.div>

                {/* Información adicional */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mt-6 text-center"
                >
                    <p className="text-gray-500 text-sm">
                        Al continuar, aceptas nuestros términos de servicio
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                        🔒 Tus datos están seguros y privados
                    </p>
                </motion.div>
            </div>

            {/* Indicador de versión */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="text-center pb-6"
            >
                <p className="text-gray-400 text-xs">v1.0.0 • mymstorie.vercel.app</p>
            </motion.div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
}
