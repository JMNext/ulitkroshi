/**
 * Утилита определения платформы Apple / Safari / WebKit.
 * На устройствах Apple (iOS, iPadOS, Safari, WKWebView в Telegram/VK)
 * альфа-канал прозрачности видео поддерживается ИСКЛЮЧИТЕЛЬНО в HEVC (.mov / .mp4 hvc1).
 * Воспроизведение WebM в WebKit приводит к отбрасыванию альфа-канала и появлению черного фона.
 */
export const isApplePlatform = (): boolean => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const platform = (navigator as any).userAgentData?.platform || navigator.platform || "";

  // iOS (iPhone, iPad, iPod) включая десктопный режим iPadOS (MacIntel + multi-touch)
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === "MacIntel" && navigator.maxTouchPoints > 1);

  // Safari (iOS или macOS)
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);

  // Любой WebKit на платформе Apple (WKWebView в Telegram WebApp, VK, Instagram и др.)
  const isApple =
    isIOS ||
    isSafari ||
    ((/Macintosh|Mac OS X/.test(ua) || /iPhone|iPad/i.test(platform)) &&
      !/Android/i.test(ua));

  return isApple;
};
