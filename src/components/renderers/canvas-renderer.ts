import type { CanvasRendererConfig, RenderState, TimerRenderer } from '../../types/renderer-types';
import type { ThemeConfig } from '../../types/theme-types';
import { type CachedDrawables, RoughCanvasHelper } from '../../utils/rough-helpers';

export class CanvasRenderer implements TimerRenderer {
  protected container: HTMLElement;
  protected canvas!: HTMLCanvasElement;
  protected ctx!: CanvasRenderingContext2D;
  protected roughHelper!: RoughCanvasHelper;
  protected timeText!: HTMLElement;
  protected initialized = false;
  protected config: CanvasRendererConfig;
  protected renderState: RenderState;
  protected radius: number;
  protected center: { x: number; y: number };
  private cachedDrawables: CachedDrawables | undefined;
  private animationFrameId: number | null = null;

  constructor(config: CanvasRendererConfig) {
    this.config = config;
    this.container = config.container;
    this.renderState = {
      progress: 0,
      timeString: '25:00',
      isAnimating: false,
      isDirty: true,
      lastRenderTime: 0,
    };

    // Calculate dimensions with device pixel ratio
    const dpr = config.devicePixelRatio || window.devicePixelRatio || 1;
    const size = Math.min(config.width, config.height);
    this.radius = size * 0.4 - 30; // Leave extra margin for hand-drawn effects
    this.center = {
      x: (config.width / 2) * dpr,
      y: (config.height / 2) * dpr,
    };

    this.initialize();
  }

  private initialize(): void {
    this.createCanvasStructure();
    this.setupRoughHelper();
    this.initialized = true;
  }

