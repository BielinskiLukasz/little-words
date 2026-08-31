import path from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.tsx', 'src/**/*.test.ts'],
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'virtual:pwa-register/react': path.resolve(__dirname, './src/__mocks__/virtual-pwa-register.ts'),
    },
  },
})
