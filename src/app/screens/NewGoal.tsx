import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createGoal } from '../../features/entries/entriesService';
import { useAuth } from '../../features/auth/useAuth';

type FormValues = { title: string; description?: string; dueDate: string; files: FileList };

export default function NewGoal() {
    const { spaceId } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>();
    const files = watch('files');
    const onSubmit = handleSubmit(async (values) => {
        if (!spaceId) return;
        const fd = new FormData();
        fd.append('title', values.title);
        fd.append('dueDate', values.dueDate);
        if (values.description) fd.append('description', values.description);
        const list = Array.from(values.files || []).slice(0, 10);
        for (const f of list) fd.append('media', f, f.name);
        await createGoal(spaceId, fd);
        navigate('/goals');
    });
    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">Nueva meta</h2>
            <form onSubmit={onSubmit} className="p-4 space-y-4">
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
                    <label className="block text-sm font-semibold">Fecha límite (obligatoria)</label>
                    <input type="date" className="mt-1 w-full rounded-xl border p-3" {...register('dueDate', { required: true })} />
                    {errors.dueDate && <p className="text-error text-sm mt-1">Selecciona la fecha límite.</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold">Fotos o video (hasta 10)</label>
                    <input type="file" accept="image/*,video/*" multiple className="mt-1 w-full rounded-xl border p-3 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-brand-blue file:text-white file:text-sm file:font-medium hover:file:bg-brand-blue/90" {...register('files')} />
                    {files && Array.from(files).length > 0 && (
                        <div className="mt-3 p-3 bg-brand-blue/5 rounded-xl border border-brand-blue/20">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-6 rounded-full bg-brand-blue/20 flex items-center justify-center">
                                    <span className="text-xs font-bold text-brand-blue">{Array.from(files).length}</span>
                                </div>
                                <div className="text-sm font-medium text-brand-blue">
                                    {Array.from(files).length} archivo{Array.from(files).length !== 1 ? 's' : ''} seleccionado{Array.from(files).length !== 1 ? 's' : ''}
                                </div>
                            </div>
                            <div className="text-xs text-text-muted">
                                {Array.from(files).filter(f => f.type.startsWith('image/')).length} imágenes, {Array.from(files).filter(f => f.type.startsWith('video/')).length} videos • {(Array.from(files).reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(1)} MB total
                            </div>
                        </div>
                    )}
                </div>
                <div className="sticky bottom-0 bg-surface p-4 -mx-4 border-t">
                    <button className="w-full rounded-pill bg-brand-blue text-white py-3 font-semibold active:scale-pressed transition">Guardar</button>
                </div>
            </form>
        </div>
    );
}


