import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
  },
  server: {
    port: 5173,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      manifest: {
        name: 'mymstorie',
        short_name: 'mymstorie',
        theme_color: '#8B5CF6',
        background_color: '#FFFDFB',
        display: 'standalone',
        lang: 'es',
        start_url: '/',
        icons: [
          { src: '/logo.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'html', networkTimeoutSeconds: 3 }
          },
          {
            urlPattern: ({ request }) => ['script', 'style'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'assets' }
          },
          {
            urlPattern: ({ url }) => url.origin.includes('fonts.googleapis.com'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-styles' }
          },
          {
            urlPattern: ({ url }) => url.origin.includes('fonts.gstatic.com'),
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-webfonts' }
          },
          {
            urlPattern: ({ url }) => url.origin.includes('firebasestorage.googleapis.com') || url.origin.includes('storage.googleapis.com'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'media',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
})
