import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  define: {
    // replace global references at build-time with globalThis
    global: 'globalThis',
  },
  build: {
    sourcemap: true,
  },
  base: process.env.NODE_ENV === 'production' ? '/Reomotework/' : '/',
});
