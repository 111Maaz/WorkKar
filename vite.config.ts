import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'WorkKar icon.png', 'WorkKar icon2.png', 'WorkKar icon3.jpg', 'placeholder.svg'],
      manifest: {
        name: 'WorkKar',
        short_name: 'WorkKar',
        description: 'Find and hire local skilled workers easily, even offline!',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'WorkKar icon.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'WorkKar icon2.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'WorkKar icon3.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/([a-zA-Z0-9_-]+\.)*supabase\.co\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
        ],
      },
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
