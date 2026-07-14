import Phaser from 'phaser';

interface SceneWithModal extends Phaser.Scene {
  minigameModalInstance?: HTMLDivElement | null;
}

interface GameItem { text: string; icon: 'memory' | 'catch' | 'snake'; scene: string; }
interface DiffItem { text: string; diff: string; color: string; }

const ICONS = {
  memory: `<svg class="w-full h-full text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>`,
  catch: `<svg class="w-full h-full text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20 10c0-4.42-3.58-8-8-8s-8 3.58-8 8c0 3.82 2.66 7.02 6.21 7.82-.41.68-.41 1.52 0 2.2a8.003 8.003 0 0 0 11.58-7.82c0-.7-.1-1.38-.21-2.02M12 4c3.31 0 6 2.69 6 6 0 2.45-1.48 4.56-3.6 5.47-.4-.84-.4-1.84 0-2.68C15.82 11.75 17 10 17 10s-1.75.05-2.73.57c-.85.45-1.88.42-2.7 0C10.58 10.05 9 10 9 10s1.18 1.75 2.52 2.79c.42.84.42 1.84 0 2.68C9.4 14.56 8 12.45 8 10c0-3.31 2.69-6 6-6z"/></svg>`,
  snake: `<svg class="w-full h-full text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`
};

const close = (scene: SceneWithModal, backdrop: HTMLDivElement, modal: HTMLDivElement): void => {
  scene.minigameModalInstance = null;
  backdrop.classList.add('opacity-0');
  modal.classList.add('translate-y-12', 'opacity-0');
  setTimeout(() => backdrop.remove(), 300);
};

export const showMinigameModal = (scene: SceneWithModal): void => {
  if (scene.minigameModalInstance) return;

  const backdrop = document.createElement('div');
  backdrop.className = "fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] opacity-0 transition-opacity duration-300 pointer-events-auto p-4 box-border";

  const modal = document.createElement('div');
  modal.className = "bg-white px-5 py-6 sm:px-6 sm:py-8 rounded-[28px] sm:rounded-[32px] shadow-2xl relative transform translate-y-12 opacity-0 transition-all duration-300 ease-out box-border flex flex-col items-center w-full max-w-[420px] select-none";

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.innerText = '←';
  backBtn.className = "absolute left-5 top-5 sm:left-6 sm:top-6 text-xl sm:text-2xl text-gray-400 hover:text-gray-600 bg-transparent border-none font-black cursor-pointer transition-colors duration-200 hidden focus:outline-none p-1 pointer-events-auto";

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.innerText = '✕';
  closeBtn.className = "absolute right-5 top-5 sm:right-6 sm:top-6 text-xl sm:text-2xl text-gray-400 hover:text-gray-600 bg-transparent border-none font-black cursor-pointer transition-colors duration-200 focus:outline-none p-1 pointer-events-auto";
  closeBtn.addEventListener('click', () => close(scene, backdrop, modal));

  const titleEl = document.createElement('h2');
  titleEl.className = "text-[#1a3d1c] font-black text-xl sm:text-2xl md:text-3xl tracking-wide text-center uppercase mt-3 mb-4 sm:mb-6 select-none max-w-[75%]";

  const contentContainer = document.createElement('div');
  contentContainer.className = "w-full flex flex-col items-center gap-3 sm:gap-4 box-border mt-auto mb-auto";

  modal.append(backBtn, closeBtn, titleEl, contentContainer);
  backdrop.appendChild(modal);
  (document.getElementById('game-container') || document.body).appendChild(backdrop);
  
  scene.minigameModalInstance = modal;

  requestAnimationFrame(() => {
    backdrop.classList.remove('opacity-0');
    modal.classList.remove('translate-y-12', 'opacity-0');
  });

  const renderMenuButton = (text: string, colorClass: string, icon: keyof typeof ICONS | null, onClick: () => void) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `${colorClass} text-white font-black border-none cursor-pointer flex items-center justify-center relative shadow-md transition-all duration-100 uppercase select-none hover:brightness-105 active:scale-[0.97] box-border w-full max-w-[360px] h-12 sm:h-14 rounded-full text-sm sm:text-base md:text-lg px-10 pointer-events-auto`;
    
    if (icon) {
      const iconWrapper = document.createElement('div');
      iconWrapper.className = "absolute left-4 sm:left-5 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center";
      iconWrapper.innerHTML = ICONS[icon];
      btn.appendChild(iconWrapper);
    }

    const textSpan = document.createElement('span');
    textSpan.innerText = text;
    
    btn.appendChild(textSpan);
    btn.addEventListener('click', onClick);
    contentContainer.appendChild(btn);
  };

  const renderMainMenu = () => {
    contentContainer.innerHTML = '';
    backBtn.classList.add('hidden');
    titleEl.innerText = 'МИНИ-ИГРЫ';

    const games: GameItem[] = [
      { text: 'НАЙДИ ПАРУ', icon: 'memory', scene: 'MemoryGameScene' },
      { text: 'ЛОВЛЯ ФРУКТОВ', icon: 'catch', scene: 'CatchGameScene' },
      { text: 'ЗМЕЙКА', icon: 'snake', scene: 'SnakeGameScene' },
    ];

    games.forEach(g => renderMenuButton(g.text, "bg-[#61aa05]", g.icon, () => renderDifficultyMenu(g.scene)));
  };

  const renderDifficultyMenu = (targetScene: string) => {
    contentContainer.innerHTML = '';
    backBtn.classList.remove('hidden');
    titleEl.innerText = 'СЛОЖНОСТЬ';

    const modes: DiffItem[] = [
      { text: 'ЛЕГКО', diff: 'easy', color: "bg-[#61aa05]" },
      { text: 'НОРМАЛЬНО', diff: 'medium', color: "bg-[#f9b300]" },
      { text: 'СЛОЖНО', diff: 'hard', color: "bg-[#d32f2f]" },
    ];

    modes.forEach(m => {
      renderMenuButton(m.text, m.color, null, () => {
        scene.minigameModalInstance = null;
        backdrop.remove();
        scene.scene.start(targetScene, { difficulty: m.diff });
      });
    });
  };

  backBtn.addEventListener('click', renderMainMenu);
  renderMainMenu();
};
