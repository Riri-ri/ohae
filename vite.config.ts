import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Базовый путь можно переопределить окружением, например для другого репозитория:
// VITE_BASE_PATH=/repo-name/ npm run build
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/ohae/',
  plugins: [react(), tailwindcss()],
});