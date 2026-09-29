import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

const pkg = JSON.parse(fs.readFileSync(new URL("./package.json", import.meta.url), "utf-8"));

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
    __APP_VERSION__: JSON.stringify(pkg.version)
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
