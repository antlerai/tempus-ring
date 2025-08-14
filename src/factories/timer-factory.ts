import { ArtisticSVGRenderer } from '../components/renderers/artistic-svg-renderer';
import { CanvasRenderer } from '../components/renderers/canvas-renderer';
import { CloudlightDOMRenderer } from '../components/renderers/cloudlight-dom-renderer';
import { DawnDuskDOMRenderer } from '../components/renderers/dawn-dusk-dom-renderer';
import { DOMRenderer } from '../components/renderers/dom-renderer';
import { HandDrawnSVGRenderer } from '../components/renderers/hand-drawn-svg-renderer';
import { NightfallDOMRenderer } from '../components/renderers/nightfall-dom-renderer';
import { SVGRenderer } from '../components/renderers/svg-renderer';
import { WabiSabiCanvasRenderer } from '../components/renderers/wabisabi-canvas-renderer';
import type {
  CanvasRendererConfig,
  DOMRendererConfig,
  SVGRendererConfig,
  TimerRenderer,
} from '../types/renderer-types';
import type { RendererType, ThemeConfig } from '../types/theme-types';

export interface TimerFactoryConfig {
  defaultWidth?: number;
  defaultHeight?: number;
  devicePixelRatio?: number;
}

export class TimerFactory {
  private rendererCache: Map<string, TimerRenderer> = new Map();
  private config: TimerFactoryConfig;

  constructor(config: TimerFactoryConfig = {}) {
    this.config = {
      defaultWidth: 300,
      defaultHeight: 300,
      devicePixelRatio: window.devicePixelRatio || 1,
      ...config,
    };
  }

