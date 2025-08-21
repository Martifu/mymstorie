import { useForm } from 'react-hook-form';
import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { FileUpload } from './FileUpload';
import { SpotifySearch } from './SpotifySearch';
import { processFileForUpload } from '../utils/fileUtils';
import type { EntrySpotifyData } from '../features/spotify/spotifyService';

interface FileWithPreview extends File {
    preview?: string;
}

type FormValues = {
    title: string; description?: string; date: string; tags?: string;
};

export function EntryForm({ onSubmit, initialTitle = '' }: { onSubmit: (data: FormData, onProgress?: (fileName: string, progress: number) => void, spotifyData?: EntrySpotifyData | null) => Promise<void>; initialTitle?: string }) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        defaultValues: { title: initialTitle }
    });
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [selectedTrack, setSelectedTrack] = useState<EntrySpotifyData | null>(null);

    async function compress(file: File): Promise<File> {
        const compressed = await imageCompression(file, { maxWidthOrHeight: 1440, initialQuality: 0.82, useWebWorker: true });
        return new File([compressed], file.name, { type: compressed.type });
    }

    const submit = handleSubmit(async (values) => {
        const fd = new FormData();
        fd.append('title', values.title);
        fd.append('date', values.date);
        if (values.description) fd.append('description', values.description);
        if (values.tags) fd.append('tags', values.tags);

        // Procesar archivos seleccionados (máximo 10)
        for (const originalFile of files.slice(0, 10)) {
            let fileToUpload = originalFile;
            let fileName = originalFile.name;

            if (originalFile.type.startsWith('image/')) {
                // Comprimir imágenes para optimizar tamaño
                fileToUpload = await compress(originalFile);
                fileName = originalFile.name; // Mantener nombre original para imágenes
            } else if (originalFile.type.startsWith('video/')) {
                // Procesar videos (renombrar MOV a MP4 si es necesario)
                const processed = processFileForUpload(originalFile);
                fileToUpload = processed.file;
                fileName = processed.file.name; // Usar nombre procesado (MOV → MP4)

                if (processed.wasRenamed) {
                    console.log(`✅ Video procesado para subida: ${originalFile.name} → ${fileName}`);
                }
            }

            fd.append('media', fileToUpload, fileName);
        }

        await onSubmit(fd, (fileName, progress) => {
            setUploadProgress((prev: { [key: string]: number }) => ({ ...prev, [fileName]: progress }));
        }, selectedTrack);

        // Limpiar archivos y datos después de envío exitoso
        files.forEach(file => {
            if (file.preview) {
                URL.revokeObjectURL(file.preview);
            }
        });
        setFiles([]);
        setUploadProgress({});
        setSelectedTrack(null);
    });

    return (
        <form onSubmit={submit} className="p-4 space-y-4">
            <div>
                <label className="block text-sm font-semibold">Título (obligatorio)</label>
                <input className="mt-1 w-full rounded-xl border p-3" {...register('title', { required: true })} />
                {errors.title && <p className="text-error text-sm mt-1">Por favor, completa el título.</p>}
            </div>
            <div>
                <label className="block text-sm font-semibold">Descripción</label>
                <textarea className="mt-1 w-full rounded-xl border p-3" rows={4} {...register('description')} />
            </div>
            <div>
                <label className="block text-sm font-semibold">Fecha (obligatoria)</label>
                <input type="date" className="mt-1 w-full rounded-xl border p-3" {...register('date', { required: true })} />
                {errors.date && <p className="text-error text-sm mt-1">Por favor, selecciona la fecha.</p>}
            </div>
            <div>
                <label className="block text-sm font-semibold">Etiquetas</label>
                <input className="mt-1 w-full rounded-xl border p-3" placeholder="familia, viaje" {...register('tags')} />
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
            <div>
                <SpotifySearch
                    onTrackSelect={setSelectedTrack}
                    selectedTrack={selectedTrack}
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
    );
}


