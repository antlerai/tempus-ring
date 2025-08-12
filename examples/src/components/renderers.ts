import type { RendererType, ThemeConfig, TimerRenderer } from '../types/renderer-interface';

/**
 * DOM renderer implementation
 */
export class DOMRenderer implements TimerRenderer {
  private container: HTMLElement;
  private initialized: boolean = false;
  private currentTheme?: ThemeConfig;

  constructor(container: HTMLElement) {
    if (!container) {
      throw new Error('Container element is required for DOM renderer');
    }
    this.container = container;
    this.initialized = true;
  }

  /**
   * Render timer progress using CSS custom properties
   */
  render(progress: number, theme: ThemeConfig): void {
    if (!this.initialized) {
      throw new Error('Renderer not initialized');
    }

    // Validate progress value range
    if (progress < 0 || progress > 1) {
      throw new Error('Progress must be between 0 and 1');
    }

    this.currentTheme = theme;

    // Control styles via CSS variables
    this.container.style.setProperty('--progress', `${progress * 360}deg`);
    this.container.style.setProperty('--primary-color', theme.colors.primary);
    this.container.style.setProperty('--secondary-color', theme.colors.secondary);
    this.container.style.setProperty('--accent-color', theme.colors.accent);
  }

  /**
   * Resize the renderer container
   */
  resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      throw new Error('Width and height must be positive numbers');
    }

    this.container.style.width = `${width}px`;
    this.container.style.height = `${height}px`;
    this.container.style.setProperty('--timer-size', `${Math.min(width, height)}px`);
  }

  /**
   * Clean up DOM elements and event listeners
   */
  destroy(): void {
    this.container.innerHTML = '';
    this.container.removeAttribute('style');
    this.initialized = false;
    this.currentTheme = undefined;
  }

  /**
   * Get renderer type
   */
  getType(): RendererType {
    return 'dom';
  }

  /**
   * Update time display text
   */
  updateTime(timeString: string): void {
    const timeElement = this.container.querySelector('.timer-text') as HTMLElement;
    if (timeElement) {
      timeElement.textContent = timeString;

      // Apply theme font styles
      if (this.currentTheme) {
        timeElement.style.color = this.currentTheme.colors.text;
        timeElement.style.fontSize = `${this.currentTheme.sizes.fontSize}px`;
      }
    }
  }

  /**
   * Set animation state with CSS classes
   */
  setAnimationState(isRunning: boolean): void {
    this.container.classList.toggle('running', isRunning);
    this.container.classList.toggle('paused', !isRunning);
  }

  /**
   * Create tick marks (handled by factory)
   */
  createTicks(count: number = 100): void {
    // DOM tick creation logic is handled in the factory
    // Dynamic tick creation logic can be added here
    console.log(`Creating ${count} ticks for DOM renderer`);
  }

  /**
   * Check if renderer is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Basic Rough.js interface for type safety
 */
interface RoughCanvas {
  circle(x: number, y: number, diameter: number, options?: Record<string, unknown>): void;
}

interface RoughJS {
  canvas(canvas: HTMLCanvasElement): RoughCanvas;
}

/**
 * Canvas renderer implementation with optional Rough.js support
 */
