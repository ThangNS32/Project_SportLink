import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    holdUntilCrawlEnd: false,
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-dev-runtime',
      'react/jsx-runtime',
      'react-router-dom',
      'axios',
      'leaflet',
      'react-leaflet',
      '@react-leaflet/core',
      'lucide-react',
      'firebase/app',
      'firebase/firestore',
    ],
  },
  build: {
    cssMinify: 'esbuild',
  },
})
