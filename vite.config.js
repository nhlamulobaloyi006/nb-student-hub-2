import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      // Files copied from public/ that we want precached
      includeAssets: [
        'logos/*.png',
        'logos/*.svg',
        'icons/*.png',
      ],

      manifest: {
        name: 'NB Student Hub',
        short_name: 'NB Hub',
        description:
          'Know your options. Plan your future. Course matching, funding, applications, wellness and more for South African students.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0A0E1A',
        theme_color: '#0A0E1A',
        categories: ['education', 'productivity'],
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        // Precache every built asset + static public file
        globPatterns: [
          '**/*.{js,css,html,svg,png,jpg,jpeg,webp,ico,woff,woff2}',
        ],
        // Single-page-app fallback: any navigation that misses cache
        // falls back to index.html
        navigateFallback: '/index.html',
        // Don't let workbox intercept the API-ish paths we don't have
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },

      devOptions: {
        // Keep SW disabled during `npm run dev` (HMR vs caching conflicts)
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 4173,
    host: true,
    // Allow LAN access (phone on the same Wi-Fi) plus HTTPS tunnels
    // used for testing the PWA on phones.
    allowedHosts: [
      'localhost',
      '.loca.lt',
      '.ngrok.io',
      '.ngrok-free.app',
      '.trycloudflare.com',
    ],
  },
});