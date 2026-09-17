import { startFeedingDrag } from "@/MainScene/components/PetCharacter/animations/startFeedingDrag";
import { startPlayingDrag } from "@/MainScene/components/PetCharacter/animations/startPlayingDrag";
import { startWashingDrag } from "@/MainScene/components/PetCharacter/animations/startWashingDrag";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { getFruitUrlByStoreId } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/constants/shop.constants";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";

export type CareActionType = "wash" | "play" | "feed" | "sleep";

export interface BaseDragConfig {
  url: string;
  action: "wash" | "play" | "eat";
  onSuccess: () => void;
  onEnd?: () => void;
}

const DRAG_METHODS = {
  play: startPlayingDrag,
  wash: startWashingDrag
} as const;

export const handleCareActionDown = (
  type: CareActionType,
  defIcon: string,
  activeFruitIcon: string,
  scale: number,
  s: number,
  e: React.PointerEvent<HTMLDivElement>
) => {
  const petStore = usePetStore.getState();
  const gameStore = useMainGameStore.getState();

  if (!petStore.canExecuteAction(type)) return;

  if (type === "sleep") {
    petStore.triggerSleepAction();
    return;
  }

  if (type === "feed") {
    e.stopPropagation();
    const { currentFruitId: fId, fruitsCounts: fCounts } = petStore;
    const hasFruit = fId && fCounts[fId] > 0;
    const startX = e.nativeEvent.clientX;
    const startY = e.nativeEvent.clientY;

    const icon = hasFruit ? activeFruitIcon || defIcon : defIcon;
    const targetId = hasFruit ? fId : undefined;
    let isDraggingTriggered = false;

    const handlePointerMove = (me: PointerEvent) => {
      if (isDraggingTriggered) return;
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      if (dx * dx + dy * dy > 100) {
        isDraggingTriggered = true;
        cleanup();
        startFeedingDrag(e.nativeEvent, icon, targetId, undefined, scale, s);
      }
    };

    const handlePointerUp = (ue: PointerEvent) => {
      cleanup();
      if (isDraggingTriggered) return;
      const dx = ue.clientX - startX;
      const dy = ue.clientY - startY;
      if (dx * dx + dy * dy <= 100) gameStore.setIsFoodOpen((p) => !p);
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
  if (drag) {
    e.stopPropagation();
    drag(e.nativeEvent, defIcon, undefined, scale, s);
  }
};

export const handleFruitActionDown = (id: string, isZero: boolean, scale: number, s = 1, e: PointerEvent) => {
  const gameStore = useMainGameStore.getState();
  if (isZero) return gameStore.setModal("shop");

  const petStore = usePetStore.getState();
  const iconUrl = getFruitUrlByStoreId(petStore.activeFruitIds[id] ?? 1) || "";

  gameStore.setIsFoodOpen(false);
  startFeedingDrag(e, iconUrl, id, undefined, scale, s);
};

export const createBaseDrag = (ie: React.PointerEvent<HTMLDivElement> | PointerEvent, config: BaseDragConfig, scale = 1, s = 1): void => {
  if (!["prostoi1", "prostoi2", "sad_state"].includes(usePetStore.getState().currentAnim)) {
    return config.onEnd?.();
  }

  const targetElement = ie.target as HTMLElement;
  const nativeEvent = "nativeEvent" in ie ? ie.nativeEvent : ie;

  if (targetElement?.setPointerCapture && nativeEvent.pointerId !== undefined) {
    try {
      targetElement.setPointerCapture(nativeEvent.pointerId);
    } catch (_) {}
  }

  const ratio = window.innerWidth / window.innerHeight;
  const mode = ratio < 1 ? (ratio < 0.42 ? "u" : "v") : "d";
  const conf = {
    u: { c: "w-12 h-12", r: 75 },
    v: { c: "w-14 h-14", r: 110 },
    d: { c: "w-20 h-20", r: 140 }
  }[mode];

  const rect = document.getElementById("phaser-native-html-pet")?.getBoundingClientRect();
  const targetX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const targetY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
  const radiusSq = conf.r * conf.r;

  const ghost = document.createElement("div");
  ghost.className = `fixed top-0 left-0 pointer-events-none ${conf.c} z-50 [will-change:transform]`;

  const updateTransform = (x: number, y: number) => {
    ghost.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale * s})`;
  };
  updateTransform(nativeEvent.clientX, nativeEvent.clientY);

  const img = document.createElement("img");
  img.src = config.url;
  img.className = "w-full h-full object-contain block";
  ghost.appendChild(img);
  document.body.appendChild(ghost);

  (window as any).isGlobalDragActive = true;

  const handleDragMove = (e: PointerEvent) => {
    if (!(window as any).isGlobalDragActive) return;
    updateTransform(e.clientX, e.clientY);
  };

  const handleDragUp = (e: PointerEvent) => {
    if (!(window as any).isGlobalDragActive) return;
    (window as any).isGlobalDragActive = false;

    window.removeEventListener("pointermove", handleDragMove);
    window.removeEventListener("pointerup", handleDragUp);

    if (targetElement?.releasePointerCapture && e.pointerId !== undefined) {
      try {
        targetElement.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

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
