import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      jsxRuntime: 'automatic'
    }), 
    tailwindcss()
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    },
    minify: mode === 'production' ? 'terser' : false,
  },
  server: {
    host: true,
    port: 8080,
    strictPort: true,
    hmr: mode === 'development' ? {
      port: 8080,
      host: 'localhost'
    } : false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    force: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    global: 'globalThis'
  }
}))