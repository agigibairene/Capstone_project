import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        react: path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      },
      dedupe: ['react', 'react-dom'],
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
  };
});
