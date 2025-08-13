import type { RendererType, ThemeConfig } from './theme-types';

export interface TimerRenderer {
  render(progress: number, theme: ThemeConfig): void;
  resize(width: number, height: number): void;
  destroy(): void;
  getType(): RendererType;
  updateTime(timeString: string): void;
  setAnimationState(isRunning: boolean): void;
  createTicks(count: number): void;
  isInitialized(): boolean;
}

export interface RendererConfig {
  container: HTMLElement;
  width: number;
  height: number;
  theme: ThemeConfig;
  displayMode: DisplayMode;
}

export type DisplayMode = 'percentage' | 'clock';

export interface AnimationConfig {
  duration: number;
  easing: string;
  enabled: boolean;
  fps?: number;
}

export interface TickConfig {
  count: number;
  majorTicks: number[];
  minorTicks: number[];
  showLabels: boolean;
  labelFormat: 'number' | 'time';
}

export interface RenderState {
  progress: number;
  timeString: string;
  isAnimating: boolean;
  isDirty: boolean;
  lastRenderTime: number;
}

export interface CanvasRendererConfig extends RendererConfig {
  devicePixelRatio?: number;
  roughOptions?: {
    roughness: number;
    strokeWidth: number;
    fillStyle: string;
    hachureGap: number;
    hachureAngle: number;
  };
}

export interface SVGRendererConfig extends RendererConfig {
  preserveAspectRatio?: string;
  viewBox?: string;
}

export interface DOMRendererConfig extends RendererConfig {
  useCSSTansitions?: boolean;
  transitionDuration?: string;
}
