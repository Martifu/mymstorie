import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { createChildEvent } from '../../features/entries/entriesService';
import { TextT, ChatText, Calendar, Tag } from 'phosphor-react';
import birthdayIcon from '../../assets/birthday-icon.svg';
import milestoneIcon from '../../assets/milestone-icon.svg';
import memoryIcon from '../../assets/memory-icon.svg';
import { FileUpload } from '../../components/FileUpload';
import imageCompression from 'browser-image-compression';

interface FileWithPreview extends File {
    preview?: string;
}

type FormValues = {
    title: string;
    description?: string;
    date: string;
    childCategory: 'birthday' | 'milestone' | 'memory';
};

export default function NewChildEvent() {
    const { spaceId } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({ defaultValues: { childCategory: 'milestone' } });
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

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
            await createChildEvent(spaceId, fd, (fileName, progress) => {
                setUploadProgress((prev: { [key: string]: number }) => ({ ...prev, [fileName]: progress }));
            });

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
        <div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <label className={`flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all ${watch('childCategory') === 'birthday'
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
                        <label className={`flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all ${watch('childCategory') === 'milestone'
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
                        <label className={`flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all ${watch('childCategory') === 'memory'
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

                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-1">
                        <Calendar size={16} className="text-brand-blue" weight="bold" />
                        Fecha
                    </label>
                    <input type="date" className="mt-1 w-full rounded-xl border p-3" {...register('date', { required: true })} />
                    {errors.date && <p className="text-error text-sm mt-1">Selecciona la fecha.</p>}
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


