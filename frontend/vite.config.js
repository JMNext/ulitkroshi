import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', 
  plugins: [tailwindcss()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 0,
    rolldownOptions: {
      output: {
        strictExecutionOrder: true,
      },
    },
  },
});