  /**
   * Create timer renderer based on theme configuration
   */
  createRenderer(
    container: HTMLElement,
    theme: ThemeConfig,
    options: {
      width?: number;
      height?: number;
      displayMode?: 'percentage' | 'clock';
      cacheKey?: string;
    } = {}
  ): TimerRenderer {
    if (!container) {
      throw new Error('Container element is required');
    }

    const {
      width = this.config.defaultWidth!,
      height = this.config.defaultHeight!,
      displayMode = 'percentage',
      cacheKey,
    } = options;

    // Check cache first
    const cachedRenderer = this.getCachedRendererIfValid(cacheKey);
    if (cachedRenderer) {
      return cachedRenderer;
    }

    try {
      const renderer = this.createRendererByType(container, theme, width, height, displayMode);

      // Cache renderer if cache key provided
      if (cacheKey) {
        this.rendererCache.set(cacheKey, renderer);
      }

      return renderer;
    } catch (error) {
      console.error(`Failed to create ${theme.renderer} renderer:`, error);
      throw new Error(
        `Renderer creation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get cached renderer if valid, otherwise clean up invalid cache
   */
  private getCachedRendererIfValid(cacheKey?: string): TimerRenderer | null {
    if (!cacheKey || !this.rendererCache.has(cacheKey)) {
      return null;
    }

    const cachedRenderer = this.rendererCache.get(cacheKey)!;
    if (cachedRenderer.isInitialized()) {
      return cachedRenderer;
    }

    // Remove invalid cached renderer
    this.rendererCache.delete(cacheKey);
    return null;
  }

  /**
   * Create renderer based on theme type and name
   */
  private createRendererByType(
    container: HTMLElement,
    theme: ThemeConfig,
    width: number,
    height: number,
    displayMode: 'percentage' | 'clock'
  ): TimerRenderer {
    switch (theme.renderer) {
      case 'dom':
        return this.createDOMRendererByTheme(container, theme, width, height, displayMode);
      case 'svg':
        return this.createSVGRendererByTheme(container, theme, width, height, displayMode);
      case 'canvas':
        return this.createCanvasRendererByTheme(container, theme, width, height, displayMode);
      default:
        return this.createDOMRenderer(container, theme, width, height, displayMode);
    }
  }

  /**
   * Create DOM renderer based on theme name
   */
  private createDOMRendererByTheme(
    container: HTMLElement,
    theme: ThemeConfig,
    width: number,
    height: number,
    displayMode: 'percentage' | 'clock'
  ): TimerRenderer {
    switch (theme.name) {
      case 'cloudlight':
        return this.createCloudlightDOMRenderer(container, theme, width, height, displayMode);
      case 'dawn-dusk':
        return this.createDawnDuskDOMRenderer(container, theme, width, height, displayMode);
      case 'nightfall':
        return this.createNightfallDOMRenderer(container, theme, width, height, displayMode);
      default:
        return this.createDOMRenderer(container, theme, width, height, displayMode);
    }
  }

  /**
   * Create SVG renderer based on theme name
   */
  private createSVGRendererByTheme(
    container: HTMLElement,
    theme: ThemeConfig,
    width: number,
    height: number,
    displayMode: 'percentage' | 'clock'
  ): TimerRenderer {
    switch (theme.name) {
      case 'artistic':
        return this.createArtisticSVGRenderer(container, theme, width, height, displayMode);
      case 'hand-drawn':
        return this.createHandDrawnSVGRenderer(container, theme, width, height, displayMode);
      default:
        return this.createSVGRenderer(container, theme, width, height, displayMode);
    }
  }

  /**
   * Create Canvas renderer based on theme name
   */
  private createCanvasRendererByTheme(
    container: HTMLElement,
    theme: ThemeConfig,
    width: number,
    height: number,
    displayMode: 'percentage' | 'clock'
  ): TimerRenderer {
    switch (theme.name) {
      case 'wabisabi':
        return this.createWabiSabiCanvasRenderer(container, theme, width, height, displayMode);
      default:
        return this.createCanvasRenderer(container, theme, width, height, displayMode);
    }
  }

  /**
   * Create Cloudlight DOM renderer with analog clock design
   */
  private createCloudlightDOMRenderer(
    container: HTMLElement,
    theme: ThemeConfig,
    width: number,
    height: number,
    displayMode: 'percentage' | 'clock'
  ): CloudlightDOMRenderer {
    const config: DOMRendererConfig = {
      container,
      width,
      height,
      theme,
      displayMode,
      useCSSTansitions: true,
      transitionDuration: '1s',
    };

    return new CloudlightDOMRenderer(config);
  }

  /**
   * Create Dawn & Dusk DOM renderer with gradient sky effect
   */
  private createDawnDuskDOMRenderer(
    container: HTMLElement,
    theme: ThemeConfig,
    width: number,
    height: number,
    displayMode: 'percentage' | 'clock'
  ): DawnDuskDOMRenderer {
    const config: DOMRendererConfig = {
      container,
      width,
      height,
      theme,
      displayMode,
      useCSSTansitions: true,
      transitionDuration: '1s',
    };

    return new DawnDuskDOMRenderer(config);
  }

  /**
   * Create Nightfall DOM renderer with celestial elements
   */
  private createNightfallDOMRenderer(
    container: HTMLElement,
    theme: ThemeConfig,
    width: number,
    height: number,
    displayMode: 'percentage' | 'clock'
  ): NightfallDOMRenderer {
    const config: DOMRendererConfig = {
      container,
      width,
      height,
      theme,
      displayMode,
      useCSSTansitions: true,
      transitionDuration: '1s',
    };

    return new NightfallDOMRenderer(config);
  }

  /**
   * Create Artistic SVG renderer with sketch effects
   */
  private createArtisticSVGRenderer(
    container: HTMLElement,
    theme: ThemeConfig,
    width: number,
    height: number,
    displayMode: 'percentage' | 'clock'
  ): ArtisticSVGRenderer {
    const config: SVGRendererConfig = {
      container,
      width,
      height,
      theme,
      displayMode,
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
    };

    return new ArtisticSVGRenderer(config);
  }

  /**
   * Create Hand-Drawn SVG renderer with doodle effects
   */
  private createHandDrawnSVGRenderer(
    container: HTMLElement,
    theme: ThemeConfig,
    width: number,
    height: number,
    displayMode: 'percentage' | 'clock'
  ): HandDrawnSVGRenderer {
    const config: SVGRendererConfig = {
      container,
      width,
      height,
      theme,
      displayMode,
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
    };

    return new HandDrawnSVGRenderer(config);
  }

  /**
   * Create Wabi-Sabi Canvas renderer with rough aesthetic
   */
  private createWabiSabiCanvasRenderer(
    container: HTMLElement,
    theme: ThemeConfig,
    width: number,
    height: number,
    displayMode: 'percentage' | 'clock'
  ): WabiSabiCanvasRenderer {
    const config: CanvasRendererConfig = {
      container,
      width,
      height,
      theme,
      displayMode,
      devicePixelRatio: this.config.devicePixelRatio || 1,
    };

    if (theme.effects) {
      config.roughOptions = {
        roughness: theme.effects.roughness || 2.5,
        strokeWidth: theme.effects.strokeWidth || 3,
        fillStyle: theme.effects.fillStyle || 'hachure',
        hachureGap: theme.effects.hachureGap || 6,
        hachureAngle: theme.effects.hachureAngle || 45,
      };
    }

    return new WabiSabiCanvasRenderer(config);
  }

  /**
   * Create DOM renderer with proper configuration
   */
  private createDOMRenderer(
    container: HTMLElement,
    theme: ThemeConfig,
    width: number,
    height: number,
    displayMode: 'percentage' | 'clock'
  ): DOMRenderer {
    const config: DOMRendererConfig = {
      container,
      width,
      height,
      theme,
      displayMode,
      useCSSTansitions: true,
      transitionDuration: '0.3s',
    };

    return new DOMRenderer(config);
  }

  /**
   * Create SVG renderer with vector graphics
   */
  private createSVGRenderer(
    container: HTMLElement,
    theme: ThemeConfig,
    width: number,
    height: number,
    displayMode: 'percentage' | 'clock'
  ): SVGRenderer {
    const config: SVGRendererConfig = {
      container,
      width,
      height,
      theme,
      displayMode,
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
    };

    return new SVGRenderer(config);
  }

  /**
   * Create Canvas renderer with 2D context and optional Rough.js effects
   */
  private createCanvasRenderer(
    container: HTMLElement,
    theme: ThemeConfig,
    width: number,
    height: number,
    displayMode: 'percentage' | 'clock'
  ): CanvasRenderer {
    const config: CanvasRendererConfig = {
      container,
      width,
      height,
      theme,
      displayMode,
      devicePixelRatio: this.config.devicePixelRatio || 1,
    };

    if (theme.effects) {
      config.roughOptions = {
        roughness: theme.effects.roughness || 1.2,
        strokeWidth: theme.effects.strokeWidth || 2,
        fillStyle: theme.effects.fillStyle || 'hachure',
        hachureGap: theme.effects.hachureGap || 4,
        hachureAngle: theme.effects.hachureAngle || 41,
      };
    }

    return new CanvasRenderer(config);
  }

  /**
   * Switch renderer type based on new theme
   */
  switchRenderer(
    container: HTMLElement,
    _fromTheme: ThemeConfig,
    toTheme: ThemeConfig,
    options: {
      width?: number;
      height?: number;
      displayMode?: 'percentage' | 'clock';
      cacheKey?: string;
      preserveState?: boolean;
    } = {}
  ): TimerRenderer {
    const { cacheKey, preserveState = true } = options;
    let previousState = null;

    // Clean up old renderer and preserve state if needed
    if (cacheKey && this.rendererCache.has(cacheKey)) {
      const oldRenderer = this.rendererCache.get(cacheKey)!;

      if (preserveState && oldRenderer.isInitialized()) {
        // Preserve current state for seamless transition
        previousState = {
          progress: 0.5, // TODO: Get actual progress from renderer
          timeString: '25:00', // TODO: Get actual time from renderer
          isAnimating: false,
        };
      }

      oldRenderer.destroy();
      this.rendererCache.delete(cacheKey);
    }

    // Clear container
    container.innerHTML = '';

    // Create new renderer
    const newRenderer = this.createRenderer(container, toTheme, options);

    // Restore state if preserved
    if (preserveState && previousState) {
      newRenderer.updateTime(previousState.timeString);
      newRenderer.render(previousState.progress, toTheme);
      newRenderer.setAnimationState(previousState.isAnimating);
    }

    return newRenderer;
  }

  /**
   * Get cached renderer by key
   */
  getCachedRenderer(cacheKey: string): TimerRenderer | undefined {
    return this.rendererCache.get(cacheKey);
  }

  /**
   * Check if renderer is cached
   */
  hasCachedRenderer(cacheKey: string): boolean {
    return this.rendererCache.has(cacheKey) && this.rendererCache.get(cacheKey)!.isInitialized();
  }

  /**
   * Remove specific cached renderer
   */
  removeCachedRenderer(cacheKey: string): boolean {
    const renderer = this.rendererCache.get(cacheKey);
    if (renderer) {
      try {
        renderer.destroy();
      } catch (error) {
        console.error('Error destroying cached renderer:', error);
      }
      this.rendererCache.delete(cacheKey);
      return true;
    }
    return false;
  }

  /**
   * Clear all cached renderers
   */
  clearCache(): void {
    for (const [key, renderer] of this.rendererCache.entries()) {
      try {
        renderer.destroy();
      } catch (error) {
        console.error(`Error destroying cached renderer "${key}":`, error);
      }
    }
    this.rendererCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; rendererTypes: RendererType[]; keys: string[] } {
    const rendererTypes: RendererType[] = [];
    const keys = Array.from(this.rendererCache.keys());

    for (const renderer of this.rendererCache.values()) {
      if (renderer.isInitialized()) {
        rendererTypes.push(renderer.getType());
      }
    }

    return {
      size: this.rendererCache.size,
      rendererTypes,
      keys,
    };
  }

  /**
   * Update factory configuration
   */
  updateConfig(config: Partial<TimerFactoryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Destroy factory and clean up all resources
   */
  destroy(): void {
    this.clearCache();
    this.config = {} as TimerFactoryConfig;
  }
}
