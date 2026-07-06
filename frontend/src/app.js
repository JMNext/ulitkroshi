import { Game, AUTO, Scale } from 'phaser';

export class App {
  constructor() {
    this.game = null;
  }

  init() {
    this.game = new Game({
      type: AUTO,
      parent: 'game-container',
      width: window.innerWidth,
      height: window.innerHeight,
      transparent: true,
      scale: {
        mode: Scale.RESIZE,
        autoCenter: Scale.CENTER_BOTH
      },
      scene: {
        preload() {
          const uiContainer = document.getElementById('game-ui');
          if (uiContainer) {
            // Включаем отображение в CSS-потоке браузера
            uiContainer.style.display = 'flex';
            
            // Микрозадержка, чтобы плавная анимация Tailwind (opacity) сработала корректно
            requestAnimationFrame(() => {
              uiContainer.classList.remove('opacity-0');
            });
          }

          // Имитируем наполнение прогресс-бара загрузки
          let progress = 0;
          const progressBar = document.getElementById('ui-progress');
          
          const interval = setInterval(() => {
            progress += 0.05;
            if (progressBar) {
              progressBar.style.width = `${Math.min(progress * 100, 100)}%`;
            }
            
            if (progress >= 1) {
              clearInterval(interval);
            }
          }, 50);
        },

        create() {
          console.log('Фронтенд: Phaser успешно запущен!');
          
          const loader = document.getElementById('ui-loader');
          const startBtn = document.getElementById('ui-start-btn');

          // Небольшая пауза, чтобы плавно завершить показ заполненного прелоадера
          setTimeout(() => {
            if (loader) loader.classList.add('hidden');
            
            if (startBtn) {
              startBtn.classList.remove('hidden');
              
              // Обработка клика по кнопке старта игры
              startBtn.addEventListener('click', () => {
                console.log('Игра начинается!');
                // Здесь будет запуск игрового процесса
              });
            }
          }, 1200);
        }
      }
    });

    window.phaserGame = this.game;
  }
}
