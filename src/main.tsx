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

// Register PWA service worker
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onRegistered(r) {
        console.log('PWA Service Worker registrado:', r);
      },
      onRegisterError(error) {
        console.error('Error al registrar PWA Service Worker:', error);
      }
    })
  })
}

// Register Firebase Messaging service worker separadamente
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js', {
    scope: '/firebase-messaging-sw.js'
  }).then((registration) => {
    console.log('Firebase Messaging SW registrado:', registration);
  }).catch((error) => {
    console.error('Error al registrar Firebase Messaging SW:', error);
  });
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
