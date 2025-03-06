// glide.d.ts
declare module '@glidejs/glide' {
    class Glide {
      constructor(selector: string, options: any);
      mount(): void;
    }
  
    export default Glide;
  }
  
  // Declarar Glide como una variable global
  declare const Glide: typeof import('@glidejs/glide').default;