import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

/**
 * Vite configuration for Seldom.
 * Path aliases mirror the src/ folder architecture for clean imports.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/memory': {
        target: 'http://127.0.0.1:3847',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/memory/, ''),
      },
      '/api/search': {
        target: 'http://127.0.0.1:3848',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/search/, ''),
      },
      '/api/analytics': {
        target: 'http://127.0.0.1:3849',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/analytics/, ''),
      },
      '/api/assistant': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/api/soccer': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/api/health': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@analytics': fileURLToPath(new URL('./analytics', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
  },
})
