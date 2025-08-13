/* global importScripts, firebase */
// Importar Firebase para notificaciones
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

// Variable para trackear notificaciones y prevenir duplicados
let lastNotificationTime = 0;
let lastNotificationTitle = '';

messaging.onBackgroundMessage((payload) => {
    console.log('Mensaje recibido en background:', payload);
    const { title, body } = payload.notification || {};
    const currentTime = Date.now();

    // Prevenir notificaciones duplicadas basadas en tiempo y título
    if (title === lastNotificationTitle && (currentTime - lastNotificationTime) < 5000) {
        console.log('Notificación duplicada detectada, ignorando...');
        return Promise.resolve();
    }

    lastNotificationTime = currentTime;
    lastNotificationTitle = title || '';

    // Solo mostrar notificación si la app no está visible
    return self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((clients) => {
        const hasVisibleClient = clients.some(client =>
            client.visibilityState === 'visible' &&
            client.url.includes(self.registration.scope)
        );

        console.log('Clientes visibles:', hasVisibleClient);

        if (!hasVisibleClient && title) {
            // Crear ID único para la notificación
            const notificationId = `mymstorie-${Date.now()}`;

            return self.registration.showNotification(title, {
                body,
                icon: '/logo.png',
                badge: '/logo.png',
                data: { ...payload.data, notificationId },
                tag: notificationId, // Usar ID único para prevenir reemplazo
                renotify: false,
                requireInteraction: false,
                silent: false
            });
        } else {
            console.log('App visible o sin título, no mostrando notificación');
            return Promise.resolve();
        }
    }).catch(error => {
        console.error('Error al procesar notificación:', error);
        return Promise.resolve();
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

console.log('Firebase Messaging Service Worker cargado correctamente');
