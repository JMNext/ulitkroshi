export interface SnakePoint {
  x: number;
  y: number;
}

export interface SnakeState {
  snake: SnakePoint[];
  dir: string;
  nextDir: string;
  score: number;
  hp: number;
  isOver: boolean;
  isPause: boolean;
}

export const processSnakeStepLogic = (s: SnakeState, fx: number, fy: number) => {
  s.dir = s.nextDir;
  const offsets: Record<string, SnakePoint> = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
  };
  
  const n = {
    x: s.snake[0].x + (offsets[s.dir]?.x ?? 0),
    y: s.snake[0].y + (offsets[s.dir]?.y ?? 0)
  };

  if (n.x < 0 || n.x > 11 || n.y < 0 || n.y > 11 || s.snake.some(p => p.x === n.x && p.y === n.y)) {
    s.hp -= 25;
    s.hp <= 0 ? (s.isOver = true) : (s.isPause = true);
    return { isHit: true, didEat: false, head: n };
  }

  s.snake.unshift(n);
  if (n.x === fx && n.y === fy) {
    s.score++;
    if (s.score >= 20) s.isOver = true;
    return { isHit: false, didEat: true, head: n };
  }

  s.snake.pop();
  return { isHit: false, didEat: false, head: n };
};
