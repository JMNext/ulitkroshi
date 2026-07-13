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
      const coinRadius = width < height ? 14 : 20;
      const c = scene.add.graphics().fillStyle(0xf9b300, 1).fillCircle(0, 0, coinRadius).lineStyle(Math.max(2, coinRadius * 0.15), 0xffffff, 0.5).strokeCircle(0, 0, coinRadius).setDepth(30);
      
      c.x = width / 2 + Phaser.Math.Between(-30, 30);
      c.y = height / 2 + Phaser.Math.Between(-30, 30);
      
      scene.tweens.add({
        targets: c,
        x: c.x + Phaser.Math.Between(-maxHorizontalSpread, maxHorizontalSpread),
        y: c.y - Phaser.Math.Between(150, maxVerticalSpread),
        scale: 1.3,
        duration: 550,
        ease: 'Quad.easeOut',
        onComplete: () => scene.tweens.add({
          targets: c,
          y: height + 50,
          alpha: 0,
          scale: 0.5,
          duration: 500,
          ease: 'Quad.easeIn',
          onComplete: () => c.destroy()
        })
      });
    });
  }
};

export const createBaseGameOverModal = (scene: Phaser.Scene, config: GameOverConfig): void => {
  const { title, resultLabel, score, buttonText, onBack, onRestart, isWin = false } = config;

  const backdrop = document.createElement('div');
  backdrop.className = "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999999] opacity-0 transition-opacity duration-200 pointer-events-auto p-4 box-border";

  const borderColor = isWin ? "border-[#61aa05]" : "border-[#d32f2f]";
  const titleColor = isWin ? "text-[#1a3d1c]" : "text-[#d32f2f]";

  const modal = document.createElement('div');
  modal.className = `bg-white border-4 border-solid ${borderColor} px-5 py-6 sm:px-8 sm:py-10 rounded-[28px] sm:rounded-[32px] text-center shadow-2xl transform scale-95 opacity-0 transition-all duration-200 box-border flex flex-col items-center justify-center w-full max-w-[340px] sm:max-w-[440px] select-none`;

  const titleEl = document.createElement('h1');
  titleEl.innerText = title;
  titleEl.className = `${titleColor} font-black m-0 mb-2 sm:mb-3 p-0 leading-tight text-2xl sm:text-4xl uppercase tracking-wide select-none`;

  const scoreEl = document.createElement('p');
  scoreEl.innerText = `${resultLabel}: ${score}`;
  scoreEl.className = "text-[#4a4a4a] font-black m-0 mb-5 sm:mb-6 p-0 leading-none text-lg sm:text-2xl";

  modal.append(titleEl, scoreEl);

  const btnContainer = document.createElement('div');
  btnContainer.className = "flex flex-col sm:flex-row gap-3 w-full justify-center items-center mt-2 max-w-[280px] sm:max-w-none";

  const closeModal = (action: () => void) => {
    backdrop.classList.add('opacity-0');
    modal.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { 
      backdrop.remove(); 
      action(); 
    }, 200);
  };

  if (onRestart) {
    const restartBtn = document.createElement('button');
    restartBtn.type = 'button';
    restartBtn.innerText = "ЗАНОГО";
    restartBtn.className = "bg-[#61aa05] hover:bg-[#73d13d] active:bg-[#389e0d] text-white font-bold border-none cursor-pointer text-center transition-all duration-100 uppercase tracking-wide select-none shadow-md box-border w-full sm:w-1/2 h-11 sm:h-12 rounded-full text-sm sm:text-base active:scale-[0.97] pointer-events-auto";
    restartBtn.addEventListener('click', () => closeModal(onRestart));
    btnContainer.appendChild(restartBtn);
  }

  const actionBtn = document.createElement('button');
  actionBtn.type = 'button';
  actionBtn.innerText = buttonText;
  actionBtn.className = onRestart
    ? "bg-slate-500 hover:bg-slate-400 active:bg-slate-600 text-white font-bold border-none cursor-pointer text-center transition-all duration-100 uppercase tracking-wide select-none shadow-md box-border w-full sm:w-1/2 h-11 sm:h-12 rounded-full text-sm sm:text-base active:scale-[0.97] pointer-events-auto"
    : "bg-[#61aa05] hover:bg-[#73d13d] active:bg-[#389e0d] text-white font-bold border-none cursor-pointer text-center transition-all duration-100 uppercase tracking-wide select-none shadow-md box-border w-full max-w-[240px] sm:max-w-[280px] h-11 sm:h-12 rounded-full text-sm sm:text-lg active:scale-[0.97] pointer-events-auto";
  
  actionBtn.addEventListener('click', () => closeModal(onBack));
  btnContainer.appendChild(actionBtn);

  modal.appendChild(btnContainer);
  backdrop.appendChild(modal);
  (document.getElementById('game-container') || document.body).appendChild(backdrop);

  requestAnimationFrame(() => {
    backdrop.classList.remove('opacity-0');
    modal.classList.remove('scale-95', 'opacity-0');
  });
};
