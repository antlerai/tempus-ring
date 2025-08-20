/* Theme Style Configurations - CSS file dependencies and optimization settings */
/* This file defines how each theme loads and manages its CSS resources */

import type { ThemeStyleConfig } from '../types/theme-types';

export const THEME_STYLE_CONFIGS: Record<string, ThemeStyleConfig> = {
  cloudlight: {
    cssFiles: ['/src/styles/themes/cloudlight-variables.css', '/src/styles/themes/cloudlight.css'],
    variablesFile: '/src/styles/themes/cloudlight-variables.css',
    rendererType: 'dom',
    animations: {
      useCSS: true,
      fallbackToJS: false,
      duration: 200,
    },
    performance: {
      willChange: ['transform'],
      contain: 'layout style',
      layerize: true,
    },
    customProperties: {
      '--hand-transition': 'transform 1000ms linear',
      '--button-hover-translate': '-1px',
    },
  },

  wabisabi: {
    cssFiles: ['/src/styles/themes/wabisabi-variables.css', '/src/styles/themes/wabisabi.css'],
    variablesFile: '/src/styles/themes/wabisabi-variables.css',
    rendererType: 'canvas',
    animations: {
      useCSS: false, // Canvas renderer uses JS animations
      fallbackToJS: true,
      duration: 400,
    },
    performance: {
      willChange: ['transform', 'opacity'],
      contain: 'layout style paint',
      layerize: true,
    },
    customProperties: {
      '--roughness': '2.5',
      '--stroke-width': '2',
      '--fill-style': 'hachure',
    },
  },

  artistic: {
    cssFiles: ['/src/styles/themes/artistic-variables.css', '/src/styles/themes/artistic.css'],
    variablesFile: '/src/styles/themes/artistic-variables.css',
    rendererType: 'svg',
    animations: {
      useCSS: true,
      fallbackToJS: true,
      duration: 350,
    },
    performance: {
      willChange: ['transform', 'opacity', 'filter'],
      contain: 'layout style',
      layerize: false,
    },
    customProperties: {
      '--brush-roughness': '1.8',
      '--paint-opacity': '0.8',
    },
  },

  nightfall: {
    cssFiles: ['/src/styles/themes/nightfall-variables.css', '/src/styles/themes/nightfall.css'],
    variablesFile: '/src/styles/themes/nightfall-variables.css',
    rendererType: 'dom',
    animations: {
      useCSS: true,
      fallbackToJS: false,
      duration: 250,
    },
    performance: {
      willChange: ['transform', 'box-shadow'],
      contain: 'layout style',
      layerize: true,
    },
    customProperties: {
      '--accent-glow': '0 0 20px rgba(139, 92, 246, 0.4)',
      '--center-dot-glow': '0 0 12px rgba(139, 92, 246, 0.6)',
    },
  },

  'dawn-dusk': {
    cssFiles: ['/src/styles/themes/dawn-dusk-variables.css', '/src/styles/themes/dawn-dusk.css'],
    variablesFile: '/src/styles/themes/dawn-dusk-variables.css',
    rendererType: 'dom',
    animations: {
      useCSS: true,
      fallbackToJS: false,
      duration: 300,
    },
    performance: {
      willChange: ['transform', 'background'],
      contain: 'layout style',
      layerize: true,
    },
    customProperties: {
      '--dawn-gradient': 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fb7185 100%)',
      '--dusk-gradient': 'linear-gradient(225deg, #7c3aed 0%, #f97316 50%, #fbbf24 100%)',
    },
  },

  'hand-drawn': {
    cssFiles: ['/src/styles/themes/hand-drawn-variables.css', '/src/styles/themes/hand-drawn.css'],
    variablesFile: '/src/styles/themes/hand-drawn-variables.css',
    rendererType: 'svg',
    animations: {
      useCSS: true,
      fallbackToJS: true,
      duration: 400,
    },
    performance: {
      willChange: ['transform', 'filter'],
      contain: 'layout style',
      layerize: false,
    },
    customProperties: {
      '--sketch-roughness': '3.0',
      '--line-wobble': '0.8',
      '--paper-grain-opacity': '0.03',
    },
  },
};

/**
 * Get style configuration for a theme
 */
export function getThemeStyleConfig(themeName: string): ThemeStyleConfig | undefined {
  return THEME_STYLE_CONFIGS[themeName];
}

/**
 * Load CSS files for a theme
 */
export async function loadThemeStyles(themeName: string): Promise<void> {
  const config = getThemeStyleConfig(themeName);
  if (!config) {
    console.warn(`No style configuration found for theme: ${themeName}`);
    return;
  }

  // Load CSS files sequentially to maintain dependency order
  for (const cssFile of config.cssFiles) {
    await loadCSSFile(cssFile);
  }

  // Apply custom properties if specified
  if (config.customProperties) {
    applyCustomProperties(config.customProperties);
  }

  // Apply performance optimizations
  if (config.performance) {
    applyPerformanceOptimizations(config.performance);
  }
}

/**
 * Load a single CSS file
 */
async function loadCSSFile(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
    document.head.appendChild(link);
  });
}

/**
 * Apply custom CSS properties to the root element
 */
function applyCustomProperties(properties: Record<string, string>): void {
  const root = document.documentElement;
  for (const [property, value] of Object.entries(properties)) {
    root.style.setProperty(property, value);
  }
}

/**
 * Apply performance optimizations to relevant elements
 */
function applyPerformanceOptimizations(
  performance: NonNullable<ThemeStyleConfig['performance']>
): void {
  const root = document.documentElement;

  if (performance.willChange) {
    root.style.setProperty('--will-change', performance.willChange.join(', '));
  }

  if (performance.contain) {
    root.style.setProperty('--contain', performance.contain);
  }

  if (performance.layerize) {
    // Add transform3d to force layer creation on key elements
    const style = document.createElement('style');
    style.textContent = `
      .timer-container,
      .timer-display,
      .timer-progress-ring,
      .timer-hand {
        transform: translateZ(0);
      }
    `;
    document.head.appendChild(style);
  }
}
