const fruitModules = import.meta.glob("@/assets/fruits/fruits_*.png", { eager: true });

export const FRUIT_URLS: string[] = Object.keys(fruitModules)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
  .map((key) => (fruitModules[key] as { default: string }).default || "");
