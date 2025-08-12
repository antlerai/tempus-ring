/**
 * Theme manager for unified theme switching and renderer configuration.
 */
import type { RendererType } from '../types/renderer-interface';

/**
 * Theme definition interface.
 */
export interface ThemeDefinition {
  /** Theme name. */
  name: string;
  /** Renderer type. */
  rendererType: RendererType;
  /** CSS files list. */
  cssFiles: string[];
  /** Canvas configuration. */
  canvasConfig?: CanvasThemeConfig;
  /** Theme description. */
  description?: string;
  /** Theme author. */
  author?: string;
  /** Theme version. */
  version?: string;
}

/**
 * Canvas theme configuration interface.
 */
export interface CanvasThemeConfig {
  /** Color configuration. */
  colors: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
    text?: string;
    border?: string;
  };
  /** Size configuration. */
  sizes: {
    ringWidth: number;
    tickLength: number;
    fontSize: number;
    majorTickLength?: number;
    handWidth?: number;
    centerDotSize?: number;
  };
  /** Effects configuration. */
  effects?: {
    /** Roughness for hand-drawn effects. */
    roughness?: number;
    /** Shadow effect. */
    shadow?: boolean;
    /** Glow effect. */
    glow?: boolean;
  };
}

/**
 * Theme manager class.
 */
export class ThemeManager {
  private currentTheme: string = 'cloudlight-minimal';
  private loadedCssFiles: Set<string> = new Set();
  private themeChangeListeners: Set<(themeName: string) => void> = new Set();

  /**
   * Theme configuration definitions based on prototype designs.
   */
  private themes: Record<string, ThemeDefinition> = {
    'cloudlight-minimal': {
      name: 'cloudlight-minimal',
      rendererType: 'dom',
      cssFiles: ['theme-cloudlight.css', 'dom-cloudlight.css'],
      description: 'Clean and minimal light theme with subtle shadows',
      author: 'Tempus Ring Team',
      version: '1.0.0',
    },
    nightfall: {
      name: 'nightfall',
      rendererType: 'dom',
      cssFiles: ['theme-nightfall.css', 'dom-nightfall.css'],
      description: 'Dark theme with day-night gradient effects',
      author: 'Tempus Ring Team',
      version: '1.0.0',
    },
    'hand-drawn-sketch': {
      name: 'hand-drawn-sketch',
      rendererType: 'svg',
      cssFiles: ['theme-sketch.css', 'svg-sketch.css'],
      description: 'Hand-drawn sketch style with rough edges',
      author: 'Tempus Ring Team',
      version: '1.0.0',
    },
    'artistic-sketch': {
      name: 'artistic-sketch',
      rendererType: 'svg',
      cssFiles: ['theme-artistic.css', 'svg-artistic.css'],
      description: 'Artistic sketch with refined hand-drawn elements',
      author: 'Tempus Ring Team',
      version: '1.0.0',
    },
    'wabi-sabi': {
      name: 'wabi-sabi',
      rendererType: 'canvas',
      cssFiles: ['theme-wabi-sabi.css'],
      description: 'Japanese aesthetic of imperfection and impermanence',
      author: 'Tempus Ring Team',
      version: '1.0.0',
      canvasConfig: {
        colors: {
          primary: '#374151',
          secondary: '#9ca3af',
          background: '#ffffff',
          accent: '#ef4444',
          text: '#1f2937',
          border: '#e5e7eb',
        },
        sizes: {
          ringWidth: 3,
          tickLength: 8,
          fontSize: 24,
          majorTickLength: 12,
          handWidth: 2,
          centerDotSize: 8,
        },
        effects: {
          roughness: 1.5,
          shadow: true,
          glow: false,
        },
      },
    },
    'dawn-and-dusk': {
      name: 'dawn-and-dusk',
      rendererType: 'canvas',
      cssFiles: ['theme-dawn-dusk.css'],
      description: 'Warm colors representing the transition between day and night',
      author: 'Tempus Ring Team',
      version: '1.0.0',
      canvasConfig: {
        colors: {
          primary: '#64748b',
          secondary: '#9ca3af',
          background: '#ffffff',
          accent: '#f59e0b',
          text: '#1f2937',
          border: '#d1d5db',
        },
        sizes: {
          ringWidth: 4,
          tickLength: 8,
          fontSize: 20,
          majorTickLength: 14,
          handWidth: 3,
          centerDotSize: 10,
        },
        effects: {
          roughness: 0.8,
          shadow: true,
          glow: true,
        },
      },
    },
  };

