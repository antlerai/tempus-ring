import type { ThemeConfig, ThemeDefinition, ThemeManagerEvents, ThemeName } from '../types';
import { THEME_NAMES } from '../types';

class EventEmitter<T extends Record<string, unknown>> {
  private listeners: { [K in keyof T]?: ((data: T[K]) => void)[] } = {};

  on<K extends keyof T>(event: K, callback: (data: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback);
  }

  off<K extends keyof T>(event: K, callback: (data: T[K]) => void): void {
    const listeners = this.listeners[event];
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const listeners = this.listeners[event];
    if (listeners) {
      for (const listener of listeners) {
        listener(data);
      }
    }
  }
}

export class ThemeManager extends EventEmitter<ThemeManagerEvents> {
  private currentTheme: ThemeName = THEME_NAMES.CLOUDLIGHT;
  private loadedStyleSheets: Set<string> = new Set();
  private storageKey = 'tempus-ring-theme';

  private themes: Record<ThemeName, ThemeDefinition> = {
    [THEME_NAMES.WABISABI]: {
      config: {
        name: THEME_NAMES.WABISABI,
        displayName: 'Wabi-Sabi',
        renderer: 'canvas',
        layoutMode: 'standard',
        controlPanel: {
          buttonLayout: 'minimal',
          showLabels: false,
          showIcons: true,
        },
        colors: {
          primary: '#374151',
          secondary: '#9ca3af',
          background: '#f9fafb',
          text: '#1f2937',
          accent: '#ef4444',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        fonts: {
          primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          secondary: 'Georgia, "Times New Roman", serif',
          mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        },
        borderRadius: {
          sm: '0.25rem',
          md: '0.5rem',
          lg: '1rem',
          full: '9999px',
        },
        shadows: {
          sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        },
        effects: {
          roughness: 1.5,
          strokeWidth: 3,
          fillStyle: 'hachure',
          hachureGap: 4,
          hachureAngle: 60,
        },
      },
      cssVariables: {
        '--primary-color': '#374151',
        '--secondary-color': '#9ca3af',
        '--background-color': '#f9fafb',
        '--text-color': '#1f2937',
        '--accent-color': '#ef4444',
      },
      styleSheet: 'wabisabi.css',
    },

    [THEME_NAMES.CLOUDLIGHT]: {
      config: {
        name: THEME_NAMES.CLOUDLIGHT,
        displayName: 'Cloudlight',
        renderer: 'dom',
        layoutMode: 'minimal',
        controlPanel: {
          buttonLayout: 'minimal',
          showLabels: false,
          showIcons: true,
        },
        colors: {
          primary: '#64748b',
          secondary: '#94a3b8',
          background: '#ffffff',
          text: '#1e293b',
          accent: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        fonts: {
          primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          secondary: 'Inter, "Helvetica Neue", Arial, sans-serif',
          mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        },
        borderRadius: {
          sm: '0.25rem',
          md: '0.5rem',
          lg: '1rem',
          full: '9999px',
        },
        shadows: {
          sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        },
      },
      cssVariables: {
        '--primary-color': '#64748b',
        '--secondary-color': '#94a3b8',
        '--background-color': '#ffffff',
        '--text-color': '#1e293b',
        '--accent-color': '#3b82f6',
      },
      styleSheet: 'cloudlight.css',
    },

    [THEME_NAMES.DAWN_DUSK]: {
      config: {
        name: THEME_NAMES.DAWN_DUSK,
        displayName: 'Dawn & Dusk',
        renderer: 'dom',
        layoutMode: 'standard',
        controlPanel: {
          buttonLayout: 'minimal',
          showLabels: false,
          showIcons: true,
        },
        colors: {
          primary: '#f59e0b',
          secondary: '#fbbf24',
          background: '#fef3c7',
          text: '#92400e',
          accent: '#d97706',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#dc2626',
        },
        fonts: {
          primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          secondary: 'Playfair Display, Georgia, serif',
          mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        },
        borderRadius: {
          sm: '0.25rem',
          md: '0.5rem',
          lg: '1rem',
          full: '9999px',
        },
        shadows: {
          sm: '0 1px 2px 0 rgba(245, 158, 11, 0.1)',
          md: '0 4px 6px -1px rgba(245, 158, 11, 0.2)',
          lg: '0 10px 15px -3px rgba(245, 158, 11, 0.3)',
        },
      },
      cssVariables: {
        '--primary-color': '#f59e0b',
        '--secondary-color': '#fbbf24',
        '--background-color': '#fef3c7',
        '--text-color': '#92400e',
        '--accent-color': '#d97706',
      },
      styleSheet: 'dawn-dusk.css',
    },

    [THEME_NAMES.NIGHTFALL]: {
      config: {
        name: THEME_NAMES.NIGHTFALL,
        displayName: 'Nightfall',
        renderer: 'dom',
        layoutMode: 'standard',
        controlPanel: {
          buttonLayout: 'minimal',
          showLabels: false,
          showIcons: true,
        },
        colors: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          background: '#0f172a',
          text: '#f8fafc',
          accent: '#a855f7',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        fonts: {
          primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          secondary: 'Inter, "Helvetica Neue", Arial, sans-serif',
          mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        },
        borderRadius: {
          sm: '0.25rem',
          md: '0.5rem',
          lg: '1rem',
          full: '9999px',
        },
        shadows: {
          sm: '0 1px 2px 0 rgba(99, 102, 241, 0.1)',
          md: '0 4px 6px -1px rgba(99, 102, 241, 0.2)',
          lg: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
        },
      },
      cssVariables: {
        '--primary-color': '#6366f1',
        '--secondary-color': '#8b5cf6',
        '--background-color': '#0f172a',
        '--text-color': '#f8fafc',
        '--accent-color': '#a855f7',
      },
      styleSheet: 'nightfall.css',
    },

    [THEME_NAMES.ARTISTIC]: {
      config: {
        name: THEME_NAMES.ARTISTIC,
        displayName: 'Artistic Sketch',
        renderer: 'svg',
        layoutMode: 'standard',
        controlPanel: {
          buttonLayout: 'minimal',
          showLabels: false,
          showIcons: true,
        },
        colors: {
          primary: '#374151',
          secondary: '#6b7280',
          background: '#fefefe',
          text: '#111827',
          accent: '#ef4444',
          success: '#059669',
          warning: '#d97706',
          error: '#dc2626',
        },
        fonts: {
          primary: 'Comic Neue, cursive, sans-serif',
          secondary: 'Kalam, cursive, sans-serif',
          mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        },
        borderRadius: {
          sm: '0.125rem',
          md: '0.25rem',
          lg: '0.5rem',
          full: '9999px',
        },
        shadows: {
          sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        },
      },
      cssVariables: {
        '--primary-color': '#374151',
        '--secondary-color': '#6b7280',
        '--background-color': '#fefefe',
        '--text-color': '#111827',
        '--accent-color': '#ef4444',
      },
      styleSheet: 'artistic.css',
    },

    [THEME_NAMES.HAND_DRAWN]: {
      config: {
        name: THEME_NAMES.HAND_DRAWN,
        displayName: 'Hand Drawn',
        renderer: 'svg',
        layoutMode: 'standard',
        controlPanel: {
          buttonLayout: 'minimal',
          showLabels: false,
          showIcons: true,
        },
        colors: {
          primary: '#4b5563',
          secondary: '#9ca3af',
          background: '#fefefe',
          text: '#1f2937',
          accent: '#f97316',
          success: '#059669',
          warning: '#d97706',
          error: '#dc2626',
        },
        fonts: {
          primary: 'Caveat, cursive, sans-serif',
          secondary: 'Kalam, cursive, sans-serif',
          mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        },
        borderRadius: {
          sm: '0.125rem',
          md: '0.375rem',
          lg: '0.75rem',
          full: '9999px',
        },
        shadows: {
          sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        },
        effects: {
          roughness: 2.0,
          strokeWidth: 2,
          fillStyle: 'zigzag-line',
          hachureGap: 6,
          hachureAngle: 45,
        },
      },
      cssVariables: {
        '--primary-color': '#4b5563',
        '--secondary-color': '#9ca3af',
        '--background-color': '#fefefe',
        '--text-color': '#1f2937',
        '--accent-color': '#f97316',
      },
      styleSheet: 'hand-drawn.css',
    },
  };

  constructor() {
    super();
    this.loadThemeFromStorage();
  }

  async init(): Promise<void> {
    await this.applyTheme(this.currentTheme);
  }

  getCurrentTheme(): ThemeConfig {
    return this.themes[this.currentTheme].config;
  }

  getCurrentThemeName(): ThemeName {
    return this.currentTheme;
  }

  getThemeDefinition(themeName?: ThemeName): ThemeDefinition {
    const targetTheme = themeName || this.currentTheme;
    return this.themes[targetTheme];
  }

  getAvailableThemes(): ThemeDefinition[] {
    return Object.values(this.themes);
  }

  getThemeNames(): ThemeName[] {
    return Object.keys(this.themes) as ThemeName[];
  }

  hasTheme(themeName: string): themeName is ThemeName {
    return themeName in this.themes;
  }

  async switchTheme(themeName: ThemeName): Promise<void> {
    if (!this.hasTheme(themeName)) {
      const availableThemes = this.getThemeNames().join(', ');
      throw new Error(`Theme "${themeName}" not found. Available themes: ${availableThemes}`);
    }

    const oldTheme = this.currentTheme;

    try {
      await this.applyTheme(themeName);
      this.currentTheme = themeName;
      this.saveThemeToStorage(themeName);

      this.emit('theme:changed', { from: oldTheme, to: themeName });
    } catch (error) {
      this.emit('theme:error', {
        theme: themeName,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async applyTheme(themeName: ThemeName): Promise<void> {
    const theme = this.themes[themeName];

    // Apply CSS variables to root
    this.applyCSSVariables(theme.cssVariables);

    // Load theme stylesheet if specified
    if (theme.styleSheet) {
      await this.loadStyleSheet(theme.styleSheet);
    }

    // Update document class
    document.documentElement.className = `theme-${themeName}`;

    this.emit('theme:loaded', { theme: themeName });
  }

  private applyCSSVariables(variables: Record<string, string>): void {
    const root = document.documentElement;

    for (const [property, value] of Object.entries(variables)) {
      root.style.setProperty(property, value);
    }
  }

  private async loadStyleSheet(fileName: string): Promise<void> {
    if (this.loadedStyleSheets.has(fileName)) {
      return;
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `/src/styles/themes/${fileName}`;

      link.onload = () => {
        this.loadedStyleSheets.add(fileName);
        resolve();
      };

      link.onerror = () => {
        reject(new Error(`Failed to load stylesheet: ${fileName}`));
      };

      document.head.appendChild(link);
    });
  }

  private loadThemeFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey) as ThemeName;
      if (stored && this.hasTheme(stored)) {
        this.currentTheme = stored;
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error);
    }
  }

  private saveThemeToStorage(themeName: ThemeName): void {
    try {
      localStorage.setItem(this.storageKey, themeName);
    } catch (error) {
      console.warn('Failed to save theme to storage:', error);
    }
  }

  destroy(): void {
    // Remove all loaded stylesheets
    for (const fileName of this.loadedStyleSheets) {
      const link = document.querySelector(`link[href="/src/styles/themes/${fileName}"]`);
      if (link) {
        link.remove();
      }
    }
    this.loadedStyleSheets.clear();
  }
}
