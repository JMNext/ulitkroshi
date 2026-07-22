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
    chunkSizeWarningLimit: 4000,
    assetsInlineLimit: 0,
    rolldownOptions: {
      output: {
        strictExecutionOrder: true,
        codeSplitting: {
          groups: [
            {
              name: 'game-vendor',
              test: /node_modules[\\/](phaser|antd|react|react-dom)/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});
