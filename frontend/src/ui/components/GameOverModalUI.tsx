import Phaser from 'phaser';

interface GameOverConfig {
  title: string;
  resultLabel: string;
  score: number;
  buttonText: string;
  onBack: () => void;
  onRestart?: () => void;
  isWin?: boolean;
}

export const animateCoinExplosion = (scene: Phaser.Scene, amount: number): void => {
  const { width, height } = scene.scale;
  const maxHorizontalSpread = Math.min(400, width * 0.4);
  const maxVerticalSpread = Math.min(450, height * 0.5);

  for (let i = 0; i < amount; i++) {
    scene.time.delayedCall(i * 30, () => {
      // ИСПРАВЛЕНО: Более гибкий расчет радиуса монет под экраны Fold и Nest Hub
      const isUltraNarrow = (width / height) < 0.5;
      const coinRadius = isUltraNarrow ? 12 : (width < height ? 15 : 18);
      
      const c = scene.add
        .graphics()
        .fillStyle(0xf9b300, 1)
        .fillCircle(0, 0, coinRadius)
        .lineStyle(Math.max(2, coinRadius * 0.15), 0xffffff, 0.5)
        .strokeCircle(0, 0, coinRadius)
        .setDepth(30);

      c.x = width / 2 + Phaser.Math.Between(-20, 20);
      c.y = height / 2 + Phaser.Math.Between(-20, 20);

      scene.tweens.add({
        targets: c,
        x: c.x + Phaser.Math.Between(-maxHorizontalSpread, maxHorizontalSpread),
        y: c.y - Phaser.Math.Between(120, maxVerticalSpread),
        scale: 1.2,
        duration: 520,
        ease: 'Quad.easeOut',
        onComplete: () =>
          scene.tweens.add({
            targets: c,
            y: height + 40,
            alpha: 0,
            scale: 0.5,
            duration: 480,
            ease: 'Quad.easeIn',
            onComplete: () => c.destroy(),
          }),
      });
    });
  }
};

export const createBaseGameOverModal = (scene: Phaser.Scene, config: GameOverConfig): void => {
  const { title, resultLabel, score, buttonText, onBack, onRestart, isWin = false } = config;

  const w = window.innerWidth;
  const h = window.innerHeight;
  const isPort = w < h;
  const isLandscapeTablet = !isPort && (w / h) < 1.72; // Наш проверенный флаг для Nest Hub / Max
  const isUltraNarrow = isPort && (w / h) < 0.5;       // Наш проверенный флаг для Galaxy Fold

  // ИСПРАВЛЕНО: Динамический масштаб всей модалки для жесткого контроля высоты и ширины
  let modalScale = 1.0;
  if (isUltraNarrow) {
    modalScale = Math.min(w / 360, 0.85); // Идеально ужимаем под ширину Fold
  } else if (isLandscapeTablet) {
    modalScale = h < 650 ? 0.72 : 0.85;  // Не даем вылезти за границы 600px высоты Nest Hub
  }

  const backdrop = document.createElement('div');
  backdrop.className =
    'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999999] opacity-0 transition-opacity duration-200 pointer-events-auto p-4 box-border';

  const borderColor = isWin ? 'border-[#61aa05]' : 'border-[#d32f2f]';
  const titleColor = isWin ? 'text-[#1a3d1c]' : 'text-[#d32f2f]';

  const modal = document.createElement('div');
  // Убрали дефолтный scale-95 для корректной работы кастомной матрицы трансформации
  modal.className = `bg-white border-4 border-solid ${borderColor} px-5 py-5 sm:px-6 sm:py-7 rounded-[32px] text-center shadow-2xl opacity-0 transition-all duration-200 box-border flex flex-col items-center justify-center w-full max-w-[320px] sm:max-w-[420px] select-none`;
  modal.style.transform = `scale(${modalScale}) translateY(10px)`;
  modal.style.transformOrigin = 'center center';

  const titleEl = document.createElement('h1');
  titleEl.innerText = title;
  titleEl.className = `${titleColor} font-black m-0 mb-1.5 p-0 leading-none text-2xl sm:text-3xl uppercase tracking-wide select-none`;

  const scoreEl = document.createElement('p');
  scoreEl.innerText = `${resultLabel}: ${score}`;
  scoreEl.className =
    'text-[#4a4a4a] font-black m-0 mb-4 sm:mb-5 p-0 leading-none text-lg sm:text-xl';

  modal.append(titleEl, scoreEl);

  const btnContainer = document.createElement('div');
  // ИСПРАВЛЕНО: Заменили sm:flex-row на жесткий flex-row для ландшафтных планшетов типа Nest Hub
  btnContainer.className = isPort 
    ? 'flex flex-col gap-2.5 w-full justify-center items-center mt-1 max-w-[260px]'
    : 'flex flex-row gap-3 w-full justify-center items-center mt-1 max-w-[360px]';

  const closeModal = (action: () => void) => {
    backdrop.classList.add('opacity-0');
    modal.style.transform = `scale(${modalScale}) translateY(10px)`;
    modal.classList.add('opacity-0');
    setTimeout(() => {
      backdrop.remove();
      action();
    }, 200);
  };

  // ИСПРАВЛЕНО: Оптимизировали размеры шрифтов текста (text-xs для мобилок), чтобы длинные слова не ломали границы кнопок
  if (onRestart) {
    const restartBtn = document.createElement('button');
    restartBtn.type = 'button';
    restartBtn.innerText = 'ИГРАТЬ СНАЧАЛА';
    restartBtn.className =
      'bg-[#61aa05] hover:bg-[#73d13d] active:bg-[#389e0d] text-white font-black border-none cursor-pointer text-center transition-all duration-100 uppercase tracking-wide select-none shadow-md box-border w-full h-11 rounded-full text-xs sm:text-sm active:scale-[0.97] pointer-events-auto px-2 whitespace-nowrap';
    restartBtn.addEventListener('click', () => closeModal(onRestart));
    btnContainer.appendChild(restartBtn);
  }

  const actionBtn = document.createElement('button');
  actionBtn.type = 'button';
  actionBtn.innerText = buttonText;
  
  // Рассчитываем ширину кнопки в зависимости от наличия кнопки рестарта
  const widthClass = onRestart ? 'w-full' : 'w-full max-w-[220px] sm:max-w-[260px]';
  const textClass = onRestart ? 'text-xs sm:text-sm' : 'text-sm sm:text-base';

  actionBtn.className = onRestart
    ? `bg-slate-500 hover:bg-slate-400 active:bg-slate-600 text-white font-black border-none cursor-pointer text-center transition-all duration-100 uppercase tracking-wide select-none shadow-md box-border h-11 rounded-full active:scale-[0.97] pointer-events-auto px-2 whitespace-nowrap ${widthClass} ${textClass}`
    : `bg-[#61aa05] hover:bg-[#73d13d] active:bg-[#389e0d] text-white font-black border-none cursor-pointer text-center transition-all duration-100 uppercase tracking-wide select-none shadow-md box-border h-11 rounded-full active:scale-[0.97] pointer-events-auto px-2 whitespace-nowrap ${widthClass} ${textClass}`;

  actionBtn.addEventListener('click', () => closeModal(onBack));
  btnContainer.appendChild(actionBtn);

  modal.appendChild(btnContainer);
  backdrop.appendChild(modal);
  (document.getElementById('game-container') || document.body).appendChild(backdrop);

  requestAnimationFrame(() => {
    backdrop.classList.remove('opacity-0');
    modal.classList.remove('opacity-0');
    modal.style.transform = `scale(${modalScale}) translateY(0px)`;
  });
};
