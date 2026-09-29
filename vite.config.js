import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

const pkg = JSON.parse(fs.readFileSync(new URL("./package.json", import.meta.url), "utf-8"));

// Динамическое версионирование со сквозным номером сборки из CI/CD (GITHUB_RUN_NUMBER)
// Пример: 1.2.1-b45 на стенде GitHub Actions, либо 1.2.1-dev при локальной разработке
const buildNum = process.env.GITHUB_RUN_NUMBER ? `b${process.env.GITHUB_RUN_NUMBER}` : (process.env.BUILD_NUMBER || "dev");
const appVersion = `${pkg.version}-${buildNum}`;

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
  define: {
    __APP_VERSION__: JSON.stringify(appVersion)
  },

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
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("phaser")) return "engine-phaser";
            if (id.includes("react")) return "engine-react";
            return "vendor-libs";
          }
          if (id.includes("MiniGames")) {
            return "game-content-pack";
          }
        }
      }
    }
  },

  assetsInclude: ["**/*.mp3"]
});
