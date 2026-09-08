export interface LayoutContext {
  screenMode: "fold" | "mobile" | "tablet" | "desktop";
  viewW: number; exW: number; exH: number; scale: number; s: number; isVert: boolean;
  headerStyles: React.CSSProperties;
  sideMenuStyles: { left: React.CSSProperties; right: React.CSSProperties };
  foodPanelStyles: React.CSSProperties;
  bottomMenuStyles: React.CSSProperties;
  petStyles: React.CSSProperties;
}

export const calculateLayout = (wW: number, wH: number, isVert: boolean): { layoutContext: LayoutContext; finalScale: number } => {
  const ratio = wW / wH;
  const scale = isVert ? wH / 1080 : Math.min(wW / 1920, wH / 1080);
  const viewW = wW / scale;
  const exH = (wH / scale - 1080) / 2;
  
  const screenMode = isVert ? (viewW < 750 ? "fold" : "mobile") : (ratio < 1.6 ? "tablet" : "desktop");

  const isDesktop = screenMode === "desktop";
  const isTablet = screenMode === "tablet";
  const isFold = screenMode === "fold";
  const isMobile = screenMode === "mobile";

  const isRatioLess42 = ratio < 0.42;
  const isRatioLess46 = ratio < 0.46;
  const isRatioGte6 = ratio >= 0.6;

  const exHMult = isDesktop ? 1 : isTablet ? 0.7 : 0.45;
  const hScale = isDesktop || isTablet ? Math.min(1.2, Math.max(0.75, viewW / 1400)) : Math.min(1.1, viewW / 480);
  
  const bScaleV = !isVert ? Math.min(1.15, Math.max(0.7, (viewW - 60) / 1080)) : Math.min(isRatioLess42 ? 1.1 : isRatioLess46 ? 1.15 : 1.3, (viewW - 40) / 520);
  const bTopOffset = (!isVert ? 110 : (isRatioLess42 ? 112 : isRatioLess46 ? 120 : 110)) * bScaleV;

  const pScale = isVert ? (isRatioGte6 ? Math.max(0.88, viewW / 750) : isRatioLess42 ? 0.65 : Math.max(0.88, viewW / 750) * 0.9) : (viewW < 720 ? Math.max(0.88, viewW / 750) : 1);
  const pTop = isVert ? (isRatioGte6 ? 440 : isRatioLess42 ? 530 : 490) : 460;

  let sScale = 1, sOff = 340, sTop = 450;
  if (isVert) {
    sScale = isRatioGte6 ? 0.9 : isRatioLess42 ? 0.64 : (isRatioLess46 ? 0.74 : 0.76);
    sOff = isRatioGte6 ? Math.min(viewW / 2 - 80, 275) : isRatioLess42 ? 158 : Math.max(viewW / 2 - (isRatioLess46 ? 78 : 86), isRatioLess46 ? 170 : 195);
    sTop = isRatioGte6 ? 480 : isRatioLess42 ? 555 : (isRatioLess46 ? 495 : 475);
  } else {
    sScale = isTablet ? 0.9 : isFold ? 0.65 : isMobile ? 0.75 : 1;
    sOff = isTablet ? 295 : isFold ? 158 : isMobile ? 195 : 240 + (viewW - 1920) / 2;
  }

  const foodBottom = isVert ? (165 - exH * 0.3) : (215 - exH * 0.2);
  const foodScale = isVert ? (ratio < 0.45 ? 0.85 : 0.9) : (isTablet ? 0.9 : 1);

  return {
    finalScale: (isMobile && wH / wW > 1.65) ? scale * 1.35 : scale,
    layoutContext: {
      screenMode, viewW, scale, isVert, exH, exW: (viewW - 1920) / 2, s: isFold ? Math.max(0.65, viewW / 750) : (isTablet ? 0.85 : isMobile ? 1.15 : 1),
      headerStyles: { top: `${90 - exH * exHMult}px`, transform: `translate(-50%, -50%) scale(${hScale})`, width: `${viewW * (scale / (scale * hScale || 1))}px` },
      sideMenuStyles: {
        left: { left: `calc(50% - ${sOff}px)`, top: `${sTop}px`, transform: `translate(-50%, -50%) scale(${sScale})` },
        right: { left: `calc(50% + ${sOff}px)`, top: `${sTop}px`, transform: `translate(-50%, -50%) scale(${sScale})` }
      },
      foodPanelStyles: { 
        bottom: `${foodBottom}px`, 
        transform: `translate(-50%, 0) scale(${foodScale})` 
      },
      bottomMenuStyles: { left: "50%", top: `${1080 + exH - bTopOffset}px`, transform: `translate(-50%, -50%) scale(${bScaleV})` },
      petStyles: { top: `${pTop}px`, transform: `translate(-50%, -50%) scale(${pScale})` }
    }
  };
};
