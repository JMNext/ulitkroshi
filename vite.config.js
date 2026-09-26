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
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // ПРОДВИНУТАЯ ОПТИМИЗАЦИЯ: Разрезаем бандл на независимые асинхронные потоки
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("phaser")) return "engine-phaser"; // Выносим тяжелый движок Phaser в отдельный файл
            if (id.includes("react")) return "engine-react";   // Выносим React
            return "vendor-libs"; // Все остальные сторонние библиотеки
          }
          // Автоматически изолируем код мини игр от стартового экрана логина
          if (id.includes("MiniGames")) {
            return "game-content-pack";
          }
        }
      }
    }
  },

  assetsInclude: ["**/*.mp3"]
});
