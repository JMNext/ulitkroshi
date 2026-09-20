import { createBaseDrag } from "@/MainScene/components/PetCharacter/animations/createBaseDrag";
import { EAT_SOUND_URL, PET_LOCK_BUBBLES } from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { DYNAMIC_BOOSTS } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/constants/shop.constants";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";

let cachedEatAudio: HTMLAudioElement | null = null;
let isFeedingProcessing = false;
let alertTimeoutId: number | null = null;

export const startFeedingDrag = (
  initialEvent: React.PointerEvent<HTMLDivElement> | PointerEvent,
  foodKey: string,
  fruitId?: string,
  onDragEndCallback?: () => void,
  scale = 1,
  s = 1
) => {
  if (typeof window !== "undefined" && !cachedEatAudio) {
    cachedEatAudio = new Audio(EAT_SOUND_URL);
    cachedEatAudio.volume = 0.5;
  }

  if (isFeedingProcessing) {
    if (onDragEndCallback) onDragEndCallback();
    return;
  }

  const store = usePetStore.getState();
  let hpRestoreValue = 25;
  let restoresHp = true;

  if (fruitId) {
    const activeFruitStoreId = store.inventory?.activeIds?.[fruitId];
    if (activeFruitStoreId) {
      const shopItem = DYNAMIC_BOOSTS.find((b) => b.id === Number(activeFruitStoreId));
      if (shopItem) {
        restoresHp = shopItem.type.startsWith("health");
        const match = shopItem.type.match(/\d+/);
        hpRestoreValue = match ? Number(match) : 25;
      }
    } else {
      if (fruitId === "fruit_02") hpRestoreValue = 50;
      if (fruitId === "fruit_03" || fruitId === "fruit_04") restoresHp = false;
    }
  }

  createBaseDrag(
    initialEvent,
    {
      url: foodKey,
      action: "eat",
      onSuccess: () => {
        if (isFeedingProcessing) return;

        const currentStore = usePetStore.getState();
        const mainGameStore = useMainGameStore.getState();
        const alertMsg = PET_LOCK_BUBBLES.fullHpStorePhrase;

        if (fruitId && currentStore.hp >= 100 && restoresHp) {
          if (typeof mainGameStore.setAlertText === "function") {
            if (alertTimeoutId) clearTimeout(alertTimeoutId);

            mainGameStore.setAlertText(alertMsg);

            alertTimeoutId = window.setTimeout(() => {
              mainGameStore.setAlertText(null);
            }, 3000);
          } else {
            window.dispatchEvent(
              new CustomEvent("ui_show_bubble", {
                detail: { text: alertMsg, type: "error" }
              })
            );
          }

          isFeedingProcessing = false;
          if (onDragEndCallback) onDragEndCallback();
          return;
        }

        const result = fruitId
          ? currentStore.useFruitId(fruitId, hpRestoreValue, restoresHp, false)
          : currentStore.useFruitId("standard_food", 1, true, true);

        if (result === "FULL_HP") {
          if (typeof mainGameStore.setAlertText === "function") {
            if (alertTimeoutId) clearTimeout(alertTimeoutId);

            mainGameStore.setAlertText(alertMsg);

            alertTimeoutId = window.setTimeout(() => {
              mainGameStore.setAlertText(null);
            }, 3000);
          } else {
            window.dispatchEvent(
              new CustomEvent("ui_show_bubble", {
                detail: { text: alertMsg, type: "error" }
              })
            );
          }

          isFeedingProcessing = false;
          if (onDragEndCallback) onDragEndCallback();
        } else if (result === "SUCCESS") {
          isFeedingProcessing = true;

          currentStore.triggerCareAction("eat");
          if (typeof currentStore.playVideo === "function") {
            currentStore.playVideo("eat");
          }

          if (cachedEatAudio) {
            cachedEatAudio.currentTime = 0;
            cachedEatAudio.play().catch(() => {});
          }

          const timeoutId = setTimeout(() => {
            isFeedingProcessing = false;
          }, 4550);

          const handleClean = () => {
            clearTimeout(timeoutId);
            isFeedingProcessing = false;
            window.removeEventListener("beforeunload", handleClean);
          };
          window.addEventListener("beforeunload", handleClean);
        }
      },
      onEnd: () => {
        if (onDragEndCallback) onDragEndCallback();
      }
    },
    scale,
    s
  );
};
