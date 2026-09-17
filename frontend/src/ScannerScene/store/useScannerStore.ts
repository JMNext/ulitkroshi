import { Html5Qrcode } from "html5-qrcode";
import { create } from "zustand";

interface ScannerState {
  cameraError: string | null;
  qrScanner: Html5Qrcode | null;
  isInitializing: boolean;
  initScanner: (elementId: string, handleSuccess: (text: string) => void) => Promise<void>;
  safelyStopScanner: () => Promise<void>;
}

export const useScannerStore = create<ScannerState>((set, get) => ({
  cameraError: null,
  qrScanner: null,
  isInitializing: false,

  initScanner: async (elementId, handleSuccess) => {
    const state = get();
    if (state.isInitializing || state.qrScanner?.isScanning) return;

    set({ cameraError: null, isInitializing: true });

    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      set({ cameraError: "https_required", isInitializing: false });
      return;
    }

    try {
      const scanner = new Html5Qrcode(elementId);
      set({ qrScanner: scanner });

      await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 140, height: 140 } }, handleSuccess, () => {});
      set({ isInitializing: false });
    } catch (err) {
      console.warn("Camera init failed:", err);
      set({
        cameraError: "permission_denied",
        isInitializing: false,
        qrScanner: null
      });
    }
  },

  safelyStopScanner: async () => {
    if (get().isInitializing) {
      await new Promise((res) => setTimeout(res, 200));
    }

    const currentScanner = get().qrScanner;
    if (currentScanner?.isScanning) {
      try {
        await currentScanner.stop();
      } catch (err) {
        console.warn("Scanner stop failed:", err);
      }
    }

    try {
      currentScanner?.clear();
    } catch (_) {}
    set({ qrScanner: null, isInitializing: false });
  }
}));
