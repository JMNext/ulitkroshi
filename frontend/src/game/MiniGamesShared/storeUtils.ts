import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

export const processGamePenalty = (currentScore: number, currentHp: number, force = false) => {
  const score = Math.max(0, currentScore - 1);
  const hp = force ? 0 : currentHp - 25;
  const over = hp <= 0 || force;
  const win = currentScore >= 20;

  if (over) {
    useMainGameStore.getState().setGameOver(score, undefined, win);
    if (!win) usePetStore.getState().handleGameLoss();
  }

  return { hp, score, isCrashed: !over, isGameOver: over, isWin: over ? win : false };
};
