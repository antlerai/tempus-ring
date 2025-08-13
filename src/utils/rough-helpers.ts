import rough from 'roughjs';
import type { CanvasRendererConfig } from '../types/renderer-types';

// Basic types for Rough.js drawables (since official types don't exist)
// biome-ignore lint/suspicious/noExplicitAny: Rough.js doesn't have official TypeScript types
type RoughDrawable = any;

export interface CachedDrawables {
  circle: RoughDrawable;
  ticks: {
    large: RoughDrawable[];
    small: RoughDrawable[];
  };
  centerDot?: RoughDrawable;
}

export class RoughCanvasHelper {
  // biome-ignore lint/suspicious/noExplicitAny: Rough.js doesn't have official TypeScript types
  private roughCanvas: any;
  private cache: Map<string, CachedDrawables> = new Map();
  private config: CanvasRendererConfig;

  constructor(canvas: HTMLCanvasElement, config: CanvasRendererConfig) {
    this.roughCanvas = rough.canvas(canvas);
    this.config = config;
  }

  /**
   * Get cached drawables for a specific configuration
   */
  getCachedDrawables(
    radius: number,
    centerX: number,
    centerY: number,
    tickCount: number = 100
  ): CachedDrawables {
    const cacheKey = `${radius}-${centerX}-${centerY}-${tickCount}`;

    if (!this.cache.has(cacheKey)) {
      this.cache.set(cacheKey, this.generateDrawables(radius, centerX, centerY, tickCount));
    }

    return this.cache.get(cacheKey)!;
  }

  /**
   * Generate all drawable objects for stable animation
   */
  private generateDrawables(
    radius: number,
    centerX: number,
    centerY: number,
    tickCount: number
  ): CachedDrawables {
    const roughOptions = this.getRoughOptions();

    // Generate main circle
    const circle = this.roughCanvas.generator.circle(centerX, centerY, radius * 2, {
      ...roughOptions,
      fill: 'none',
      stroke: this.config.theme.colors.primary,
      strokeWidth: 8,
    });

    // Generate tick marks
    const largeTicks: RoughDrawable[] = [];
    const smallTicks: RoughDrawable[] = [];

    const angleIncrement = (2 * Math.PI) / tickCount;

    for (let i = 0; i < tickCount; i++) {
      const angle = i * angleIncrement - Math.PI / 2; // Start from top
      const isLarge = i % (tickCount / 12) === 0;

      const outerRadius = radius + (isLarge ? 15 : 10);
      const innerRadius = radius + (isLarge ? 5 : 8);

      const x1 = centerX + Math.cos(angle) * innerRadius;
      const y1 = centerY + Math.sin(angle) * innerRadius;
      const x2 = centerX + Math.cos(angle) * outerRadius;
      const y2 = centerY + Math.sin(angle) * outerRadius;

      const tick = this.roughCanvas.generator.line(x1, y1, x2, y2, {
        ...roughOptions,
        stroke: this.config.theme.colors.text,
        strokeWidth: isLarge ? 2 : 1,
      });

      if (isLarge) {
        largeTicks.push(tick);
      } else {
        smallTicks.push(tick);
      }
    }

    // Generate center dot
    const centerDot = this.roughCanvas.generator.circle(centerX, centerY, 8, {
      ...roughOptions,
      fill: this.config.theme.colors.primary,
      stroke: this.config.theme.colors.primary,
      strokeWidth: 2,
    });

    return {
      circle,
      ticks: { large: largeTicks, small: smallTicks },
      centerDot,
    };
  }

  /**
   * Get Rough.js options based on theme configuration
   */
  private getRoughOptions() {
    const effects = this.config.theme.effects || {};

    return {
      roughness: effects.roughness || 1.2,
      strokeWidth: effects.strokeWidth || 2,
      fillStyle: effects.fillStyle || 'hachure',
      hachureGap: effects.hachureGap || 4,
      hachureAngle: effects.hachureAngle || 41,
      seed: 42, // Fixed seed for consistent randomness
    };
  }

  /**
   * Draw progress arc using Rough.js
   */
  drawProgressArc(
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    strokeColor: string
  ): void {
    const roughOptions = {
      ...this.getRoughOptions(),
      fill: 'none',
      stroke: strokeColor,
      strokeWidth: 8,
    };

    // Calculate arc path
    const startX = centerX + Math.cos(startAngle) * radius;
    const startY = centerY + Math.sin(startAngle) * radius;
    const endX = centerX + Math.cos(endAngle) * radius;
    const endY = centerY + Math.sin(endAngle) * radius;

    // For small angles, draw a line; for larger angles, draw an arc
    const angleDiff = endAngle - startAngle;

    if (Math.abs(angleDiff) < 0.1) {
      // Draw a small line for very small progress
      const line = this.roughCanvas.generator.line(startX, startY, endX, endY, roughOptions);
      this.roughCanvas.draw(line);
    } else {
      // Draw an arc path using rough.js arc
      const largeArcFlag = Math.abs(angleDiff) > Math.PI ? 1 : 0;
      const sweepFlag = angleDiff > 0 ? 1 : 0;

      const pathString = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`;

      try {
        const path = this.roughCanvas.generator.path(pathString, roughOptions);
        this.roughCanvas.draw(path);
      } catch (_error) {
        // Fallback to simple line if path drawing fails
        const line = this.roughCanvas.generator.line(startX, startY, endX, endY, roughOptions);
        this.roughCanvas.draw(line);
      }
    }
  }

  /**
   * Draw cached drawables
   */
  drawCached(
    drawables: CachedDrawables,
    options?: {
      showTicks?: boolean;
      showCenter?: boolean;
      tickOpacity?: number;
    }
  ): void {
    const opts = { showTicks: true, showCenter: true, tickOpacity: 1, ...options };

    // Draw main circle (background)
    this.roughCanvas.draw(drawables.circle);

    // Draw ticks
    if (opts.showTicks) {
      // Draw small ticks with reduced opacity
      for (const tick of drawables.ticks.small) {
        this.roughCanvas.draw(tick);
      }

      // Draw large ticks
      for (const tick of drawables.ticks.large) {
        this.roughCanvas.draw(tick);
      }
    }

    // Draw center dot
    if (opts.showCenter && drawables.centerDot) {
      this.roughCanvas.draw(drawables.centerDot);
    }
  }

  /**
   * Clear cache when theme changes
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: CanvasRendererConfig): void {
    this.config = config;
    this.clearCache(); // Clear cache when config changes
  }

  /**
   * Get the underlying rough canvas instance
   */
  // biome-ignore lint/suspicious/noExplicitAny: Rough.js doesn't have official TypeScript types
  getRoughCanvas(): any {
    return this.roughCanvas;
  }
}
