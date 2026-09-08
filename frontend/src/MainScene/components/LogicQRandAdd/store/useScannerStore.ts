import { create } from "zustand";
import { Html5Qrcode } from "html5-qrcode";

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
    if (get().isInitializing || get().qrScanner?.isScanning) return;

    set({ cameraError: null, isInitializing: true });

    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      set({ cameraError: "Камера заблокирована: требуется защищенное соединение HTTPS.", isInitializing: false });
      return;
    }

    try {
      const scanner = new Html5Qrcode(elementId);
      set({ qrScanner: scanner });

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 140, height: 140 } },
        (decodedText) => handleSuccess(decodedText),
        () => {}
      );
      set({ isInitializing: false });
    } catch (err) {
      console.warn("Camera init failed:", err);
      set({ 
        cameraError: "Доступ запрещен. Пожалуйста, разрешите использование камеры в настройках.", 
        isInitializing: false,
        qrScanner: null
      });
    }
  },

  safelyStopScanner: async () => {
    const { qrScanner, isInitializing } = get();
    
    if (isInitializing) {
      let checks = 0;
      while (get().isInitializing && checks < 20) {
        await new Promise((res) => setTimeout(res, 100));
        checks++;
      }
    }

    const currentScanner = get().qrScanner;
    if (currentScanner?.isScanning) {
      try {
        await currentScanner.stop();
      } catch (err) {
        console.warn("Scanner stop failed:", err);
      }
    }
    
    if (currentScanner) {
      try {
        currentScanner.clear();
      } catch (_) {}
    }

    set({ qrScanner: null, isInitializing: false });
  }
}));
