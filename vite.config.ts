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
        globIgnores: ['**/seedDatabase-*.js', '**/starterProjects-*.js'],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('dexie')) return 'vendor-storage'
          if (id.includes('react-router')) return 'vendor-router'
          if (id.includes('react') || id.includes('scheduler')) return 'vendor-react'
          if (id.includes('@auth0')) return 'vendor-auth'
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) return 'vendor-forms'
          if (id.includes('minisearch')) return 'vendor-search'
          if (id.includes('lucide-react')) return 'vendor-icons'
          return 'vendor'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
})
