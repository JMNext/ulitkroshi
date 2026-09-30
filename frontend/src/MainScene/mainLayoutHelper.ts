import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

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
  const layoutS = screenMode === "fold" ? Math.max(0.65, viewW / 750) : screenMode === "mobile" ? 1.22 : 1;
  const finalScale = screenMode === "mobile" && safeH / safeW > 1.65 ? scale * 1.35 : scale;

  let exHMult = 1.0, bScaleV = 1, bTopOffset = 110, sScale = 1, sOff = 340, sTop = 450, petTop = 460, petScale = 1.0, expScale = 1.0;
  let hScale = Math.min(1.2, Math.max(0.75, viewW / 1400)), hWidth = (viewW - 120) / hScale;

  let alertScale = 1.0;
  let alertTop = -360;

  if (isVert) {
    exHMult = 0.45;
    hScale = Math.min(1.1, viewW / 480);
    // Кнопки управления на мобильном (icon_care #1521:945) занимают 960px
    bScaleV = Math.min(1.0, (viewW - 20) / 960);
    bTopOffset = (ratio < 0.42 ? 245 : ratio < 0.46 ? 235 : 225) * bScaleV;
    expScale = bScaleV;
    sOff = Math.min(viewW / 2 - 60 * sScale - 24, ratio < 0.42 ? 148 : ratio < 0.46 ? 160 : 180);
    sTop = ratio < 0.42 ? 555 : ratio < 0.46 ? 495 : 475;

    if (ratio >= 0.6) {
      hWidth = viewW - 14 / hScale;
      sScale = 0.9;
      sOff = Math.min(viewW / 2 - 78, 235);
      sTop = 480; petTop = 450; petScale = 0.95;
      alertScale = 1.2;
      alertTop = -370;
    } else {
      hWidth = viewW / hScale;
      sScale = ratio < 0.42 ? 0.60 : ratio < 0.46 ? 0.68 : 0.70;
      petScale = viewW < 340 ? 0.90 : 0.95;
      petTop = viewW < 380 ? (viewW < 325 ? 528 : 508) : 488;
      alertScale = ratio < 0.42 ? 1.25 : 1.2;
      alertTop = ratio < 0.42 ? -330 : -350;
    }
  } else {
    const isTablet = screenMode === "tablet";
    const isSafariPro = isTouch && (width === 1440 && height === 960 || typeof navigator !== "undefined" && /Apple/.test(navigator.vendor) && width === 1440);
    const isIPadProHoriz = isTouch && !isSafariPro && (winW >= 1366 || (isClient && window.innerHeight >= 1366));
    const isAnyLandscapeTablet = isTablet || isSafariPro || isIPadProHoriz || (isTouch && ratio < 1.65);

    bScaleV = Math.min(1.15, Math.max(0.7, (viewW - 60) / 1080));
    bTopOffset = 110 * bScaleV;
    sOff = Math.min(410, Math.max(340, viewW * 0.23 + (viewW - 1440) * 0.1));
    expScale = isDesktopDevice && !isSafariPro ? 1.0 : Math.min(1.15, Math.max(0.9, hScale));

    if (isDesktopDevice && !isSafariPro) {
      sScale = 1; petTop = 460; petScale = 1.0;
      alertScale = 1.0;
    } else if (isAnyLandscapeTablet) {
      sScale = 1.0; sOff = 410; hScale = 1.25; hWidth = (viewW - 120) / hScale;
      petScale = isSafariPro ? 0.95 : 1.0;
      petTop = isSafariPro ? 512 : isIPadProHoriz ? 524 : ratio >= 1.5 && ratio < 1.75 && winW <= 1280 ? 480 : 518;
      alertScale = 1.0;
    } else {
      hScale = Math.min(1.2, Math.max(0.75, viewW / 1400));
      hWidth = (viewW - 120) / hScale;
      sScale = screenMode === "fold" ? 0.65 : screenMode === "mobile" ? 0.75 : 1;
      exHMult = 1.0;
      petScale = ratio < 1.6 ? 0.95 : 1.0;
      petTop = ratio >= 1.5 && ratio < 1.75 && winW <= 1280 ? 480 : ratio < 1.6 ? 500 : 460;
      alertScale = 1.0;
    }
  }

  // Позиционирование ExperienceBar:
  // На десктопе — СТРОГО на одном горизонтальном уровне с плашкой монет (top: 90px / центр строки хедера),
  // ширина 540px (расстояние между кнопками управления от края до края).
  // На мобильном — под компактным хедером (top: ~165-175px), ширина 960px (от края до края кнопок),
  // масштаб равен bScaleV для синхронного покрытия ширины кнопок.
  const expTop = isVert
    ? (ratio < 0.42 ? 175 : ratio < 0.46 ? 170 : 165) - exH * exHMult
    : 90 - exH * exHMult;


  // Позиционирование индикаторов (Имя + Здоровье):
  // ФИКСИРОВАННОЕ место в верхней части экрана, НЕ зависящее от роста питомца!
  // На мобильном — под широким ExperienceBar
  // На десктопе — под Header/ExperienceBar
  const indTop = isVert
    ? (ratio < 0.42 ? 285 : ratio < 0.46 ? 280 : 275) - exH * exHMult
    : 215 - exH * exHMult;
  const indScale = isVert
    ? Math.min(1.0, Math.max(0.78, (viewW - 40) / 420))
    : 1.0;

  uiContainer.style.setProperty("--game-scale", `${scale}`);
  uiContainer.style.setProperty("--layout-s", `${layoutS}`);

  const canvasEl = uiContainer.querySelector(".ui-canvas-target") as HTMLDivElement;
  if (!canvasEl) return;

  canvasEl.style.transform = `translate(-50%, -50%) scale(${finalScale})`;

  const stylesToApply = {
    ".ui-header-target": { top: `${90 - exH * exHMult}px`, width: `${hWidth}px`, transform: `translate(-50%, -50%) scale(${hScale})` },
    ".ui-exp-target": { left: "50%", top: `${expTop}px`, transform: `translate(-50%, -50%) scale(${expScale})` },
    ".ui-indicators-target": { left: "50%", top: `${indTop}px`, transform: `translate(-50%, -50%) scale(${indScale})` },
    ".ui-left-target": { left: `calc(50% - ${sOff}px)`, top: `${sTop}px`, transform: `translate(-50%, -50%) scale(${sScale})` },
    ".ui-right-target": { left: `calc(50% + ${sOff}px)`, top: `${sTop}px`, transform: `translate(-50%, -50%) scale(${sScale})` },
    ".ui-pet-target": { left: "50%", top: `${petTop}px`, transform: `translate(-50%, -50%) scale(${petScale})` },
    ".ui-bottom-target": { left: "50%", top: `${1080 + exH - bTopOffset}px`, transform: `translate(-50%, -50%) scale(${bScaleV})` },
    ".ui-alert-target": { left: "50%", top: `${indTop}px`, transform: `translate(-50%, -50%) scale(${indScale})` }
  };

  const applyStyles = () => {
    let allApplied = true;
    for (const [cls, style] of Object.entries(stylesToApply)) {
      const el = canvasEl.querySelector(cls) as HTMLDivElement;
      if (el) {
        Object.assign(el.style, style);
      } else {
        allApplied = false;
      }
    }
    if (!allApplied && uiContainer.isConnected) {
      requestAnimationFrame(applyStyles);
    }
  };

  applyStyles();
}
