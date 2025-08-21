/**
 * Utilidades para manejo de archivos
 */

/**
 * Verifica si un archivo es MOV
 */
export function isMOVFile(file: File): boolean {
    if (!file || !file.name) return false;

    return file.name.toLowerCase().endsWith('.mov') ||
        file.type === 'video/quicktime' ||
        file.type === 'video/mov';
}

/**
 * Renombra un archivo MOV a MP4 para mejor compatibilidad
 * Solo cambia la extensión y el tipo MIME, no convierte el contenido
 */
export function renameMOVToMP4(file: File): File {
    if (!isMOVFile(file)) {
        return file; // Si no es MOV, devolver el archivo original
    }

    // Cambiar extensión .mov por .mp4
    const newName = file.name.replace(/\.mov$/i, '.mp4');

    // Crear nuevo archivo con extensión MP4 y tipo MIME correcto
    const renamedFile = new File([file], newName, {
        type: 'video/mp4',
        lastModified: file.lastModified
    });

    console.log(`🔄 Archivo renombrado: ${file.name} → ${newName}`);

    return renamedFile;
}

/**
 * Procesa un archivo para mejorar compatibilidad
 * Por ahora solo renombra MOV a MP4
 */
export function processFileForUpload(file: File): { file: File; wasRenamed: boolean } {
    if (isMOVFile(file)) {
        return {
            file: renameMOVToMP4(file),
            wasRenamed: true
        };
    }

    return {
        file,
        wasRenamed: false
    };
}
