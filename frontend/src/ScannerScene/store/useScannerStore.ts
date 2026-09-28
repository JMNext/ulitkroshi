import { Html5Qrcode } from "html5-qrcode";
import { create } from "zustand";

interface ScannerState {
  cameraError: string | null; qrScanner: Html5Qrcode | null; isInitializing: boolean;
  initScanner: (elementId: string, handleSuccess: (text: string) => void) => Promise<void>; safelyStopScanner: () => Promise<void>;
}

export const useScannerStore = create<ScannerState>((set, get) => ({
  cameraError: null, qrScanner: null, isInitializing: false,

  initScanner: async (elementId, handleSuccess) => {
    const s = get();
    if (s.isInitializing || s.qrScanner?.isScanning) return;
    set({ cameraError: null, isInitializing: true });

    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      return set({ cameraError: "https_required", isInitializing: false });
    }

    try {
      const scanner = new Html5Qrcode(elementId); set({ qrScanner: scanner });
      await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 140, height: 140 } }, handleSuccess, () => {});
      set({ isInitializing: false });
    } catch {
      set({ cameraError: "permission_denied", isInitializing: false, qrScanner: null });
    }
  },

  safelyStopScanner: async () => {
    if (get().isInitializing) await new Promise((res) => setTimeout(res, 200));
    const sc = get().qrScanner;
    if (sc?.isScanning) try { await sc.stop(); } catch {}
    try { sc?.clear(); } catch {}
    set({ qrScanner: null, isInitializing: false });
  }
}));
