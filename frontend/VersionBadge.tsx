import React from "react";

/**
 * Компонент отображения текущей версии приложения.
 * Размещается в нижней части экрана посередине, небольшим, но читаемым шрифтом.
 * Не перехватывает клики (pointer-events: none) и адаптирован под Safe Area мобильных устройств.
 */
export const VersionBadge: React.FC = () => {
  return (
    <div
      id="app-version-badge"
      aria-label={`Версия приложения: ${__APP_VERSION__}`}
      style={{
        position: "fixed",
        bottom: "calc(4px + env(safe-area-inset-bottom, 0px))",
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "11px",
        fontWeight: 600,
        fontFamily: "'Arteks Regular', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "rgba(255, 255, 255, 0.7)",
        textShadow: "0 1px 2px rgba(0, 0, 0, 0.85), 0 0 1px rgba(0, 0, 0, 0.9)",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 9999,
        letterSpacing: "0.5px",
        whiteSpace: "nowrap",
      }}
    >
      v{__APP_VERSION__}
    </div>
  );
};
