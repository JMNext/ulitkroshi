import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

// Кастомный плагин HMR для полной перезагрузки сцен Phaser
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
  // Заменили жесткий root: "path.resolve" на относительный путь для Vite
  root: "./frontend",

  plugins: [
    tailwindcss(),
    react(),
    phaserHmrFix(),
    checker({
      typescript: {
        tsconfigPath: "./tsconfig.json" // Упростили путь до конфига TypeScript
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
      // Упростили запись алиаса. Свойство root автоматически подставит
      // нужный базовый путь к папке src фронтенда
      "@": path.resolve("frontend/src")
    }
  },

  build: {
    outDir: "../dist", // Изменили на относительный путь от корня root (папки frontend) наружу
    emptyOutDir: true,
    assetsInlineLimit: 4096,
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

  assetsInclude: ["**/*.mp3"]
});
