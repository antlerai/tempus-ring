/**
 * Abstract renderer interface for unified timer rendering, supporting DOM, SVG,
 * and Canvas methods.
 */
export interface TimerRenderer {
  /**
   * Render timer progress.
   * @param progress - Progress value (0-1).
   * @param theme - Theme configuration.
   */
  render(progress: number, theme: ThemeConfig): void;

  /**
   * Resize the renderer.
   * @param width - Width in pixels.
   * @param height - Height in pixels.
   */
  resize(width: number, height: number): void;

  /**
   * Clean up resources and event listeners.
   */
  destroy(): void;

  /**
   * Get renderer type.
   * @returns The renderer type.
   */
  getType(): RendererType;

  /**
   * Update time display.
   * @param timeString - Formatted time string.
   */
  updateTime(timeString: string): void;

  /**
   * Set animation state.
   * @param isRunning - Whether the timer is running.
   */
  setAnimationState(isRunning: boolean): void;

  /**
   * Create tick marks.
   * @param count - Number of ticks (default: 100).
   */
  createTicks(count: number): void;

  /**
   * Check if renderer is initialized.
   */
  isInitialized(): boolean;
}

/**
 * Renderer types.
 */
export type RendererType = 'dom' | 'svg' | 'canvas';

/**
 * Animation style types.
 */
export type AnimationStyle = 'smooth' | 'rough' | 'minimal';

/**
 * Theme configuration interface.
 */
export interface ThemeConfig {
  /** Theme name. */
  name: string;

  /** Color configuration. */
  colors: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
    text: string;
    surface: string;
    border?: string;
    shadow?: string;
  };

  /** Size configuration. */
  sizes: {
    clockSize: number;
    ringWidth: number;
    tickLength: number;
    majorTickLength: number;
    handWidth: number;
    fontSize: number;
    centerDotSize: number;
  };

  /** Effects configuration. */
  effects: {
    /** Roughness for hand-drawn effects (Canvas/SVG). */
    roughness?: number;
    /** Whether to show shadow. */
    shadow?: boolean;
    /** Whether to show glow effect. */
    glow?: boolean;
    /** Animation style. */
    animation?: AnimationStyle;
  };
}