  private createCanvasStructure(): void {
    // Clear container
    this.container.innerHTML = '';

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'timer-renderer canvas-renderer';
    wrapper.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'timer-canvas';

    // Setup high-DPI canvas
    this.setupCanvas();

    // Create time display overlay
    this.timeText = document.createElement('div');
    this.timeText.className = 'time-display canvas-time';
    this.timeText.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: var(--time-font-size, 1.8rem);
      font-weight: 600;
      color: var(--text-color, #1f2937);
      text-align: center;
      user-select: none;
      font-family: var(--font-mono, monospace);
      pointer-events: none;
      text-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
    `;
    this.timeText.textContent = '25:00';

    // Assemble structure
    wrapper.appendChild(this.canvas);
    wrapper.appendChild(this.timeText);
    this.container.appendChild(wrapper);

    // Apply theme styles
    this.setupStyles();
  }

  private setupCanvas(): void {
    const dpr = this.config.devicePixelRatio || window.devicePixelRatio || 1;

    // Set display size
    this.canvas.style.width = `${this.config.width}px`;
    this.canvas.style.height = `${this.config.height}px`;

    // Set actual canvas size with device pixel ratio
    this.canvas.width = this.config.width * dpr;
    this.canvas.height = this.config.height * dpr;

    // Get context and scale for high DPI
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.scale(dpr, dpr);

    // Set canvas properties for smooth rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  protected setupRoughHelper(): void {
    this.roughHelper = new RoughCanvasHelper(this.canvas, this.config);
    // Pre-generate cached drawables
    this.updateCachedDrawables();
  }

  private updateCachedDrawables(): void {
    const dpr = this.config.devicePixelRatio || window.devicePixelRatio || 1;
    this.cachedDrawables = this.roughHelper.getCachedDrawables(
      this.radius * dpr,
      this.center.x,
      this.center.y,
      100
    );
  }

  private setupStyles(): void {
    const theme = this.config.theme;
    const cssVariables = {
      '--primary-color': theme.colors.primary,
      '--secondary-color': theme.colors.secondary,
      '--text-color': theme.colors.text,
      '--time-font-size': '1.8rem',
      '--font-mono': theme.fonts.mono,
    };

    for (const [prop, value] of Object.entries(cssVariables)) {
      this.container.style.setProperty(prop, value);
    }
  }

  private clearCanvas(): void {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.config.width, this.config.height);
  }

  protected drawBackground(): void {
    if (!this.cachedDrawables) return;

    // Draw the cached background elements
    this.roughHelper.drawCached(this.cachedDrawables, {
      showTicks: true,
      showCenter: false, // We'll draw center dot separately if needed
      tickOpacity: 0.6,
    });
  }

  protected drawProgressArc(progress: number): void {
    if (!this.roughHelper) return;

    const startAngle = -Math.PI / 2; // Start from top (12 o'clock)
    const endAngle = startAngle + progress * 2 * Math.PI;

    // Only draw arc if there's progress
    if (progress > 0) {
      const dpr = this.config.devicePixelRatio || window.devicePixelRatio || 1;
      this.roughHelper.drawProgressArc(
        this.center.x / dpr,
        this.center.y / dpr,
        this.radius,
        startAngle,
        endAngle,
        this.config.theme.colors.primary
      );
    }

    // Draw center dot
    if (this.cachedDrawables?.centerDot) {
      this.roughHelper.getRoughCanvas().draw(this.cachedDrawables.centerDot);
    }
  }

  private drawHandDrawnElements(): void {
    // Add some hand-drawn artistic elements based on theme
    const effects = this.config.theme.effects;
    if (!effects || !this.ctx) return;

    // Add subtle texture or grain effect
    if (effects.roughness && effects.roughness > 1.5) {
      this.addTextureEffect();
    }
  }

  private addTextureEffect(): void {
    if (!this.ctx) return;

    // Create a subtle noise/grain texture
    const imageData = this.ctx.getImageData(0, 0, this.config.width, this.config.height);
    const data = imageData.data;

    // Add very subtle random noise
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];

      if (
        alpha !== undefined &&
        alpha > 0 &&
        red !== undefined &&
        green !== undefined &&
        blue !== undefined
      ) {
        // Only modify non-transparent pixels
        const noise = (Math.random() - 0.5) * 4; // Very subtle noise
        data[i] = Math.min(255, Math.max(0, red + noise)); // Red
        data[i + 1] = Math.min(255, Math.max(0, green + noise)); // Green
        data[i + 2] = Math.min(255, Math.max(0, blue + noise)); // Blue
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private renderFrame(): void {
    if (!this.initialized || !this.renderState.isDirty) return;

    // Clear canvas
    this.clearCanvas();

    // Draw background (circle + ticks)
    this.drawBackground();

    // Draw progress arc
    this.drawProgressArc(this.renderState.progress);

    // Draw any additional hand-drawn effects
    this.drawHandDrawnElements();

    this.renderState.isDirty = false;
    this.renderState.lastRenderTime = performance.now();
  }

  render(progress: number, theme: ThemeConfig): void {
    if (!this.initialized) return;

    this.renderState.progress = progress;
    this.renderState.isDirty = true;

    // Update theme if changed
    if (theme.name !== this.config.theme.name) {
      this.config.theme = theme;
      this.roughHelper.updateConfig(this.config);
      this.updateCachedDrawables();
      this.setupStyles();
    }

    // Render immediately or schedule for next frame
    if (this.renderState.isAnimating) {
      // Cancel any existing animation frame
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
      }

      // Schedule new frame
      this.animationFrameId = requestAnimationFrame(() => {
        this.renderFrame();
      });
    } else {
      this.renderFrame();
    }
  }

  resize(width: number, height: number): void {
    const dpr = this.config.devicePixelRatio || window.devicePixelRatio || 1;
    const size = Math.min(width, height);

    this.config.width = width;
    this.config.height = height;
    this.radius = size * 0.4 - 30;
    this.center = {
      x: (width / 2) * dpr,
      y: (height / 2) * dpr,
    };

    // Update canvas dimensions
    this.setupCanvas();

    // Update rough helper and regenerate cached drawables
    this.roughHelper = new RoughCanvasHelper(this.canvas, this.config);
    this.updateCachedDrawables();

    // Force redraw
    this.renderState.isDirty = true;
    this.renderFrame();
  }

  updateTime(timeString: string): void {
    this.renderState.timeString = timeString;
    if (this.timeText) {
      this.timeText.textContent = timeString;
    }
  }

  setAnimationState(isRunning: boolean): void {
    this.renderState.isAnimating = isRunning;

    if (!isRunning && this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  createTicks(count: number = 100): void {
    // Ticks are created as part of cached drawables
    // Regenerate cache with new tick count
    if (this.roughHelper) {
      const dpr = this.config.devicePixelRatio || window.devicePixelRatio || 1;
      this.cachedDrawables = this.roughHelper.getCachedDrawables(
        this.radius * dpr,
        this.center.x,
        this.center.y,
        count
      );
      this.renderState.isDirty = true;
    }
  }

  getType(): 'dom' | 'svg' | 'canvas' {
    return 'canvas';
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  destroy(): void {
    // Cancel any pending animation frames
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Clear canvas
    if (this.ctx) {
      this.clearCanvas();
    }

    // Clean up container
    if (this.container) {
      this.container.innerHTML = '';
    }

    // Clear cache
    if (this.roughHelper) {
      this.roughHelper.clearCache();
    }

    // Clear references
    this.canvas = null!;
    this.ctx = null!;
    this.roughHelper = null!;
    this.timeText = null!;
    this.cachedDrawables = undefined;
    this.initialized = false;
  }
}
