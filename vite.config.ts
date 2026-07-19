import path from 'path'
import { readFileSync } from 'fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string }

// https://vite.dev/config/
export default defineConfig({
  base: '/little-words/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,webmanifest,ico,png,svg,woff,woff2}'],
        navigateFallback: null,
      },
      includeAssets: ['**/*.{ico,png,svg}'],
      manifest: {
        name: 'Little Words',
        short_name: 'LittleWords',
        description: "Track your child's vocabulary development",
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/little-words/#/',
        scope: '/little-words/',
        icons: [],
      },
    }),
  ],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
