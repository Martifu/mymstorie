import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { updateGoalStatus } from '../../features/entries/entriesService';
import { useEntries } from '../../features/entries/useEntries';
import { ChatText, ArrowLeft, CheckCircle, Camera } from 'phosphor-react';
import { motion } from 'framer-motion';
import { FileUpload } from '../../components/FileUpload';
import imageCompression from 'browser-image-compression';

interface FileWithPreview extends File {
    preview?: string;
}

type FormValues = {
    description: string;
};

export function CompleteGoal() {
    const { goalId } = useParams<{ goalId: string }>();
    const { spaceId } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

    // Obtener todos los objetivos y buscar el específico
    const { entries } = useEntries(spaceId, 'goal');
    const currentGoal = entries.find(goal => goal.id === goalId);

    // Datos del objetivo actual
    const goalData = {
        title: currentGoal?.title || 'Objetivo',
        goalCategory: (currentGoal as any)?.goalCategory || 'logro',
        goalIcon: (currentGoal as any)?.goalIcon || '🎯'
    };

    // Redirigir si no se encuentra el objetivo o ya está completado
    useEffect(() => {
        if (entries.length > 0 && (!currentGoal || (currentGoal as any).status === 'completed')) {
            navigate('/goals');
        }
    }, [currentGoal, entries, navigate]);

    async function compress(file: File): Promise<File> {
        const compressed = await imageCompression(file, { maxWidthOrHeight: 1440, initialQuality: 0.82, useWebWorker: true });
        return new File([compressed], file.name, { type: compressed.type });
    }

    const onSubmit = handleSubmit(async (values) => {
        if (!spaceId || !goalId) return;

        // Procesar archivos seleccionados
        const mediaFiles: File[] = [];
        for (const f of files.slice(0, 10)) {
            const isImage = f.type.startsWith('image/');
            const fileToUpload = isImage ? await compress(f) : f;
            mediaFiles.push(fileToUpload);
        }

        try {
            await updateGoalStatus(
                spaceId,
                goalId,
                'completed',
                values.description,
                mediaFiles,
                (fileName, progress) => {
                    setUploadProgress(prev => ({ ...prev, [fileName]: progress }));
                }
            );

            // Limpiar archivos después de envío exitoso
            files.forEach(file => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
            setFiles([]);
            setUploadProgress({});

            navigate('/goals');
        } catch (error) {
            console.error('Error al completar objetivo:', error);
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
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-900">¡Completar Objetivo!</h1>
                        <p className="text-sm text-gray-500">Celebra tu logro con fotos y comentarios</p>
                    </div>
                    <div className="text-3xl">{goalData.goalIcon}</div>
                </motion.div>

                {/* Objetivo info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mx-4 mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <CheckCircle size={24} className="text-emerald-600" weight="fill" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-emerald-800">{goalData.title}</h3>
                            <p className="text-sm text-emerald-600">¡Estás a punto de completar este objetivo!</p>
                        </div>
                    </div>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    onSubmit={onSubmit}
                    className="p-4 space-y-6"
                >
                    {/* Comentarios */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                            <ChatText size={16} className="text-brand-blue" weight="bold" />
                            Comentarios sobre tu logro
                        </label>
                        <textarea
                            className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 transition"
                            rows={4}
                            placeholder="Cuéntanos cómo fue lograr este objetivo, qué aprendiste, cómo te sientes..."
                            {...register('description', { required: 'Los comentarios son requeridos para completar el objetivo' })}
                        />
                        {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
                    </div>

                    {/* Multimedia */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                            <Camera size={16} className="text-brand-blue" weight="bold" />
                            Fotos o video de tu logro (requerido)
                        </label>
                        <FileUpload
                            files={files}
                            onChange={setFiles}
                            uploadProgress={uploadProgress}
                            isUploading={isSubmitting}
                            maxFiles={10}
                        />
                        {files.length === 0 && (
                            <p className="text-sm text-amber-600 mt-2">
                                📸 Agrega al menos una foto para documentar tu logro
                            </p>
                        )}
                    </div>

                    {/* Botón de completar */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting || files.length === 0}
                        className="w-full rounded-xl bg-gradient-to-r from-brand-purple to-purple-600 text-white py-4 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:from-brand-purple/90 hover:to-purple-700"
                    >
                        {isSubmitting ? 'Completando objetivo...' : '🎉 ¡Completar objetivo!'}
                    </motion.button>

                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            Una vez completado, el objetivo se marcará como logrado y aparecerá en tu historial de éxitos
                        </p>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}
