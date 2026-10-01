/**
 * Утилита определения подлинной платформы Apple / WebKit (iOS, iPadOS, macOS Safari).
 * На реальных устройствах Apple альфа-канал прозрачности видео поддерживается ИСКЛЮЧИТЕЛЬНО в HEVC (.mov / .mp4 hvc1).
 * Воспроизведение WebM в WebKit приводит к отбрасыванию альфа-канала и появлению черного фона.
 *
 * Важно: браузер Google Chrome / Chromium на ПК (Windows, Linux, Mac) при включении режима эмуляции
 * мобильных устройств (например, iPhone 16) подменяет navigator.userAgent, но физически работает
 * на движке Chromium (Blink). Движок Chromium на Windows не поддерживает альфа-канал в HEVC .mov,
 * из-за чего вокруг персонажа появляется черный прямоугольник. Chromium требует строго WebM (VP9).
 */
export const isApplePlatform = (): boolean => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  // Проверка на движок Chromium (включая Chrome DevTools в режиме эмуляции iPhone на Windows/Linux):
  const isChromium =
    typeof (window as any).chrome !== "undefined" ||
    Boolean(navigator.vendor && /Google/i.test(navigator.vendor));

  if (isChromium) {
    return false;
  }

  const ua = navigator.userAgent || "";
  const platform = (navigator as any).userAgentData?.platform || navigator.platform || "";
  const vendor = navigator.vendor || "";

  // Настоящий WebKit Apple всегда имеет вендор Apple Computer, Inc.
  const isAppleVendor = /Apple/i.test(vendor);

  // iOS (iPhone, iPad, iPod) включая десктопный режим iPadOS (MacIntel + multi-touch)
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === "MacIntel" && navigator.maxTouchPoints > 1);

  // Safari (iOS или macOS)
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);

  // Любой WebKit на платформе Apple (WKWebView в Telegram WebApp, VK, Instagram и др.)
  const isApple =
    isAppleVendor &&
    (isIOS ||
      isSafari ||
      ((/Macintosh|Mac OS X/.test(ua) || /iPhone|iPad/i.test(platform)) &&
        !/Android/i.test(ua)));

  return isApple;
};
