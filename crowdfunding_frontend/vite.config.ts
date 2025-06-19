import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      // Add React refresh and JSX runtime options
      jsxRuntime: 'automatic',
      babel: {
        plugins: []
      }
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Absolute path resolution for React
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
    },
    dedupe: ['react', 'react-dom', 'react-router-dom'], 
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom']
        }
      }
    },
    // Ensure proper minification
    minify: 'terser',
    sourcemap: false,
    // Fix for production chunk loading
    chunkSizeWarningLimit: 1000
  },
  // Critical: Define global variables for production
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    global: 'globalThis'
  },
  server: {
    host: true,
    port: 8080,
    strictPort: true,
    allowedHosts: [
      'capstone-g7gbz.ondigitalocean.app', 
      'localhost',
      '.vercel.app'
    ]
  },
  // Add optimizeDeps to force pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    force: true
  }
})