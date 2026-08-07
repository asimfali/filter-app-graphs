import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import tailwindcss from '@tailwindcss/vite'

// base: '/graphs/' — приложение раздаётся nginx'ом на том же origin, что и
// основной портал, по пути /graphs/ (см. filter-app/src/status/FANCHART_EXTRACTION_PLAN.md).
// Тот же origin даёт бесплатный шаринг localStorage-токена с порталом.
export default defineConfig({
  base: '/graphs/',
  plugins: [
    tailwindcss(),
    react(),
    legacy({
      targets: ['chrome >= 49', 'firefox >= 52', 'edge >= 18'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    css: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 5174,
    allowedHosts: ['lab'],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
