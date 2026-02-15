import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html when ANALYZE=true
    process.env.ANALYZE && visualizer({
      filename: 'stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // SPA routing middleware - ensure routes don't serve raw source files
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Routes that conflict with source files - serve index.html instead
          const spaRoutes = ['/profile', '/props', '/analytics', '/history'];
          if (spaRoutes.some(route => req.url === route || req.url?.startsWith(route + '?'))) {
            req.url = '/';
          }
          next();
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  // Ensure SPA routing
  appType: 'spa',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.js',
    css: true,
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
})