export class CanvasRenderer implements TimerRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private roughCanvas?: RoughCanvas;
  private timeElement?: HTMLElement;
  private currentTheme?: ThemeConfig;
  private initialized: boolean = false;
  private animationFrame?: number;

  constructor(canvas: HTMLCanvasElement, useRoughJs: boolean = false) {
    if (!canvas) {
      throw new Error('Canvas element is required for Canvas renderer');
    }

    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = context;

    // Initialize Rough.js if hand-drawn effect is needed
    if (useRoughJs && 'rough' in window) {
      try {
        const roughJS = (window as unknown as { rough: RoughJS }).rough;
        this.roughCanvas = roughJS.canvas(canvas);
      } catch (error) {
        console.warn('Failed to initialize Rough.js:', error);
      }
    }

    // Create time display element
    this.createTimeDisplay();
    this.initialized = true;
  }

  /**
   * Create time display element
   */
  private createTimeDisplay(): void {
    if (!this.canvas.parentElement) {
      console.warn('Canvas parent element not found, time display will not be created');
      return;
    }

    this.timeElement = document.createElement('div');
    this.timeElement.className =
      'absolute inset-0 flex items-center justify-center font-mono text-4xl font-bold pointer-events-none';
    this.timeElement.style.zIndex = '10';
    this.canvas.parentElement.appendChild(this.timeElement);
  }

  /**
   * Render timer progress on canvas
   */
  render(progress: number, theme: ThemeConfig): void {
    if (!this.initialized) {
      throw new Error('Canvas renderer not initialized');
    }

    if (progress < 0 || progress > 1) {
      throw new Error('Progress must be between 0 and 1');
    }

    this.currentTheme = theme;
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    try {
      // Draw clock face
      this.drawClockFace(centerX, centerY, radius, theme);

      // Draw ticks
      this.drawTicks(centerX, centerY, radius, theme);

      // Draw progress arc
      this.drawProgressArc(centerX, centerY, radius, progress, theme);

      // Draw hand
      this.drawHand(centerX, centerY, radius, progress, theme);

      // Draw center dot
      this.drawCenterDot(centerX, centerY, theme);
    } catch (error) {
      console.error('Error rendering canvas:', error);
    }
  }

  /**
   * Draw clock face with theme colors
   */
  private drawClockFace(x: number, y: number, radius: number, theme: ThemeConfig): void {
    this.ctx.save();

    if (this.roughCanvas && theme.effects.roughness) {
      // Use Rough.js for hand-drawn effect
      this.roughCanvas.circle(x, y, radius * 2, {
        stroke: theme.colors.primary,
        strokeWidth: theme.sizes.ringWidth,
        roughness: theme.effects.roughness,
      });
    } else {
      // Standard Canvas drawing
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = theme.colors.primary;
      this.ctx.lineWidth = theme.sizes.ringWidth;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  /**
   * Draw tick marks (100 ticks, every 10th is major)
   */
  private drawTicks(x: number, y: number, radius: number, theme: ThemeConfig): void {
    this.ctx.save();

    for (let i = 0; i < 100; i++) {
      const angle = (i * Math.PI * 2) / 100 - Math.PI / 2;
      const isMajor = i % 10 === 0;
      const tickLength = isMajor ? theme.sizes.majorTickLength : theme.sizes.tickLength;
      const tickWidth = isMajor ? 2 : 1;

      const startX = x + Math.cos(angle) * (radius - tickLength);
      const startY = y + Math.sin(angle) * (radius - tickLength);
      const endX = x + Math.cos(angle) * radius;
      const endY = y + Math.sin(angle) * radius;

      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.strokeStyle = isMajor ? theme.colors.primary : theme.colors.secondary;
      this.ctx.lineWidth = tickWidth;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  /**
   * Draw progress arc showing completed time
   */
  private drawProgressArc(
    x: number,
    y: number,
    radius: number,
    progress: number,
    theme: ThemeConfig
  ): void {
    if (progress <= 0) return;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(
      x,
      y,
      radius - theme.sizes.ringWidth / 2,
      -Math.PI / 2,
      -Math.PI / 2 + progress * Math.PI * 2
    );
    this.ctx.strokeStyle = theme.colors.accent;
    this.ctx.lineWidth = theme.sizes.ringWidth;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Draw hand pointer based on progress
   */
  private drawHand(
    x: number,
    y: number,
    radius: number,
    progress: number,
    theme: ThemeConfig
  ): void {
    const angle = progress * Math.PI * 2 - Math.PI / 2;
    const handLength = radius * 0.7;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + Math.cos(angle) * handLength, y + Math.sin(angle) * handLength);
    this.ctx.strokeStyle = theme.colors.accent;
    this.ctx.lineWidth = theme.sizes.handWidth;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Draw center dot
   */
  private drawCenterDot(x: number, y: number, theme: ThemeConfig): void {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, theme.sizes.centerDotSize / 2, 0, Math.PI * 2);
    this.ctx.fillStyle = theme.colors.accent;

    if (theme.effects.glow) {
      this.ctx.shadowColor = theme.colors.accent;
      this.ctx.shadowBlur = 10;
    }

    this.ctx.fill();
    this.ctx.restore();
  }

  /**
   * Update time display with theme styling
   */
  updateTime(timeString: string): void {
    if (this.timeElement) {
      this.timeElement.textContent = timeString;
      if (this.currentTheme) {
        this.timeElement.style.color = this.currentTheme.colors.text;
        this.timeElement.style.fontSize = `${this.currentTheme.sizes.fontSize}px`;
      }
    }
  }

  /**
   * Set animation state with visual feedback
   */
  setAnimationState(isRunning: boolean): void {
    if (this.timeElement) {
      this.timeElement.style.opacity = isRunning ? '1' : '0.7';
      this.timeElement.classList.toggle('running', isRunning);
    }

    // Cancel previous animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    // Start animation loop if running
    if (isRunning) {
      this.startAnimationLoop();
    }
  }

  /**
   * Start animation loop for smooth updates
   */
  private startAnimationLoop(): void {
    const animate = () => {
      // Smooth animation logic can be added here
      if (this.initialized) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };
    animate();
  }

  /**
   * Create tick marks (integrated in render method)
   */
  createTicks(count: number = 100): void {
    console.log(`Canvas renderer uses ${count} ticks integrated in render method`);
  }

  /**
   * Resize canvas with proper scaling
   */
  resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      throw new Error('Width and height must be positive numbers');
    }

    // Set canvas actual size
    this.canvas.width = width;
    this.canvas.height = height;

    // Set CSS size
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Re-render
    if (this.currentTheme) {
      this.render(0, this.currentTheme);
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Cancel animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Remove time display element
    if (this.timeElement) {
      this.timeElement.remove();
      this.timeElement = undefined;
    }

    // Clean up references
    this.roughCanvas = undefined;
    this.currentTheme = undefined;
    this.initialized = false;
  }

  /**
   * Get renderer type
   */
  getType(): RendererType {
    return 'canvas';
  }

  /**
   * Check if renderer is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Global Rough.js type declaration
declare global {
  interface Window {
    rough?: RoughJS;
  }
}
