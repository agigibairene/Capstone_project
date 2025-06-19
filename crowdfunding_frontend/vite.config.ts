import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // Make sure to import path

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic'
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      'react': path.resolve('node_modules/react'),
      'react-dom': path.resolve('node_modules/react-dom'),
    }
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: true,
    allowedHosts: [
      'capstone-g7gbz.ondigitalocean.app', 
      'localhost',
      '.vercel.app'
    ]
  },
  build: {
    // This helps with dependency bundling
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  }
})