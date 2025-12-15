import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Set base to repository subpath so built assets resolve on GitHub Pages
export default defineConfig({
  base: '/domain_expansion/',
  plugins: [react()],
});
