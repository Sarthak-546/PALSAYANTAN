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
        // Aggressively cache all JS, CSS, HTML, images, and WASM files for offline CV
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm,mp3}'],
        maximumFileSizeToCacheInBytes: 5000000, // 5MB limit to allow WASM models
      }
    })
  ]
});
