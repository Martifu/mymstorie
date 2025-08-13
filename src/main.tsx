import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setupMessaging } from './lib/firebase'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Limpiar service workers antiguos para prevenir duplicados
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      // Desregistrar service workers que no sean el nuestro
      if (registration.scope !== window.location.origin + '/') {
        console.log('Desregistrando SW antiguo:', registration.scope);
        registration.unregister();
      }
    });
  });
}

// Register PWA service worker (que incluye Firebase Messaging)
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onRegistered(r) {
        console.log('Service Worker registrado:', r);
      },
      onRegisterError(error) {
        console.error('Error al registrar Service Worker:', error);
      }
    })
  })
}

// Initialize Web Push (FCM)
setupMessaging()

// Escuchar mensajes del service worker para navegación
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'NAVIGATE') {
      window.location.href = event.data.url;
    }
  });
}
