import { useEffect } from 'react';

interface VideoCompatibilityCheckerProps {
    src: string;
    onCompatibilityCheck: (isCompatible: boolean, alternativeFormat?: string) => void;
}

export function VideoCompatibilityChecker({ src, onCompatibilityCheck }: VideoCompatibilityCheckerProps) {
    useEffect(() => {
        const checkVideoCompatibility = async () => {
            const isMOVFile = src.toLowerCase().includes('.mov');
            const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);

            // Si es un archivo MOV en móvil, verificar soporte
            if (isMOVFile && isMobile) {
                const video = document.createElement('video');
                video.muted = true;
                video.playsInline = true;

                let supported = false;

                // Verificar si el navegador puede reproducir MOV
                const canPlayMOV = video.canPlayType('video/quicktime');
                const canPlayMP4 = video.canPlayType('video/mp4');

                console.log('Video compatibility check:', {
                    src,
                    canPlayMOV,
                    canPlayMP4,
                    userAgent: navigator.userAgent
                });

                if (canPlayMOV === 'probably' || canPlayMOV === 'maybe') {
                    supported = true;
                } else if (canPlayMP4 === 'probably' || canPlayMP4 === 'maybe') {
                    // Sugerir conversión a MP4 si es posible
                    const mp4Url = src.replace('.mov', '.mp4').replace('.MOV', '.mp4');
                    onCompatibilityCheck(false, mp4Url);
                    return;
                }

                onCompatibilityCheck(supported);
            } else {
                // Para otros formatos, asumir compatibilidad
                onCompatibilityCheck(true);
            }
        };

        checkVideoCompatibility();
    }, [src, onCompatibilityCheck]);

    return null;
}
