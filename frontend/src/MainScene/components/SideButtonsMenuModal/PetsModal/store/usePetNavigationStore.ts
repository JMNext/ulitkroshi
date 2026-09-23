import { create } from "zustand";

interface PetNavigationState {
  currentIndex: number; touchStartX: number; lastScrollTime: number; isDragging: boolean; hasMoved: boolean;
  init: (activeIndex: number) => void; handlePrev: () => void; handleNext: () => void;
  onDragStart: (x: number) => void; onDragMove: (x: number) => void; onDragEnd: (onCardSelect: () => void) => void;
  handleWheel: (e: any) => void;
}

export const usePetNavigationStore = create<PetNavigationState>((set, get) => {
  const checkThrottle = () => {
    const now = Date.now();
    if (now - get().lastScrollTime <= 220) return true;
    set({ lastScrollTime: now });
    return false;
  };

  return {
    currentIndex: 0, touchStartX: 0, lastScrollTime: 0, isDragging: false, hasMoved: false,

    init: (idx) => set({ currentIndex: idx, isDragging: false, hasMoved: false }),

    handlePrev: () => !checkThrottle() && set((s) => ({ currentIndex: (s.currentIndex + 19) % 20 })),
    handleNext: () => !checkThrottle() && set((s) => ({ currentIndex: (s.currentIndex + 1) % 20 })),

    onDragStart: (x) => set({ touchStartX: x, isDragging: true, hasMoved: false }),

    onDragMove: (x) => {
      const { isDragging, touchStartX, handleNext, handlePrev } = get();
      if (!isDragging) return;
      const diff = touchStartX - x;
      if (Math.abs(diff) > 5) set({ hasMoved: true });
      if (Math.abs(diff) > 50) {
        diff > 0 ? handleNext() : handlePrev();
        set({ isDragging: false, hasMoved: false });
      }
    },

    onDragEnd: (onSelect) => {
      const { isDragging, hasMoved } = get();
      if (isDragging) {
        if (!hasMoved) onSelect();
        set({ isDragging: false, hasMoved: false });
      }
    },

    handleWheel: (e) => {
      const delta = e.deltaX || e.deltaY;
      if (Math.abs(delta) > 10) delta > 0 ? get().handleNext() : get().handlePrev();
    }
  };
});
