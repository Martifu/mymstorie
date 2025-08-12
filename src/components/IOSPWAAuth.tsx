import { motion } from 'framer-motion';
import { auth } from '../lib/firebase';

interface IOSPWAAuthProps {
    onAuthCheck: () => void;
}

export function IOSPWAAuth({ onAuthCheck }: IOSPWAAuthProps) {
    const handleOpenSafari = () => {
        const currentUrl = window.location.origin;
        window.open(currentUrl, '_blank');
    };

    const handleCheckAuth = () => {
        console.log('Checking auth state manually...');
        if (auth.currentUser) {
            console.log('Found authenticated user:', auth.currentUser.displayName);
            onAuthCheck();
        } else {
            console.log('No authenticated user found');
            alert('No se detectó una sesión activa. Asegúrate de haber iniciado sesión en Safari y vuelve a intentarlo.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-sm mx-auto text-center"
            >
                {/* Icono */}
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🔐</span>
                </div>

                {/* Título */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Iniciar Sesión
                </h2>

                {/* Descripción */}
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Para iniciar sesión desde la app instalada, necesitas abrir Safari y luego regresar aquí.
                </p>

                {/* Instrucciones */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-left">
                    <h3 className="font-semibold text-blue-900 mb-3">📝 Instrucciones:</h3>
                    <ol className="text-sm text-blue-800 space-y-2">
                        <li>1. Presiona "Abrir en Safari"</li>
                        <li>2. Inicia sesión con Google</li>
                        <li>3. Regresa a esta app</li>
                        <li>4. Presiona "Ya inicié sesión"</li>
                    </ol>
                </div>

                {/* Botones */}
                <div className="space-y-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleOpenSafari}
                        className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold shadow-md hover:bg-blue-700 transition"
                    >
                        🌐 Abrir en Safari
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCheckAuth}
                        className="w-full bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-200 transition"
                    >
                        ✅ Ya inicié sesión
                    </motion.button>
                </div>

                {/* Nota */}
                <p className="text-xs text-gray-500 mt-6">
                    Este paso adicional es necesario por las restricciones de seguridad de iOS
                </p>
            </motion.div>
        </div>
    );
}
