import { useForm } from 'react-hook-form';
import imageCompression from 'browser-image-compression';

type FormValues = {
    title: string; description?: string; date: string; tags?: string;
    files: FileList;
};

export function EntryForm({ onSubmit }: { onSubmit: (data: FormData) => Promise<void> }) {
    const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>();
    const files = watch('files');

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
        if (values.files) {
            const filesArr = Array.from(values.files).slice(0, 10);
            for (const f of filesArr) {
                const isImage = f.type.startsWith('image/');
                const fileToUpload = isImage ? await compress(f) : f;
                fd.append('media', fileToUpload, f.name);
            }
        }
        await onSubmit(fd);
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
                <label className="block text-sm font-semibold">Fotos o video (hasta 10)</label>
                <input type="file" accept="image/*,video/*" multiple className="mt-1" {...register('files')} />
                {files && <p className="text-text-muted text-sm mt-1">{Array.from(files).length} seleccionados</p>}
            </div>
            <div className="sticky bottom-0 bg-surface p-4 -mx-4 border-t">
                <button className="w-full rounded-pill bg-brand-ochre text-white py-3 font-semibold active:scale-pressed transition">Guardar</button>
            </div>
        </form>
    );
}


