import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { startFeedingDrag } from "@/MainScene/components/PetCharacter/animations/startFeedingDrag";
import { startPlayingDrag } from "@/MainScene/components/PetCharacter/animations/startPlayingDrag";
import { startWashingDrag } from "@/MainScene/components/PetCharacter/animations/startWashingDrag";
import { triggerSleepingClick } from "@/MainScene/components/PetCharacter/animations/sleepPet";
import { getFruitUrlByStoreId } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/shop.constants";

export type CareActionType = "wash" | "play" | "feed" | "sleep";

export interface BaseDragConfig {
  url: string;
  action: "wash" | "play" | "eat";
  onSuccess: () => void;
  onEnd?: () => void;
}

const DRAG_METHODS = { play: startPlayingDrag, wash: startWashingDrag } as const;

export const handleCareActionDown = (
  type: CareActionType,
  btn: HTMLElement,
  scale: number,
  s: number,
  e: PointerEvent
) => {
  const petStore = usePetStore.getState();
  const gameStore = useMainGameStore.getState();

  if (!petStore.canExecuteAction(type)) return;
  if (type === "sleep") return triggerSleepingClick();

  const defIcon = btn.getAttribute("data-ui-default-icon") || "";

  if (type === "feed") {
    const { currentFruitId: fId, fruitsCounts: fCounts } = petStore;
    const hasFruit = fId && (fCounts?.[fId] ?? 0) > 0;
    const startX = e.clientX, startY = e.clientY;

    const icon = hasFruit ? (btn.parentElement?.getAttribute("data-active-fruit-icon") || defIcon) : defIcon;
    const targetId = hasFruit ? fId : undefined;

    const handlePointerMove = (me: PointerEvent) => {
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      if (dx * dx + dy * dy > 100) {
        cleanup();
        startFeedingDrag(e, icon, targetId, undefined, scale, s);
      }
    };

    const handlePointerUp = (ue: PointerEvent) => {
      cleanup();
      const dx = ue.clientX - startX;
      const dy = ue.clientY - startY;
      if (dx * dx + dy * dy <= 100) {
        gameStore.setIsFoodOpen((p) => !p);
      }
    };

    const cleanup = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    return;
  }

  const drag = DRAG_METHODS[type as keyof typeof DRAG_METHODS];
  if (drag) drag(e, defIcon, undefined, scale, s);
};

export const handleFruitActionDown = (id: string, isZero: boolean, scale: number, s: number, e: PointerEvent) => {
  const gameStore = useMainGameStore.getState();
  if (isZero) return gameStore.setModal("shop");

  const petStore = usePetStore.getState();
  const iconUrl = getFruitUrlByStoreId(petStore.activeFruitIds[id] ?? 1) || "";

  gameStore.setIsFoodOpen(false);
  startFeedingDrag(e, iconUrl, id, undefined, scale, s);
};

export const createBaseDrag = (
  ie: React.PointerEvent<HTMLDivElement> | PointerEvent,
  config: BaseDragConfig,
  scale = 1,
  s = 1
): void => {
  if (!["prostoi1", "prostoi2", "sad_state"].includes(usePetStore.getState().currentAnim ?? "prostoi1")) {
    return config.onEnd?.();
  }

  const targetElement = ie.target as HTMLElement;
  try {
    if (targetElement && typeof targetElement.setPointerCapture === "function") {
      targetElement.setPointerCapture(ie.pointerId);
    }
  } catch (err) {}

  const ratio = window.innerWidth / window.innerHeight;
  const mode = ratio < 1 ? (ratio < 0.42 ? "u" : "v") : "d";
  const conf = { u: { c: "w-12 h-12", r: 75 }, v: { c: "w-14 h-14", r: 110 }, d: { c: "w-20 h-20", r: 140 } }[mode];

  const rect = document.getElementById("phaser-native-html-pet")?.getBoundingClientRect();
  const targetX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const targetY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
  const radiusSq = conf.r * conf.r;

  const ghost = document.createElement("div");
  ghost.className = `fixed top-0 left-0 pointer-events-none ${conf.c} z-50 [will-change:transform]`;
  
  const updateTransform = (x: number, y: number) => {
    ghost.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale * s})`;
  };
  updateTransform(ie.clientX, ie.clientY);

  const img = document.createElement("img");
  img.src = config.url;
  img.className = "w-full h-full object-contain block";
  ghost.appendChild(img);
  document.body.appendChild(ghost);

  let transformTicking = false;
  const handleDragMove = (e: PointerEvent) => {
    if (!transformTicking) {
      requestAnimationFrame(() => {
        updateTransform(e.clientX, e.clientY);
        transformTicking = false;
      });
      transformTicking = true;
    }
  };

  const handleDragUp = (e: PointerEvent) => {
    window.removeEventListener("pointermove", handleDragMove);
    window.removeEventListener("pointerup", handleDragUp);
    
    try {
      if (targetElement && typeof targetElement.releasePointerCapture === "function") {
        targetElement.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}

    ghost.remove();

    const dx = e.clientX - targetX;
    const dy = e.clientY - targetY;
    if (dx * dx + dy * dy <= radiusSq) {
      config.onSuccess();
    }
    config.onEnd?.();
  };

  window.addEventListener("pointermove", handleDragMove, { passive: true });
  window.addEventListener("pointerup", handleDragUp, { passive: true });
};
