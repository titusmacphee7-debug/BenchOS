import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['benchos-icon.svg'],
      manifest: {
        name: 'BenchOS',
        short_name: 'BenchOS',
        description: 'A local-first workshop operating system for tools, materials, projects, wishlist items, and mastery.',
        theme_color: '#07090D',
        background_color: '#07090D',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/benchos-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
})
