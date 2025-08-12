/**
 * 计时器工厂测试
 * Timer factory tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TimerFactory } from '../factories/timer-factory';
import { ThemeManager } from '../services/theme-manager';

// Mock DOM environment
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  value: 1,
});

// Mock HTMLElement methods
HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({
  width: 256,
  height: 256,
  top: 0,
  left: 0,
  bottom: 256,
  right: 256,
  x: 0,
  y: 0,
  toJSON: () => {},
}));

describe('TimerFactory', () => {
  let factory: TimerFactory;
  let container: HTMLElement;
  let themeManager: ThemeManager;

  beforeEach(() => {
    // Create mock container
    container = document.createElement('div');
    container.style.width = '256px';
    container.style.height = '256px';
    document.body.appendChild(container);

    // Create theme manager and factory
    themeManager = new ThemeManager();
    factory = new TimerFactory(themeManager);
  });

  afterEach(() => {
    // Clean up
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    factory.destroy();
  });

  describe('createRenderer', () => {
    it('should create DOM renderer for cloudlight-minimal theme', () => {
      const renderer = factory.createRenderer(container);

      expect(renderer).toBeDefined();
      expect(renderer.getType()).toBe('dom');
      expect(renderer.isInitialized()).toBe(true);
    });

    it('should throw error for invalid container', () => {
      expect(() => {
        factory.createRenderer(null as unknown as HTMLElement);
      }).toThrow('Container element is required');
    });

    it('should cache renderer when cache key provided', () => {
      const cacheKey = 'test-renderer';
      const renderer1 = factory.createRenderer(container, cacheKey);
      const renderer2 = factory.createRenderer(container, cacheKey);

      expect(renderer1).toBe(renderer2);
    });
  });

  describe('switchTheme', () => {
    it('should switch theme successfully', async () => {
      const initialTheme = themeManager.getCurrentThemeName();

      await factory.switchTheme('nightfall', container);

      expect(themeManager.getCurrentThemeName()).toBe('nightfall');
      expect(themeManager.getCurrentThemeName()).not.toBe(initialTheme);
    });

    it('should throw error for non-existent theme', async () => {
      await expect(factory.switchTheme('non-existent-theme', container)).rejects.toThrow(
        'Theme "non-existent-theme" does not exist'
      );
    });

    it('should clean up old renderer when switching themes', async () => {
      const cacheKey = 'test-renderer';
      const renderer1 = factory.createRenderer(container, cacheKey);
      const destroySpy = vi.spyOn(renderer1, 'destroy');

      await factory.switchTheme('nightfall', container, cacheKey);

      expect(destroySpy).toHaveBeenCalled();
    });
  });

  describe('Canvas renderer creation', () => {
    it('should create canvas renderer for wabi-sabi theme', async () => {
      await factory.switchTheme('wabi-sabi', container);
      const renderer = factory.createRenderer(container);

      expect(renderer.getType()).toBe('canvas');
      expect(container.querySelector('canvas')).toBeTruthy();
    });

    it('should handle high DPI displays', async () => {
      // Mock high DPI
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 2,
      });

      await factory.switchTheme('wabi-sabi', container);
      const _renderer = factory.createRenderer(container);
      const canvas = container.querySelector('canvas') as HTMLCanvasElement;

      expect(canvas.width).toBe(512); // 256 * 2
      expect(canvas.height).toBe(512); // 256 * 2
    });
  });

  describe('clearCache', () => {
    it('should clear all cached renderers', () => {
      const renderer1 = factory.createRenderer(container, 'key1');
      const renderer2 = factory.createRenderer(container, 'key2');

      const destroySpy1 = vi.spyOn(renderer1, 'destroy');
      const destroySpy2 = vi.spyOn(renderer2, 'destroy');

      factory.clearCache();

      expect(destroySpy1).toHaveBeenCalled();
      expect(destroySpy2).toHaveBeenCalled();
    });
  });
});
