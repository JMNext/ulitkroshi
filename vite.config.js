import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

function phaserHmrFix() {
  return {
    name: 'phaser-hmr-fix',
    handleHotUpdate({ file, server }) {
      if (file.includes('Scene') || file.includes('game.config') || file.endsWith('.ts')) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    }
  };
}

export default defineConfig({
  root: "./frontend",

  plugins: [
    tailwindcss(),
    react(),
    phaserHmrFix(),
    checker({
      typescript: {
        tsconfigPath: "./tsconfig.json"
      },
      overlay: false
    })
  ],

  server: {
    port: 3000,
    host: true,
    open: true
  },

  resolve: {
    alias: {
      "@": path.resolve("frontend/src")
    }
  },

  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("phaser")) return "phaser";
            if (id.includes("react")) return "react-vendor";
            return "vendor";
          }
        }
      }
    }
  },

  assetsInclude: ["**/*.mp3", "**/*.otf", "**/*.woff2"]
});
