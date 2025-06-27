import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: mode === 'development' ? {
    host: true,
    port: 8080,
    strictPort: true,
    allowedHosts: [
      'capstone-gmpuk.ondigitalocean.app',
      'localhost',
      '.vercel.app',
      '.ondigitalocean.app'
    ],
    hmr: false,
  } : undefined,
}));
