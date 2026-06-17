import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
  json: {
    stringify: true,
  },
  build: {
    rollupOptions: {
      treeshake: false,
      output: {
        manualChunks(id) {
          if (id.includes('/src/data/') || id.includes('\\src\\data\\')) return 'data';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
})
