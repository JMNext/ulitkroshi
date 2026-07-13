export interface SnakePoint { x: number; y: number; }

export type SnakeDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export const getNextLogicalPosition = (head: SnakePoint, dir: SnakeDirection | string): SnakePoint => {
  const offsets: Record<string, SnakePoint> = { 
    UP: { x: 0, y: -1 }, 
    DOWN: { x: 0, y: 1 }, 
    LEFT: { x: -1, y: 0 }, 
    RIGHT: { x: 1, y: 0 } 
  };
  const offset = offsets[dir] || { x: 0, y: 0 };
  return { x: head.x + offset.x, y: head.y + offset.y };
};

export const checkSnakeCollisionLogic = (nx: number, ny: number, minX: number, maxX: number, minY: number, maxY: number, snake: SnakePoint[]): boolean => {
  if (nx < minX || nx > maxX || ny < minY || ny > maxY) return true;
  return snake.some(s => s.x === nx && s.y === ny);
};
