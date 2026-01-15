import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.js',
    css: true,
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
})
