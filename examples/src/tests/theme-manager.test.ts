/**
 * 主题管理器测试
 * Theme manager tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeManager } from '../services/theme-manager';

// Mock DOM methods
const mockCreateElement = vi.fn();
const mockQuerySelector = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
});

Object.defineProperty(document, 'querySelector', {
  value: mockQuerySelector,
});

Object.defineProperty(document.head, 'appendChild', {
  value: mockAppendChild,
});

Object.defineProperty(document.head, 'removeChild', {
  value: mockRemoveChild,
});

describe('ThemeManager', () => {
  let themeManager: ThemeManager;
  let mockLink: HTMLLinkElement;

  beforeEach(() => {
    themeManager = new ThemeManager();

    // Mock link element
    mockLink = {
      rel: '',
      href: '',
      onload: null,
      onerror: null,
    } as HTMLLinkElement;

    mockCreateElement.mockReturnValue(mockLink);
    mockQuerySelector.mockReturnValue(mockLink);

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    themeManager.destroy();
  });

  describe('getCurrentTheme', () => {
    it('should return default theme configuration', () => {
      const theme = themeManager.getCurrentTheme();

      expect(theme).toBeDefined();
      expect(theme.name).toBe('cloudlight-minimal');
      expect(theme.rendererType).toBe('dom');
    });
  });

  describe('getAvailableThemes', () => {
    it('should return all available themes', () => {
      const themes = themeManager.getAvailableThemes();

      expect(themes).toHaveLength(6);
      expect(themes.map((t) => t.name)).toContain('cloudlight-minimal');
      expect(themes.map((t) => t.name)).toContain('nightfall');
      expect(themes.map((t) => t.name)).toContain('wabi-sabi');
    });
  });

  describe('hasTheme', () => {
    it('should return true for existing themes', () => {
      expect(themeManager.hasTheme('cloudlight-minimal')).toBe(true);
      expect(themeManager.hasTheme('nightfall')).toBe(true);
      expect(themeManager.hasTheme('wabi-sabi')).toBe(true);
    });

    it('should return false for non-existing themes', () => {
      expect(themeManager.hasTheme('non-existent')).toBe(false);
      expect(themeManager.hasTheme('')).toBe(false);
    });
  });

  describe('switchTheme', () => {
    it('should switch theme successfully', async () => {
      // Mock successful CSS loading
      mockCreateElement.mockImplementation(() => {
        const link = { ...mockLink };
        setTimeout(() => link.onload?.(), 0);
        return link;
      });

      await themeManager.switchTheme('nightfall');

      expect(themeManager.getCurrentThemeName()).toBe('nightfall');
      expect(mockCreateElement).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
    });

    it('should throw error for non-existent theme', async () => {
      await expect(themeManager.switchTheme('non-existent')).rejects.toThrow(
        'Theme "non-existent" not found'
      );
    });

    it('should handle CSS loading errors gracefully', async () => {
      // Mock CSS loading error
      mockCreateElement.mockImplementation(() => {
        const link = { ...mockLink };
        setTimeout(() => link.onerror?.(), 0);
        return link;
      });

      await expect(themeManager.switchTheme('nightfall')).rejects.toThrow();
    });
  });

  describe('getCanvasConfig', () => {
    it('should return canvas config for canvas themes', () => {
      const config = themeManager.getCanvasConfig('wabi-sabi');

      expect(config).toBeDefined();
      expect(config?.colors.primary).toBe('#374151');
      expect(config?.sizes.ringWidth).toBe(3);
      expect(config?.effects?.roughness).toBe(1.5);
    });

    it('should return undefined for non-canvas themes', () => {
      const config = themeManager.getCanvasConfig('cloudlight-minimal');

      expect(config).toBeUndefined();
    });
  });

  describe('theme change listeners', () => {
    it('should notify listeners on theme change', async () => {
      const listener = vi.fn();
      themeManager.addThemeChangeListener(listener);

      // Mock successful CSS loading
      mockCreateElement.mockImplementation(() => {
        const link = { ...mockLink };
        setTimeout(() => link.onload?.(), 0);
        return link;
      });

      await themeManager.switchTheme('nightfall');

      expect(listener).toHaveBeenCalledWith('nightfall');
    });

    it('should remove listeners correctly', async () => {
      const listener = vi.fn();
      themeManager.addThemeChangeListener(listener);
      themeManager.removeThemeChangeListener(listener);

      // Mock successful CSS loading
      mockCreateElement.mockImplementation(() => {
        const link = { ...mockLink };
        setTimeout(() => link.onload?.(), 0);
        return link;
      });

      await themeManager.switchTheme('nightfall');

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
