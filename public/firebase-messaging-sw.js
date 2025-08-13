/* global importScripts, firebase */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: 'AIzaSyDr4XBOqaEjqL6O0NLpCGsWjHEL6RCNCtk',
    authDomain: 'mymstorie.firebaseapp.com',
    projectId: 'mymstorie',
    messagingSenderId: '484000911482',
    appId: '1:484000911482:web:7b2789e6f0daef7bf1ebc3'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Mensaje recibido en background:', payload);
    const { title, body } = payload.notification || {};

    // Solo mostrar notificación si la app no está visible
    // Esto ayuda a prevenir duplicados en iOS PWA
    return self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((clients) => {
        const hasVisibleClient = clients.some(client => client.visibilityState === 'visible');

        if (!hasVisibleClient && title) {
            return self.registration.showNotification(title, {
                body,
                icon: '/logo.png',
                badge: '/logo.png',
                data: payload.data,
                tag: 'mymstorie-notification', // Previene múltiples notificaciones del mismo tipo
                renotify: false,
                requireInteraction: false
            });
        }
    });
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
    console.log('Notificación clickeada:', event);
    event.notification.close();

    // Obtener datos de la notificación
    const data = event.notification.data || {};
    const { spaceId, entryId, type } = data;

    // Construir URL de destino
    let targetUrl = '/';
    if (spaceId && entryId) {
        if (type === 'memory') {
            targetUrl = `/memories/${entryId}`;
        } else if (type === 'goal') {
            targetUrl = `/goals/${entryId}`;
        }
    }

    // Abrir o enfocar la app
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clients) => {
                // Si hay una ventana abierta, enfocarla
                const client = clients.find(c => c.url.includes(self.registration.scope));
                if (client) {
                    client.focus();
                    if (targetUrl !== '/') {
                        client.postMessage({ type: 'NAVIGATE', url: targetUrl });
                    }
                    return client;
                } else {
                    // Abrir nueva ventana
                    return self.clients.openWindow(self.registration.scope + targetUrl.substring(1));
                }
            })
    );
});
