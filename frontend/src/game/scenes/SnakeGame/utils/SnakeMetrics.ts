export interface GameMetrics {
  gridSize: number;
  offsetX: number;
  offsetY: number;
}

export const calculateSnakeMetrics = (gameWidth: number, gameHeight: number): GameMetrics => {
  const anchor = document.querySelector('.memory-grid-visual-anchor');
  const maxW = anchor ? anchor.clientWidth : gameWidth * 0.6;
  const maxH = anchor ? anchor.clientHeight : gameHeight * 0.6;
  const size = Math.min(Math.floor(maxW / 12), Math.floor(maxH / 12));
  
  return {
    gridSize: size,
    offsetX: Math.floor((gameWidth - 12 * size) / 2),
    offsetY: Math.floor((gameHeight - 12 * size) / 2)
  };
};
