export interface ShuffleCardItem { x: number; y: number; }

export const checkCardsMatchLogic = (k1: string, k2: string): boolean => k1 === k2;

export const generateDeckLogic = (pairsCount: number, fruitsPool: string[]): string[] => {
  const shuffledFruits = [...fruitsPool].sort(() => Math.random() - 0.5);
  const deck = shuffledFruits.slice(0, pairsCount);
  return [...deck, ...deck].sort(() => Math.random() - 0.5);
};
