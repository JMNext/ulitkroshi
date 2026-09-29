/// <reference types="vite/client" />

// Декларация для MP3 файлов
declare module "*.mp3" {
  const src: string;
  export default src;
}

// Декларация для SVG файлов (как обычный URL)
declare module "*.svg" {
  const src: string;
  export default src;
}

// Декларация для PNG файлов (как обычный URL)
declare module "*.png" {
  const src: string;
  export default src;
}
