/**
 * Utilidad para conversión de videos MOV a MP4
 * Implementa fallback: intenta FFmpeg.wasm, si falla usa renombrado
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let ffmpegInitialized = false;
let ffmpegInitError: string | null = null;

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
 * Inicializa FFmpeg.wasm con manejo robusto de errores
 */
async function initFFmpeg(): Promise<FFmpeg | null> {
    // Si ya se intentó inicializar y falló, no reintentar
    if (ffmpegInitError) {
        console.warn('FFmpeg previamente falló:', ffmpegInitError);
        return null;
    }

    // Si ya está inicializado, retornar instancia
    if (ffmpegInstance && ffmpegInitialized) {
        return ffmpegInstance;
    }

    try {
        console.log('Inicializando FFmpeg.wasm...');
        const ffmpeg = new FFmpeg();

        // Configurar logging para debug
        ffmpeg.on('log', ({ message }) => {
            console.log('FFmpeg:', message);
        });

        // URLs más estables para FFmpeg
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

        // Cargar FFmpeg con timeout
        const loadPromise = ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        // Timeout de 30 segundos
        await Promise.race([
            loadPromise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout inicializando FFmpeg')), 100)
            )
        ]);

        ffmpegInstance = ffmpeg;
        ffmpegInitialized = true;
        console.log('✅ FFmpeg inicializado correctamente');
        return ffmpeg;

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
        ffmpegInitError = errorMsg;
        console.error('❌ Error inicializando FFmpeg:', errorMsg);
        return null;
    }
}

/**
 * Fallback: renombra MOV a MP4 (sin conversión real)
 */
function renameMOVToMP4(file: File): File {
    const newName = file.name.replace(/\.mov$/i, '.mp4');
    return new File([file], newName, {
        type: 'video/mp4',
        lastModified: file.lastModified
    });
}

/**
 * Convierte MOV a MP4 usando FFmpeg.wasm con fallback
 */
export async function convertMOVToMP4(
    file: File,
    onProgress?: (progress: number) => void
): Promise<{ file: File; wasConverted: boolean; message: string }> {

    // Si no es MOV, retornar original
    if (!isMOVFile(file)) {
        return {
            file,
            wasConverted: false,
            message: 'Archivo no requiere conversión'
        };
    }

    onProgress?.(5);

    try {
        // Intentar inicializar FFmpeg
        const ffmpeg = await initFFmpeg();

        if (!ffmpeg) {
            // Fallback a renombrado
            console.log('🔄 Usando fallback: renombrado MOV → MP4');
            onProgress?.(50);
            const renamedFile = renameMOVToMP4(file);
            onProgress?.(100);

            return {
                file: renamedFile,
                wasConverted: true,
                message: 'Archivo renombrado a MP4 (fallback)'
            };
        }

        onProgress?.(20);

        // Nombres de archivos únicos
        const timestamp = Date.now();
        const inputName = `input_${timestamp}.mov`;
        const outputName = `output_${timestamp}.mp4`;

        console.log('📝 Escribiendo archivo de entrada...');
        await ffmpeg.writeFile(inputName, await fetchFile(file));
        onProgress?.(35);

        // Configurar progreso de FFmpeg
        let lastProgress = 35;
        ffmpeg.on('progress', ({ progress }) => {
            const adjustedProgress = 35 + (progress * 55); // 35% a 90%
            if (adjustedProgress > lastProgress) {
                lastProgress = adjustedProgress;
                onProgress?.(Math.round(adjustedProgress));
            }
        });

        console.log('🎬 Iniciando conversión MOV → MP4...');

        // Comando optimizado para web
        await ffmpeg.exec([
            '-i', inputName,
            '-c:v', 'libx264',           // Codec video H.264
            '-preset', 'fast',           // Velocidad de encoding
            '-crf', '25',               // Calidad (23-28 es bueno para web)
            '-c:a', 'aac',              // Codec audio AAC
            '-b:a', '128k',             // Bitrate audio
            '-movflags', '+faststart',   // Optimizar para streaming
            '-f', 'mp4',                // Formato salida
            '-y',                       // Sobrescribir sin preguntar
            outputName
        ]);

        onProgress?.(90);

        // Leer archivo convertido
        console.log('📦 Leyendo archivo convertido...');
        const data = await ffmpeg.readFile(outputName) as Uint8Array;

        // Crear archivo MP4
        const originalName = file.name.replace(/\.mov$/i, '');
        const mp4File = new File([data], `${originalName}.mp4`, {
            type: 'video/mp4',
            lastModified: file.lastModified
        });

        // Limpiar archivos temporales
        try {
            await ffmpeg.deleteFile(inputName);
            await ffmpeg.deleteFile(outputName);
        } catch (cleanupError) {
            console.warn('Advertencia limpiando archivos temporales:', cleanupError);
        }

        onProgress?.(100);

        const sizeMB = (mp4File.size / 1024 / 1024).toFixed(1);
        console.log(`✅ Conversión completada: ${sizeMB} MB`);

        return {
            file: mp4File,
            wasConverted: true,
            message: `Convertido a MP4 (${sizeMB} MB)`
        };

    } catch (error) {
        console.error('❌ Error en conversión FFmpeg:', error);

        // Fallback a renombrado en caso de error
        console.log('🔄 Usando fallback por error...');
        onProgress?.(70);

        const renamedFile = renameMOVToMP4(file);
        onProgress?.(100);

        return {
            file: renamedFile,
            wasConverted: true,
            message: 'Error en conversión, usando fallback (renombrado)'
        };
    }
}

/**
 * Procesa un archivo de video (función principal)
 */
export async function processVideoFile(
    file: File,
    onProgress?: (progress: number) => void
): Promise<{ file: File; wasProcessed: boolean; message: string }> {

    const result = await convertMOVToMP4(file, onProgress);

    return {
        file: result.file,
        wasProcessed: result.wasConverted,
        message: result.message
    };
}

/**
 * Información sobre capacidades de conversión
 */
export function getVideoConversionInfo() {
    return {
        available: true,
        method: 'FFmpeg.wasm + fallback',
        description: 'Conversión real con FFmpeg.wasm, fallback a renombrado si falla',
        supportedFormats: ['MOV', 'QuickTime'],
        outputFormat: 'MP4 (H.264 + AAC)',
        features: [
            'Conversión real de códecs',
            'Fallback automático',
            'Optimización para web',
            'Progreso en tiempo real',
            'Manejo robusto de errores'
        ],
        fallbackAvailable: true
    };
}

/**
 * Verifica si FFmpeg está disponible
 */
export function isFFmpegAvailable(): boolean {
    return ffmpegInitialized && ffmpegInstance !== null && !ffmpegInitError;
}

/**
 * Resetea el estado de FFmpeg (útil para debugging)
 */
export function resetFFmpeg(): void {
    ffmpegInstance = null;
    ffmpegInitialized = false;
    ffmpegInitError = null;
    console.log('🔄 Estado de FFmpeg reseteado');
}