import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { createBaseDrag } from "@/MainScene/components/PetCharacter/animations/createBaseDrag";
import { FOOD_CONFIGS, DEFAULT_FOOD_CONFIG, EAT_SOUND_URL } from "@/MainScene/components/PetCharacter/petCharacter.constants";

const cachedEatAudio = typeof window !== "undefined" ? new Audio(EAT_SOUND_URL) : null;
if (cachedEatAudio) {
  cachedEatAudio.volume = 0.5;
}

export const startFeedingDrag = (
  initialEvent: React.PointerEvent<HTMLDivElement> | PointerEvent,
  foodKey: string,
  fruitId?: string,
  onDragEndCallback?: () => void,
  scale = 1,
  s = 1
) => {
  let isFinalized = false;

  const checkAndResetEmptyFruit = () => {
    if (isFinalized) return;
    isFinalized = true;

    const store = usePetStore.getState();
    if (fruitId && (store.fruitsCounts[fruitId] ?? 0) <= 0 && store.currentFruitId === fruitId) {
      store.setCurrentFruitId("");
    }
    onDragEndCallback?.();
  };

  createBaseDrag(initialEvent, {
    url: foodKey,
    action: "eat",
    onSuccess: () => {
      const store = usePetStore.getState();
      const config = FOOD_CONFIGS[fruitId || foodKey] || DEFAULT_FOOD_CONFIG;

      const result = fruitId 
        ? store.useFruitId(fruitId, config.hpRestoreValue, config.restoresHp, false)
        : store.useFruitId("standard_food", 1, true, true);

      if (result === "FULL_HP") {
        window.dispatchEvent(new CustomEvent("ui_show_bubble", { 
          detail: { text: "Спасибо, я сейчас не голоден!", type: "error" } 
        }));
      } else if (result === "SUCCESS") {
        if (cachedEatAudio) {
          cachedEatAudio.currentTime = 0;
          cachedEatAudio.play().catch(() => {});
        }

        store.triggerCareAction(fruitId ? "eat_fruit" : "eat");
      }
    },
    onEnd: checkAndResetEmptyFruit
  }, scale, s);
};
