// Импортируем стили Tailwind (Vite подхватит и скомпилирует их автоматически)
import { App } from './app.js';
import './global.css';

// Запуск логики приложения строго после полной загрузки документа
window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
