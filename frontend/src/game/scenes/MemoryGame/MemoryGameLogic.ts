export interface ShuffleCardItem { x: number; y: number; }

export const checkCardsMatchLogic = (k1: string, k2: string): boolean => k1 === k2;

export const generateDeckLogic = (pairsCount: number, fruitsPool: string[]): string[] => {
  let pool: string[] = [];
  while (pool.length < pairsCount) {
    pool = pool.concat([...fruitsPool].sort(() => Math.random() - 0.5));
  }
  const deck = pool.slice(0, pairsCount);
  return [...deck, ...deck].sort(() => Math.random() - 0.5);
};

export const calculateShufflePositionsLogic = (pos: ShuffleCardItem[]): ShuffleCardItem[] => {
  const res = pos.map(p => ({ ...p }));
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  if (res.length > 1 && res.every((p, i) => p.x === pos[i].x && p.y === pos[i].y)) {
    res.push(res.shift()!);
  }
  return res;
};
