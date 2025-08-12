/**
 * Timer factory for creating renderer instances based on theme configuration.
 */

import { CanvasRenderer, DOMRenderer } from '../components/renderers';
import { type ThemeDefinition, ThemeManager } from '../services/theme-manager';
import type { TimerRenderer } from '../types/renderer-interface';

/**
 * Timer factory class.
 */
export class TimerFactory {
  private themeManager: ThemeManager;
  private rendererCache: Map<string, TimerRenderer> = new Map();

  constructor(themeManager?: ThemeManager) {
    this.themeManager = themeManager || new ThemeManager();
  }

  /**
   * Create timer renderer based on current theme.
   * @param container - Container element.
   * @param cacheKey - Cache key (optional).
   */
  createRenderer(container: HTMLElement, cacheKey?: string): TimerRenderer {
    if (!container) {
      throw new Error('Container element is required');
    }

    const currentTheme = this.themeManager.getCurrentTheme();
    const _key = cacheKey || `${currentTheme.name}-${Date.now()}`;

    // Check cache
    if (cacheKey && this.rendererCache.has(cacheKey)) {
      const cachedRenderer = this.rendererCache.get(cacheKey)!;
      if (cachedRenderer.isInitialized()) {
        return cachedRenderer;
      }
    }

    let renderer: TimerRenderer;

    try {
      switch (currentTheme.rendererType) {
        case 'dom':
          renderer = this.createDOMRenderer(container, currentTheme);
          break;

        case 'svg':
          renderer = this.createSVGRenderer(container, currentTheme);
          break;

        case 'canvas':
          renderer = this.createCanvasRenderer(container, currentTheme);
          break;

        default:
          throw new Error(`Unsupported renderer type: ${currentTheme.rendererType}`);
      }

      // Cache renderer
      if (cacheKey) {
        this.rendererCache.set(cacheKey, renderer);
      }

      return renderer;
    } catch (error) {
      console.error(`Failed to create ${currentTheme.rendererType} renderer:`, error);
      throw error;
    }
  }

  /**
   * Create DOM renderer with proper structure.
   */
  private createDOMRenderer(container: HTMLElement, _theme: ThemeDefinition): DOMRenderer {
    try {
      // Clear container
      container.innerHTML = '';

      // Create DOM structure
      const timerElement = document.createElement('div');
      timerElement.className = 'timer-dom';
      timerElement.innerHTML = `
        <div class="progress-ring"></div>
        <div class="tick-marks">
          ${this.generateTickMarks(100)}
        </div>
        <div class="timer-text">25:00</div>
      `;

      container.appendChild(timerElement);

      return new DOMRenderer(container);
    } catch (error) {
      console.error('Failed to create DOM renderer:', error);
      throw new Error(`DOM renderer creation failed: ${error}`);
    }
  }

  /**
   * Create SVG renderer with vector graphics.
   */
  private createSVGRenderer(container: HTMLElement, _theme: ThemeDefinition): TimerRenderer {
    try {
      // Clear container
      container.innerHTML = '';

      // Create SVG structure
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('timer-svg');
      svg.setAttribute('viewBox', '0 0 256 256');
      svg.setAttribute('width', '256');
      svg.setAttribute('height', '256');

      // Add base SVG elements
      svg.innerHTML = `
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        <g class="timer-svg-content">
          <circle class="background-circle" cx="128" cy="128" r="100" />
          <g class="tick-group">${this.generateSVGTicks(100)}</g>
          <circle class="progress-circle" cx="128" cy="128" r="100" />
          <g class="clock-hands-group">
            <line class="hand minute-hand" x1="128" y1="128" x2="128" y2="48" />
          </g>
          <circle class="center-dot" cx="128" cy="128" r="4" />
        </g>
      `;

      container.appendChild(svg);

      // Note: This should return an SVGRenderer instance, but DOMRenderer is used as a placeholder.
      // TODO: Implement a dedicated SVGRenderer class.
      return new DOMRenderer(container);
    } catch (error) {
      console.error('Failed to create SVG renderer:', error);
      throw new Error(`SVG renderer creation failed: ${error}`);
    }
  }

  /**
   * Create Canvas renderer with 2D context.
   */
  private createCanvasRenderer(container: HTMLElement, theme: ThemeDefinition): CanvasRenderer {
    try {
      // Clear container
      container.innerHTML = '';

      // Create Canvas element
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      canvas.classList.add('timer-canvas');

      // Set high DPI support
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      container.appendChild(canvas);

      // Check for Rough.js support
      const useRoughJs = theme.canvasConfig?.effects?.roughness !== undefined;

      return new CanvasRenderer(canvas, useRoughJs);
    } catch (error) {
      console.error('Failed to create Canvas renderer:', error);
      throw new Error(`Canvas renderer creation failed: ${error}`);
    }
  }

  /**
   * Generate DOM tick marks.
   */
  private generateTickMarks(count: number): string {
    let html = '';
    for (let i = 0; i < count; i++) {
      const angle = (i * 360) / count;
      const isMajor = i % 10 === 0;
      const className = isMajor ? 'tick-mark major-tick' : 'tick-mark';
      html += `<div class="${className}" style="transform: translateX(-50%) rotate(${angle}deg)"></div>`;
    }
    return html;
  }

  /**
   * Generate SVG tick marks.
   */
  private generateSVGTicks(count: number): string {
    let svg = '';
    const centerX = 128;
    const centerY = 128;
    const radius = 100;

    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count - Math.PI / 2;
      const isMajor = i % 10 === 0;
      const tickLength = isMajor ? 12 : 6;
      const className = isMajor ? 'tick-line major-tick' : 'tick-line';

      const startX = centerX + Math.cos(angle) * (radius - tickLength);
      const startY = centerY + Math.sin(angle) * (radius - tickLength);
      const endX = centerX + Math.cos(angle) * radius;
      const endY = centerY + Math.sin(angle) * radius;

      svg += `<line class="${className}" x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" />`;
    }

    return svg;
  }

  /**
   * Switch theme and recreate renderer.
   * @param themeName - The name of the theme.
   * @param container - The container element.
   * @param cacheKey - The cache key (optional).
   */
  async switchTheme(
    themeName: string,
    container: HTMLElement,
    cacheKey?: string
  ): Promise<TimerRenderer> {
    if (!this.themeManager.hasTheme(themeName)) {
      throw new Error(`Theme "${themeName}" does not exist`);
    }

    try {
      // Clean up old renderer
      if (cacheKey && this.rendererCache.has(cacheKey)) {
        const oldRenderer = this.rendererCache.get(cacheKey)!;
        oldRenderer.destroy();
        this.rendererCache.delete(cacheKey);
      }

      // Switch theme
      await this.themeManager.switchTheme(themeName);

      // Clear container
      container.innerHTML = '';

      // Create new renderer
      return this.createRenderer(container, cacheKey);
    } catch (error) {
      console.error(`Failed to switch theme to "${themeName}":`, error);
      throw error;
    }
  }

  /**
   * Get theme manager instance.
   */
  getThemeManager(): ThemeManager {
    return this.themeManager;
  }

  /**
   * Clear cached renderers.
   */
  clearCache(): void {
    for (const renderer of this.rendererCache.values()) {
      try {
        renderer.destroy();
      } catch (error) {
        console.error('Error destroying cached renderer:', error);
      }
    }
    this.rendererCache.clear();
  }

  /**
   * Destroy factory instance.
   */
  destroy(): void {
    this.clearCache();
    this.themeManager.destroy();
  }
}
