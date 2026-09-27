import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },

  server: {
    host: true,
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api/v1': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
