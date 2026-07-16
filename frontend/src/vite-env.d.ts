/// <reference types="vite/client" />

/* Статические графические ассеты */
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

/* Медиафайлы и аудио */
declare module '*.webm' {
  const content: string;
  export default content;
}

declare module '*.mp3' {
  const content: string;
  export default content;
}

/* Изолированные CSS модули */
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
