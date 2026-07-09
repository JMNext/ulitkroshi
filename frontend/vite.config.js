import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  // Задаем относительные пути для корректного деплоя на Netlify Drop
  base: './',
  plugins: [tailwindcss()],
  server: {
    port: 3000, // Удобный порт для разработки
    open: true, // Автоматически открывать браузер при старте
  },
  build: {
    // Увеличили лимит до 2000, чтобы скрыть предупреждение о размере Phaser
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 0, // Не превращать маленькие картинки в base64, чтобы Phaser корректно читал пути

    // Внутренние настройки сборщика Vite 8 / Rolldown для Phaser
    rolldownOptions: {
      output: {
        // Гарантирует выполнение JS-модулей ровно в том порядке, в котором они были импортированы
        strictExecutionOrder: true,
      },
    },
  },
});
