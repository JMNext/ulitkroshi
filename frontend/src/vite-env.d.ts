/// <reference types="vite/client" />

declare module '*.png?url' {
  const content: string;
  export default content;
}

declare module '*.webm?url' {
  const content: string;
  export default content;
}

declare module '*.mp3?url' {
  const content: string;
  export default content;
}

declare module '*.svg?url' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}
