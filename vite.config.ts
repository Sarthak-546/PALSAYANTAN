import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'images/**/*.png', 'sounds/**/*.mp3'],
      manifest: {
        name: 'AR Emergency Assistant',
        short_name: 'FirstAid AR',
        description: 'Offline-first AR emergency and first-aid assistant.',
        theme_color: '#020617', // slate-950
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm,mp4}'],
        maximumFileSizeToCacheInBytes: 15000000,
        runtimeCaching: [
          {
            urlPattern: /.*\.(mp4|webm)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'offline-video-cache',
              plugins: [
                {
                  cachedResponseWillBeUsed: async ({ cachedResponse, request }) => {
                    if (cachedResponse && request.headers.has('range')) {
                      return cachedResponse; // Allows the browser to process the range slice offline
                    }
                    return cachedResponse;
                  }
                }
              ]
            }
          }
        ]
      }
    })
  ]
});
