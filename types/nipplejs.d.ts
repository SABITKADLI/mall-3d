declare module 'nipplejs' {
  export interface JoystickData {
    angle: {
      degree: number;
      radian: number;
    };
    force: number;
    // Add other properties as needed based on nipplejs documentation
  }

  export interface JoystickManager {
    on(event: string, handler: (evt: any, data: JoystickData) => void): void;
    destroy(): void;
  }

  export interface JoystickOptions {
    zone?: HTMLElement | null;
    mode?: 'static' | 'dynamic' | 'semi';
    position?: { left?: string; top?: string; right?: string; bottom?: string };
    color?: string;
    size?: number;
    restOpacity?: number; // <--- Added this
    fadeTime?: number;    // <--- Added this
  }

  const nipplejs: {
    create(options: JoystickOptions): JoystickManager;
  };

  export default nipplejs;
}
