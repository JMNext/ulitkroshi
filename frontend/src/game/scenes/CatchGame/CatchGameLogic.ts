export const getMovedPlayerX = (currentX: number, moveDirection: number, speed: number, minX: number, maxX: number): number => 
  moveDirection === 0 ? currentX : Math.min(Math.max(currentX + moveDirection * speed, minX), maxX);

export const checkFruitCaughtLogic = (fruitX: number, fruitY: number, playerX: number, playerY: number, catchRadius: number): boolean => 
  Math.abs(fruitX - playerX) < catchRadius * 0.8 && fruitY >= playerY - 45 && fruitY <= playerY + 20;
