export interface ThemeConfig {
  name: string;
  displayName: string;
  renderer: RendererType;
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
