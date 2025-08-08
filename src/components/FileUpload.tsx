import { useRef } from 'react';
import { Camera, Plus, X, Play } from 'phosphor-react';

interface FileWithPreview extends File {
    preview?: string;
}

interface FileUploadProps {
    files: FileWithPreview[];
    onChange: (files: FileWithPreview[]) => void;
    uploadProgress?: { [key: string]: number };
    isUploading?: boolean;
    maxFiles?: number;
}

export function FileUpload({
    files,
    onChange,
    uploadProgress = {},
    isUploading = false,
    maxFiles = 10
}: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        const newFiles: FileWithPreview[] = [];

        selectedFiles.slice(0, maxFiles - files.length).forEach(file => {
            const fileWithPreview: FileWithPreview = file;

            // Crear preview para imágenes
            if (file.type.startsWith('image/')) {
                fileWithPreview.preview = URL.createObjectURL(file);
            }

            newFiles.push(fileWithPreview);
        });

        onChange([...files, ...newFiles]);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (index: number) => {
        const fileToRemove = files[index];
        if (fileToRemove.preview) {
            URL.revokeObjectURL(fileToRemove.preview);
        }
        const newFiles = files.filter((_, i) => i !== index);
        onChange(newFiles);
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="sr-only"
                onChange={handleFileSelect}
            />

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={files.length >= maxFiles}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-brand-blue/30 rounded-xl bg-brand-blue/5 hocus:bg-brand-blue/10 hocus:border-brand-blue/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <div className="flex items-center gap-2">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-blue/20 text-brand-blue">
                        <Camera size={20} weight="fill" />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-medium text-brand-blue">
                            {files.length === 0 ? 'Agregar fotos o videos' : 'Agregar más archivos'}
                        </div>
                        <div className="text-xs text-text-muted">
                            {files.length}/{maxFiles} archivos
                        </div>
                    </div>
                </div>
                <Plus size={16} className="text-brand-blue" weight="bold" />
            </button>

            {files.length > 0 && (
                <div className="mt-3 space-y-3">
                    {/* Resumen de archivos */}
                    <div className="p-3 bg-brand-blue/5 rounded-xl border border-brand-blue/20">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-6 w-6 rounded-full bg-brand-blue/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-brand-blue">{files.length}</span>
                            </div>
                            <div className="text-sm font-medium text-brand-blue">
                                {files.length} archivo{files.length !== 1 ? 's' : ''} seleccionado{files.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                        <div className="text-xs text-text-muted">
                            {files.filter(f => f.type.startsWith('image/')).length} imágenes, {files.filter(f => f.type.startsWith('video/')).length} videos • {(files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(1)} MB total
                        </div>
                    </div>

                    {/* Grid de previews */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {files.map((file, index) => (
                            <div key={index} className="relative group">
                                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                                    {file.type.startsWith('image/') ? (
                                        <img
                                            src={file.preview}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : file.type.startsWith('video/') ? (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <div className="text-center">
                                                <Play size={24} className="mx-auto mb-1 text-gray-500" weight="fill" />
                                                <div className="text-xs text-gray-600 px-1 truncate">
                                                    {file.name}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <div className="text-center">
                                                <div className="text-xs text-gray-600 px-1 truncate">
                                                    {file.name}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Botón de eliminar */}
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    disabled={isUploading}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <X size={12} weight="bold" />
                                </button>

                                {/* Barra de progreso durante subida */}
                                {isUploading && uploadProgress[file.name] !== undefined && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1 rounded-b-xl">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-white transition-all duration-300"
                                                    style={{ width: `${uploadProgress[file.name] || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium">
                                                {uploadProgress[file.name] || 0}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
