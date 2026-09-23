export function executeMainResize(width: number, height: number, uiContainer: HTMLDivElement | null) {
  if (!uiContainer) return;

  const isVert = height > width;
  const ratio = width / height;
  const safeH = height || 1080, safeW = width || 1920;

  const isClient = typeof window !== "undefined";
  const winW = isClient ? window.innerWidth : 1920;
  const isTouch = typeof navigator !== "undefined" && (navigator.maxTouchPoints > 0 || "ontouchend" in document);
  const isDesktopDevice = isClient && window.matchMedia("(pointer: fine)").matches;

  const scale = isVert ? safeH / 1080 : Math.min(safeW / 1920, safeH / 1080);
  const viewW = safeW / scale;
  const exH = (safeH / scale - 1080) / 2;

  const screenMode = isVert ? (viewW < 750 ? "fold" : "mobile") : ratio < 1.6 ? "tablet" : "desktop";
  const layoutS = screenMode === "fold" ? Math.max(0.65, viewW / 750) : screenMode === "tablet" ? 0.85 : screenMode === "mobile" ? 1.15 : 1;
  const finalScale = screenMode === "mobile" && safeH / safeW > 1.65 ? scale * 1.35 : scale;

  let exHMult = 1.0, bScaleV = 1, bTopOffset = 110, sScale = 1, sOff = 340, sTop = 450, petTop = 460, petScale = 1.0;
  let hScale = Math.min(1.2, Math.max(0.75, viewW / 1400)), hWidth = (viewW - 120) / hScale;

  if (isVert) {
    exHMult = 0.45;
    hScale = Math.min(1.1, viewW / 480);
    bScaleV = Math.min(ratio < 0.42 ? 1.1 : ratio < 0.46 ? 1.15 : 1.3, (viewW - 40) / 520);
    bTopOffset = (ratio < 0.42 ? 112 : 110) * bScaleV;
    sOff = Math.min(viewW / 2 - 60 * sScale - 24, ratio < 0.42 ? 158 : ratio < 0.46 ? 170 : 195);
    sTop = ratio < 0.42 ? 555 : ratio < 0.46 ? 495 : 475;

    if (ratio >= 0.6) {
      hWidth = viewW - 14 / hScale;
      sScale = 0.9;
      sOff = Math.min(viewW / 2 - 78, 235);
      sTop = 480; petTop = 450; petScale = 0.88;
    } else {
      hWidth = viewW / hScale;
      sScale = ratio < 0.42 ? 0.64 : ratio < 0.46 ? 0.74 : 0.76;
      petScale = 0.82;
      petTop = viewW < 380 ? (viewW < 325 ? 548 : 528) : 508;
    }
  } else {
    const isTablet = screenMode === "tablet";
    const isSafariPro = isTouch && (width === 1440 && height === 960 || typeof navigator !== "undefined" && /Apple/.test(navigator.vendor) && width === 1440);
    const isIPadProHoriz = isTouch && !isSafariPro && (winW >= 1366 || (isClient && window.innerHeight >= 1366));
    const isAnyLandscapeTablet = isTablet || isSafariPro || isIPadProHoriz || (isTouch && ratio < 1.65);

    bScaleV = Math.min(1.15, Math.max(0.7, (viewW - 60) / 1080));
    bTopOffset = 110 * bScaleV;
    sOff = Math.min(410, Math.max(340, viewW * 0.23 + (viewW - 1440) * 0.1));

    if (isDesktopDevice && !isSafariPro) {
      sScale = 1; petTop = 460; petScale = 1.0;
    } else if (isAnyLandscapeTablet) {
      sScale = 1.0; sOff = 410; hScale = 1.25; hWidth = (viewW - 120) / hScale;
      petScale = isSafariPro ? 0.95 : 1.0;
      petTop = isSafariPro ? 512 : isIPadProHoriz ? 524 : ratio >= 1.5 && ratio < 1.75 && winW <= 1280 ? 480 : 518;
    } else {
      hScale = Math.min(1.2, Math.max(0.75, viewW / 1400));
      hWidth = (viewW - 120) / hScale;
      sScale = screenMode === "fold" ? 0.65 : screenMode === "mobile" ? 0.75 : 1;
      exHMult = 1.0;
      petScale = ratio < 1.6 ? 0.95 : 1.0;
      petTop = ratio >= 1.5 && ratio < 1.75 && winW <= 1280 ? 480 : ratio < 1.6 ? 500 : 460;
    }
  }

  uiContainer.style.setProperty("--game-scale", `${scale}`);
  uiContainer.style.setProperty("--layout-s", `${layoutS}`);

  const canvasEl = uiContainer.querySelector(".ui-canvas-target") as HTMLDivElement;
  if (!canvasEl) return;

  canvasEl.style.transform = `translate(-50%, -50%) scale(${finalScale})`;

  const apply = (cls: string, style: any) => {
    const el = canvasEl.querySelector(cls) as HTMLDivElement;
    if (el) Object.assign(el.style, style);
  };

  apply(".ui-header-target", { top: `${90 - exH * exHMult}px`, width: `${hWidth}px`, transform: `translate(-50%, -50%) scale(${hScale})` });
  apply(".ui-left-target", { left: `calc(50% - ${sOff}px)`, top: `${sTop}px`, transform: `translate(-50%, -50%) scale(${sScale})` });
  apply(".ui-right-target", { left: `calc(50% + ${sOff}px)`, top: `${sTop}px`, transform: `translate(-50%, -50%) scale(${sScale})` });
  apply(".ui-pet-target", { left: "50%", top: `${petTop}px`, transform: `translate(-50%, -50%) scale(${petScale})` });
  apply(".ui-bottom-target", { left: "50%", top: `${1080 + exH - bTopOffset}px`, transform: `translate(-50%, -50%) scale(${bScaleV})` });
}
