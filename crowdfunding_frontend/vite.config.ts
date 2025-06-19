import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'], // ✅ keep dedupe, remove alias
  },
  server: {
    host: true,
    port: 8080,
    strictPort: true,
    allowedHosts: [
      'capstone-g7gbz.ondigitalocean.app',
      'capstone-rxaal.ondigitalocean.app',
      'localhost',
      '.vercel.app',
    ],
    hmr: false, 
  },
}));
