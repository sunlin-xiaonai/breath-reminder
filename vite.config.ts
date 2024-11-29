import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: '127.0.0.1',
    port: 5175,
    strictPort: false,
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    watch: null
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});