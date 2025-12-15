import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/domain_expansion/',
  define: {
    // Polyfill process.env for the browser environment so the app doesn't crash on existing process.env references
    'process.env': {}
  },
  build: {
    outDir: 'dist',
  }
});