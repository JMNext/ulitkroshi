import confetti from 'canvas-confetti';

export const COIN_IMAGE_URL = new URL('@/assets/buttom_menu-icons/eat.svg', import.meta.url).href;

export const GAMEOVER_TEXTS = {
  winTitle: 'ПОБЕДА!',
  loseTitle: 'ИГРА ОКОНЧЕНА',
  scoreLabel: 'СЧЕТ:',
  rewardLabel: 'Награда:',
  restartBtn: 'ИГРАТЬ СНАЧАЛА',
  exitBtn: 'В МЕНЮ'
};

export const CONFETTI_BASE_CONFIG = { 
  particleCount: 6, 
  spread: 55, 
  origin: { y: 0.85 }, 
  colors: ['#ff9800', '#ffca28', '#ffd700'], 
  shapes: ['circle' as confetti.Shape], 
  scalar: 1.6 
};

export const getGameOverModalScale = (w: number, h: number): number => {
  const isPortrait = h > w;

  if (isPortrait) {
    if (w < 450) {
      // Идеальный компактный размер для узких вертикальных смартфонов (Fold, SE, Pixel)
      return 0.95; 
    }
    // Для обычных вертикальных экранов побольше
    return 1.05; 
  }

  // Горизонтальный режим (десктоп и мобилки на боку) возвращаем к вашему исходному комфортному балансу
  const isTablet = w > h && w / h < 1.6;
  if (isTablet) return 0.85;

  return Math.max(0.8, Math.min(1.1, w / 960));
};
