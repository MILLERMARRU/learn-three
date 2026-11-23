import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rolldownOptions: {
      output: {
        // librerías en chunks propios: cambian poco y el navegador las mantiene en caché entre despliegues
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/]three[\\/]/ },
            { name: 'r3f', test: /node_modules[\\/](@react-three|react-reconciler|zustand|its-fine|suspend-react|react-use-measure)[\\/]/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
    // three.js minificado pesa ~700 kB por sí solo y no se puede partir más; el resto queda muy por debajo
    chunkSizeWarningLimit: 800,
  },
})
