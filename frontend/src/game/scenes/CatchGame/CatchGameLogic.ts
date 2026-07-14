export const getMovedPlayerX = (currentX: number, moveDirection: number, speed: number, minX: number, maxX: number): number => {
  if (moveDirection === 0) return currentX;
  const targetX = currentX + moveDirection * speed;
  return targetX < minX ? minX : (targetX > maxX ? maxX : targetX);
};

export const checkFruitCaughtLogic = (fruitX: number, fruitY: number, playerX: number, playerY: number, catchRadius: number): boolean => {
  if (fruitY < playerY - 45 || fruitY > playerY + 20) return false;
  return Math.abs(fruitX - playerX) < catchRadius * 0.8;
};