  /**
   * Switch to specified theme.
   * @param themeName - The name of the theme.
   */
  async switchTheme(themeName: string): Promise<void> {
    const theme = this.themes[themeName];
    if (!theme) {
      throw new Error(
        `Theme "${themeName}" not found. Available themes: ${Object.keys(this.themes).join(', ')}`
      );
    }

    try {
      // 1. Unload current theme CSS
      this.unloadCurrentTheme();

      // 2. Load new theme CSS
      await this.loadThemeCSS(theme.cssFiles);

      // 3. Switch root element class name
      document.documentElement.className = `theme-${themeName}`;

      // 4. Update current theme
      const previousTheme = this.currentTheme;
      this.currentTheme = themeName;

      // 5. Notify listeners
      this.notifyThemeChange(themeName);

      console.log(`Theme switched from "${previousTheme}" to "${themeName}"`);
    } catch (error) {
      console.error(`Failed to switch theme to "${themeName}":`, error);
      throw error;
    }
  }

  /**
   * Get current theme configuration.
   */
  getCurrentTheme(): ThemeDefinition {
    const theme = this.themes[this.currentTheme];
    if (!theme) {
      throw new Error(`Current theme "${this.currentTheme}" not found`);
    }
    return theme;
  }

  /**
   * Get Canvas theme configuration.
   * @param themeName - Theme name (optional, defaults to current theme).
   */
  getCanvasConfig(themeName?: string): CanvasThemeConfig | undefined {
    const targetTheme = themeName || this.currentTheme;
    return this.themes[targetTheme]?.canvasConfig;
  }

  /**
   * Get all available themes.
   */
  getAvailableThemes(): ThemeDefinition[] {
    return Object.values(this.themes);
  }

  /**
   * Get theme names list.
   */
  getThemeNames(): string[] {
    return Object.keys(this.themes);
  }

  /**
   * Check if theme exists.
   */
  hasTheme(themeName: string): boolean {
    return themeName in this.themes;
  }

  /**
   * Get current theme name.
   */
  getCurrentThemeName(): string {
    return this.currentTheme;
  }

  /**
   * Load theme CSS files.
   */
  private async loadThemeCSS(cssFiles: string[]): Promise<void> {
    const loadPromises = cssFiles.map((file) => this.loadSingleCSS(file));
    await Promise.all(loadPromises);
  }

  /**
   * Load single CSS file.
   */
  private loadSingleCSS(file: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loadedCssFiles.has(file)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `/src/styles/themes/${file}`;

      link.onload = () => {
        this.loadedCssFiles.add(file);
        resolve();
      };

      link.onerror = () => {
        reject(new Error(`Failed to load CSS file: ${file}`));
      };

      document.head.appendChild(link);
    });
  }

  /**
   * Unload current theme CSS.
   */
  private unloadCurrentTheme(): void {
    const currentTheme = this.themes[this.currentTheme];
    if (currentTheme) {
      for (const file of currentTheme.cssFiles) {
        const link = document.querySelector(
          `link[href="/src/styles/themes/${file}"]`
        ) as HTMLLinkElement;
        if (link) {
          document.head.removeChild(link);
          this.loadedCssFiles.delete(file);
        }
      }
    }
  }

  /**
   * Add theme change listener.
   */
  addThemeChangeListener(listener: (themeName: string) => void): void {
    this.themeChangeListeners.add(listener);
  }

  /**
   * Remove theme change listener.
   */
  removeThemeChangeListener(listener: (themeName: string) => void): void {
    this.themeChangeListeners.delete(listener);
  }

  /**
   * Notify theme change.
   */
  private notifyThemeChange(themeName: string): void {
    for (const listener of this.themeChangeListeners) {
      try {
        listener(themeName);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    }
  }

  /**
   * Clean up resources.
   */
  destroy(): void {
    this.unloadCurrentTheme();
    this.themeChangeListeners.clear();
    this.loadedCssFiles.clear();
  }
}
