import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Все запросы на /api будут уходить на бэкенд
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), 
      },
      // Чтобы картинки с бэкенда тоже открывались
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    },
  },
});