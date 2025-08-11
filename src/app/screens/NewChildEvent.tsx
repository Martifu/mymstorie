import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { createChildEvent } from '../../features/entries/entriesService';
import { markChildAsBorn } from '../../features/child/childProfileService';
import { useChildProfile } from '../../features/child/useChildProfile';
import { TextT, ChatText, Calendar, Tag, User, GenderIntersex } from 'phosphor-react';
import birthdayIcon from '../../assets/birthday-icon.svg';
import milestoneIcon from '../../assets/milestone-icon.svg';
import memoryIcon from '../../assets/memory-icon.svg';
import birthIcon from '../../assets/birth-icon.svg';
import { FileUpload } from '../../components/FileUpload';
import imageCompression from 'browser-image-compression';
import { motion } from 'framer-motion';

interface FileWithPreview extends File {
    preview?: string;
}

type FormValues = {
    title: string;
    description?: string;
    date: string;
    childCategory: 'birthday' | 'milestone' | 'memory' | 'birth';
    childName?: string;
    childGender?: 'male' | 'female';
};

export default function NewChildEvent() {
    const { spaceId } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const prefilledTitle = location.state?.prefilledTitle || '';
    const { isChildBorn } = useChildProfile(spaceId);
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
        defaultValues: {
            childCategory: 'milestone',
            childGender: 'male',
            title: prefilledTitle
        }
    });
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

    const selectedCategory = watch('childCategory');

    async function compress(file: File): Promise<File> {
        const compressed = await imageCompression(file, { maxWidthOrHeight: 1440, initialQuality: 0.82, useWebWorker: true });
        return new File([compressed], file.name, { type: compressed.type });
    }



    const onSubmit = handleSubmit(async (values) => {
        if (!spaceId) return;
        console.log('Formulario enviado con valores:', values);
        const fd = new FormData();
        if (values.title) fd.append('title', values.title);
        if (values.description) fd.append('description', values.description);
        fd.append('date', values.date);
        fd.append('childCategory', values.childCategory);

        // Agregar datos específicos del nacimiento
        if (values.childCategory === 'birth') {
            if (values.childName) fd.append('childName', values.childName);
            if (values.childGender) fd.append('childGender', values.childGender);
        }

        console.log('Categoría seleccionada:', values.childCategory);
        // para compatibilidad con lógica previa
        if (values.childCategory === 'birthday') fd.append('milestoneType', 'first_birthday');

        // Procesar archivos seleccionados
        for (const f of files.slice(0, 10)) {
            const isImage = f.type.startsWith('image/');
            const fileToUpload = isImage ? await compress(f) : f;
            fd.append('media', fileToUpload, f.name);
        }

        try {
            // Función para manejar el evento de nacimiento
            const handleBirthEvent = async (name: string, gender: 'male' | 'female', birthDate: Date) => {
                await markChildAsBorn(spaceId, name, gender, birthDate);
            };

            await createChildEvent(
                spaceId,
                fd,
                (fileName, progress) => {
                    setUploadProgress((prev: { [key: string]: number }) => ({ ...prev, [fileName]: progress }));
                },
                values.childCategory === 'birth' ? handleBirthEvent : undefined
            );

            // Limpiar archivos después de envío exitoso
            files.forEach(file => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
            setFiles([]);
            setUploadProgress({});

            navigate('/child');
        } catch (error) {
            console.error('Error al crear evento del hijo:', error);
        }
    });

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <h2 className="text-xl font-semibold mb-2">Nuevo evento del hijo</h2>
            <form onSubmit={onSubmit} className="p-4 space-y-4">
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-1">
                        <TextT size={16} className="text-brand-blue" weight="bold" />
                        Título
                    </label>
                    <input className="mt-1 w-full rounded-xl border p-3" placeholder="¿Qué pasó?" {...register('title', { required: true })} />
                    {errors.title && <p className="text-error text-sm mt-1">Escribe un título.</p>}
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-1">
                        <ChatText size={16} className="text-brand-blue" weight="bold" />
                        Comentarios
                    </label>
                    <textarea className="mt-1 w-full rounded-xl border p-3" rows={4} placeholder="Detalles del momento" {...register('description')} />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-1">
                        <Tag size={16} className="text-brand-blue" weight="bold" />
                        Tipo
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Opción de Nacimiento - solo si el hijo no ha nacido */}
                        {!isChildBorn && (
                            <motion.label
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className={`flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all ${selectedCategory === 'birth'
                                    ? 'bg-emerald-100 border-emerald-400 shadow-md'
                                    : 'bg-white border-gray-200 hocus:bg-emerald-50 hocus:border-emerald-300'
                                    }`}
                            >
                                <input type="radio" value="birth" className="sr-only" {...register('childCategory', { required: true })} />
                                <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-full bg-white shadow-sm">
                                    <img
                                        src={birthIcon}
                                        alt="Nacimiento"
                                        className="w-6 h-6 object-contain text-emerald-600"
                                    />
                                </div>
                                <div>
                                    <span className="text-sm font-medium">🎉 Nacimiento</span>
                                    <p className="text-xs text-gray-500">¡Ha llegado tu bebé!</p>
                                </div>
                            </motion.label>
                        )}

                        <label className={`flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all ${selectedCategory === 'birthday'
                            ? 'bg-pink-100 border-pink-400 shadow-md'
                            : 'bg-white border-gray-200 hocus:bg-pink-50 hocus:border-pink-300'
                            }`}>
                            <input type="radio" value="birthday" className="sr-only" {...register('childCategory', { required: true })} />
                            <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-full bg-white shadow-sm">
                                <img
                                    src={birthdayIcon}
                                    alt="Cumpleaños"
                                    className="w-6 h-6 object-contain"
                                />
                            </div>
                            <span className="text-sm font-medium whitespace-nowrap">Cumpleaños</span>
                        </label>

                        <label className={`flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all ${selectedCategory === 'milestone'
                            ? 'bg-brand-gold/20 border-brand-gold shadow-md'
                            : 'bg-white border-gray-200 hocus:bg-brand-gold/5 hocus:border-brand-gold/50'
                            }`}>
                            <input type="radio" value="milestone" className="sr-only" {...register('childCategory', { required: true })} />
                            <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-full bg-white shadow-sm">
                                <img
                                    src={milestoneIcon}
                                    alt="Hito"
                                    className="w-6 h-6 object-contain"
                                />
                            </div>
                            <span className="text-sm font-medium whitespace-nowrap">Hito</span>
                        </label>

                        <label className={`flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all ${selectedCategory === 'memory'
                            ? 'bg-brand-purple/20 border-brand-purple shadow-md'
                            : 'bg-white border-gray-200 hocus:bg-brand-purple/5 hocus:border-brand-purple/50'
                            }`}>
                            <input type="radio" value="memory" className="sr-only" {...register('childCategory', { required: true })} />
                            <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-full bg-white shadow-sm">
                                <img
                                    src={memoryIcon}
                                    alt="Recuerdo"
                                    className="w-6 h-6 object-contain"
                                />
                            </div>
                            <span className="text-sm font-medium whitespace-nowrap">Recuerdo</span>
                        </label>
                    </div>
                </div>

                {/* Campos adicionales para el nacimiento */}
                {selectedCategory === 'birth' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 bg-emerald-50 p-4 rounded-xl border border-emerald-200"
                    >
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-emerald-800 mb-1">¡Información del bebé!</h3>
                            <p className="text-sm text-emerald-600">Cuéntanos sobre tu pequeño tesoro</p>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold mb-1 text-emerald-800">
                                <User size={16} className="text-emerald-600" weight="bold" />
                                Nombre del bebé
                            </label>
                            <input
                                className="mt-1 w-full rounded-xl border border-emerald-300 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                                placeholder="¿Cómo se llama tu bebé?"
                                {...register('childName', {
                                    required: selectedCategory === 'birth' ? 'El nombre del bebé es requerido' : false
                                })}
                            />
                            {errors.childName && <p className="text-red-600 text-sm mt-1">{errors.childName.message}</p>}
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold mb-1 text-emerald-800">
                                <GenderIntersex size={16} className="text-emerald-600" weight="bold" />
                                Sexo del bebé
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <label className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 cursor-pointer transition-all ${watch('childGender') === 'male'
                                    ? 'bg-blue-100 border-blue-400 shadow-md'
                                    : 'bg-white border-emerald-200 hocus:bg-blue-50 hocus:border-blue-300'
                                    }`}>
                                    <input type="radio" value="male" className="sr-only" {...register('childGender', { required: selectedCategory === 'birth' })} />
                                    <span className="text-2xl">👶🏻</span>
                                    <span className="text-sm font-medium">Niño</span>
                                </label>
                                <label className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 cursor-pointer transition-all ${watch('childGender') === 'female'
                                    ? 'bg-pink-100 border-pink-400 shadow-md'
                                    : 'bg-white border-emerald-200 hocus:bg-pink-50 hocus:border-pink-300'
                                    }`}>
                                    <input type="radio" value="female" className="sr-only" {...register('childGender', { required: selectedCategory === 'birth' })} />
                                    <span className="text-2xl">👶🏻</span>
                                    <span className="text-sm font-medium">Niña</span>
                                </label>
                            </div>
                            {errors.childGender && <p className="text-red-600 text-sm mt-1">Selecciona el sexo del bebé.</p>}
                        </div>
                    </motion.div>
                )}

                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-1">
                        <Calendar size={16} className="text-brand-blue" weight="bold" />
                        {selectedCategory === 'birth' ? 'Fecha de nacimiento' : 'Fecha'}
                    </label>
                    <input type="date" className="mt-1 w-full rounded-xl border p-3" {...register('date', { required: true })} />
                    {errors.date && <p className="text-error text-sm mt-1">{selectedCategory === 'birth' ? 'Selecciona la fecha de nacimiento.' : 'Selecciona la fecha.'}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2">Fotos o video (hasta 10)</label>
                    <FileUpload
                        files={files}
                        onChange={setFiles}
                        uploadProgress={uploadProgress}
                        isUploading={isSubmitting}
                        maxFiles={10}
                    />
                </div>

                <div className="sticky bottom-0 bg-surface p-4 -mx-4 border-t">
                    <button
                        disabled={isSubmitting}
                        className="w-full rounded-pill bg-brand-blue text-white py-3 font-semibold active:scale-pressed transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </form>
        </div>
    );
}


