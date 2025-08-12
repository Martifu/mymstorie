import { motion } from 'framer-motion';
import { Users, Heart, Camera, ArrowRight, Eye, EyeSlash, Envelope, Lock, UserPlus, Key } from 'phosphor-react';
import { useState } from 'react';

interface LoginProps {
    onSignIn: (email: string, password: string) => Promise<void>;
    onSignUp: (email: string, password: string, displayName: string) => Promise<void>;
    onResetPassword: (email: string) => Promise<void>;
    loading: boolean;
}

export function Login({ onSignIn, onSignUp, onResetPassword, loading }: LoginProps) {
    const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (mode === 'login') {
                await onSignIn(email, password);
            } else if (mode === 'register') {
                if (!displayName.trim()) {
                    setError('Por favor ingresa tu nombre');
                    return;
                }
                await onSignUp(email, password, displayName);
            } else if (mode === 'reset') {
                await onResetPassword(email);
                setError('');
                alert('Se ha enviado un email para restablecer tu contraseña');
                setMode('login');
            }
        } catch (error: any) {
            setError(getErrorMessage(error.code));
        }
    };

    const getErrorMessage = (errorCode: string) => {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'No existe una cuenta con este email';
            case 'auth/wrong-password':
                return 'Contraseña incorrecta';
            case 'auth/email-already-in-use':
                return 'Ya existe una cuenta con este email';
            case 'auth/weak-password':
                return 'La contraseña debe tener al menos 6 caracteres';
            case 'auth/invalid-email':
                return 'Email inválido';
            default:
                return 'Error de autenticación. Inténtalo de nuevo.';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
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
                    className="text-center mb-8"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-brand-purple to-brand-blue rounded-3xl mx-auto mb-4 shadow-2xl flex items-center justify-center">
                        <Heart size={32} className="text-white" weight="fill" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent mb-2">
                        mymstorie
                    </h1>
                    <p className="text-gray-600">Tu rincón familiar privado ✨</p>
                </motion.div>

                {/* Formulario */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-6"
                >
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                        <div className="flex mb-6">
                            <button
                                type="button"
                                onClick={() => setMode('login')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'login'
                                    ? 'bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Iniciar Sesión
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('register')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ml-2 ${mode === 'register'
                                    ? 'bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Registrarse
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === 'register' && (
                                <div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <UserPlus size={20} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Tu nombre"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple focus:border-transparent bg-white/80 backdrop-blur-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                        <Envelope size={20} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple focus:border-transparent bg-white/80 backdrop-blur-sm"
                                        required
                                    />
                                </div>
                            </div>

                            {mode !== 'reset' && (
                                <div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <Lock size={20} className="text-gray-400" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Contraseña"
                                            className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple focus:border-transparent bg-white/80 backdrop-blur-sm"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showPassword ? (
                                                <EyeSlash size={20} className="text-gray-400" />
                                            ) : (
                                                <Eye size={20} className="text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-brand-purple to-brand-blue hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        {mode === 'login' ? 'Iniciando...' : mode === 'register' ? 'Registrando...' : 'Enviando...'}
                                    </>
                                ) : (
                                    <>
                                        {mode === 'login' ? (
                                            <>
                                                <ArrowRight size={20} />
                                                Iniciar Sesión
                                            </>
                                        ) : mode === 'register' ? (
                                            <>
                                                <UserPlus size={20} />
                                                Crear Cuenta
                                            </>
                                        ) : (
                                            <>
                                                <Key size={20} />
                                                Enviar Email
                                            </>
                                        )}
                                    </>
                                )}
                            </button>

                            {mode === 'login' && (
                                <button
                                    type="button"
                                    onClick={() => setMode('reset')}
                                    className="w-full text-sm text-gray-600 hover:text-brand-purple transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            )}

                            {mode === 'reset' && (
                                <button
                                    type="button"
                                    onClick={() => setMode('login')}
                                    className="w-full text-sm text-gray-600 hover:text-brand-purple transition-colors"
                                >
                                    Volver al inicio de sesión
                                </button>
                            )}
                        </form>
                    </div>
                </motion.div>

                {/* Características destacadas */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-6"
                >
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-brand-purple to-purple-600 rounded-xl mx-auto mb-2 flex items-center justify-center">
                                <Camera size={20} className="text-white" weight="duotone" />
                            </div>
                            <p className="text-xs font-medium text-gray-600">Recuerdos</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-blue-600 rounded-xl mx-auto mb-2 flex items-center justify-center">
                                <Users size={20} className="text-white" weight="duotone" />
                            </div>
                            <p className="text-xs font-medium text-gray-600">Familia</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-brand-purple to-brand-blue rounded-xl mx-auto mb-2 flex items-center justify-center">
                                <Heart size={20} className="text-white" weight="duotone" />
                            </div>
                            <p className="text-xs font-medium text-gray-600">Privado</p>
                        </div>
                    </div>
                </motion.div>

                {/* Información adicional */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-center"
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
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center pb-6"
            >
                <p className="text-gray-400 text-xs">v1.0.0 • mymstorie.vercel.app</p>
            </motion.div>
        </div>
    );
}
