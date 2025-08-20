export interface ThemeStyleConfig {
  /** CSS files required for this theme */
  cssFiles: string[];
  /** CSS variable definitions file */
  variablesFile: string;
  /** Additional CSS modules for specific features */
  modules?: {
    animations?: string;
    effects?: string;
  };
  /** CSS custom properties that can be overridden */
  customProperties?: Record<string, string>;
  /** Renderer type that determines the appropriate styling approach */
  rendererType: RendererType;
  /** Animation preferences */
  animations: {
    useCSS: boolean; // Prefer CSS animations over JS
    fallbackToJS: boolean; // Allow fallback to JS if CSS fails
    duration: number; // Default animation duration
  };
  /** Performance optimizations */
  performance?: {
    willChange?: string[]; // Properties that will change
    contain?: string; // CSS containment
    layerize?: boolean; // Force layer creation
  };
}

export interface ThemeConfig {
  name: string;
  displayName: string;
  renderer: RendererType;
  layoutMode?: 'standard' | 'minimal';
  /** Style configuration for this theme */
  styles?: ThemeStyleConfig;
  controlPanel?: {
    buttonLayout: 'standard' | 'minimal';
    showLabels: boolean;
    showIcons: boolean;
  };
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  effects?: {
    roughness?: number;
    strokeWidth?: number;
    fillStyle?: string;
    hachureGap?: number;
    hachureAngle?: number;
  };
}

export interface ThemeDefinition {
  config: ThemeConfig;
  cssVariables: Record<string, string>;
  styleSheet?: string;
}

export type RendererType = 'dom' | 'svg' | 'canvas';

export const THEME_NAMES = {
  WABISABI: 'wabisabi',
  CLOUDLIGHT: 'cloudlight',
  DAWN_DUSK: 'dawn-dusk',
  NIGHTFALL: 'nightfall',
  ARTISTIC: 'artistic',
  HAND_DRAWN: 'hand-drawn',
} as const;

export type ThemeName = (typeof THEME_NAMES)[keyof typeof THEME_NAMES];

export interface ThemeManagerEvents extends Record<string, unknown> {
  'theme:changed': { from: string; to: string };
  'theme:loaded': { theme: string };
  'theme:error': { theme: string; error: string };
}
