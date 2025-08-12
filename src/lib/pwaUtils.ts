/**
 * Utilidades para mejorar la compatibilidad con PWA
 */

// Detectar si estamos en una PWA instalada
export const isPWA = (): boolean => {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://') ||
        /iPad|iPhone|iPod/.test(navigator.userAgent)
    );
};

// Detectar si estamos en iOS
export const isIOS = (): boolean => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Detectar si estamos en Android
export const isAndroid = (): boolean => {
    return /Android/.test(navigator.userAgent);
};

// Detectar si estamos en un dispositivo móvil
export const isMobile = (): boolean => {
    return isIOS() || isAndroid() || /Mobile|Tablet/.test(navigator.userAgent);
};

// Detectar si el navegador soporta PWA
export const supportsPWA = (): boolean => {
    return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Obtener información del display mode actual
export const getDisplayMode = (): string => {
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
        return 'fullscreen';
    }
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return 'standalone';
    }
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        return 'minimal-ui';
    }
    return 'browser';
};

// Log información útil para debugging
export const logPWAInfo = (): void => {
    console.log('PWA Info:', {
        isPWA: isPWA(),
        isIOS: isIOS(),
        isAndroid: isAndroid(),
        isMobile: isMobile(),
        supportsPWA: supportsPWA(),
        displayMode: getDisplayMode(),
        userAgent: navigator.userAgent,
        standalone: (window.navigator as any).standalone,
        referrer: document.referrer,
    });
};
