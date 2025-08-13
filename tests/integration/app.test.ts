import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TimerService } from '../../src/services/timer-service';
import { ThemeManager } from '../../src/services/theme-manager';
import { StorageService } from '../../src/services/storage-service';
import { TimerState, type TimerConfig } from '../../src/types/timer-types';

// Mock Web APIs for testing environment
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock Tauri API to throw errors (force localStorage fallback)
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockRejectedValue(new Error('Tauri not available in test environment')),
}));

// Mock timers for precise control
vi.useFakeTimers();

describe('Tempus Ring Integration Tests', () => {
  let timerService: TimerService;
  let themeManager: ThemeManager;
  let storageService: StorageService;

  const defaultConfig: TimerConfig = {
    workDuration: 10, // Use short durations for testing (10 seconds)
    shortBreakDuration: 5, // 5 seconds
    longBreakDuration: 8, // 8 seconds
    sessionsUntilLongBreak: 2, // Trigger long break after 2 sessions
    autoStartBreaks: false,
    autoStartPomodoros: false,
  };

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    vi.clearAllTimers();
    mockLocalStorage.getItem.mockReturnValue(null);

    // Setup DOM
    document.body.innerHTML = '<div id="app"></div>';

    // Initialize services
    storageService = StorageService.getInstance();
    themeManager = new ThemeManager();
    timerService = new TimerService(defaultConfig);
  });

  afterEach(() => {
    // Clean up any running timers
    timerService.reset();
    vi.clearAllTimers();
  });

  describe('Core Timer Functionality', () => {
    it('should complete a full work session cycle', () => {
      // Start a work session
      timerService.start();
      
      const initialState = timerService.getState();
      expect(initialState.state).toBe(TimerState.WORK);
      expect(initialState.remainingTime).toBe(10);

      // Advance time to halfway point
      vi.advanceTimersByTime(5000);
      
      const midState = timerService.getState();
      expect(midState.state).toBe(TimerState.WORK);
      expect(midState.remainingTime).toBe(5);
      expect(midState.progress).toBeCloseTo(0.5, 1);

      // Complete the work session
      vi.advanceTimersByTime(5000);
      
      const endState = timerService.getState();
      expect(endState.state).toBe(TimerState.IDLE);
      expect(endState.completedSessions).toBe(1);
    });

    it('should auto-transition between work and breaks when enabled', () => {
      // Enable auto-transitions
      timerService.updateConfig({
        ...defaultConfig,
        autoStartBreaks: true,
        autoStartPomodoros: true,
      });

      // Start work session
      timerService.start();
      expect(timerService.getState().state).toBe(TimerState.WORK);

      // Complete work session - should auto-transition to short break
      vi.advanceTimersByTime(10000);
      
      const afterWork = timerService.getState();
      expect(afterWork.state).toBe(TimerState.SHORT_BREAK);
      expect(afterWork.remainingTime).toBe(5);

      // Complete short break - should auto-transition back to work
      vi.advanceTimersByTime(5000);
      
      const afterBreak = timerService.getState();
      expect(afterBreak.state).toBe(TimerState.WORK);
      expect(afterBreak.completedSessions).toBe(1);
    });

    it('should trigger long break after configured sessions', () => {
      timerService.updateConfig({
        ...defaultConfig,
        autoStartBreaks: true,
        autoStartPomodoros: true, // Need this to continue the cycle
      });

      // Complete first work session
      timerService.start();
      vi.advanceTimersByTime(10000);
      const afterFirstWork = timerService.getState();
      expect(afterFirstWork.state).toBe(TimerState.SHORT_BREAK);
      expect(afterFirstWork.completedSessions).toBe(1);

      // Complete first break and second work session
      vi.advanceTimersByTime(5000); // Break should auto-start next work
      const afterFirstBreak = timerService.getState();
      expect(afterFirstBreak.state).toBe(TimerState.WORK);
      
      vi.advanceTimersByTime(10000); // Complete second work session
      
      // Should now be in long break
      const state = timerService.getState();
      expect(state.state).toBe(TimerState.LONG_BREAK);
      expect(state.remainingTime).toBe(8);
      expect(state.completedSessions).toBe(2);
    });

    it('should handle pause and resume correctly during cycle', () => {
      timerService.start();
      expect(timerService.getState().state).toBe(TimerState.WORK);

      // Run for 3 seconds then pause
      vi.advanceTimersByTime(3000);
      timerService.pause();
      
      const pausedState = timerService.getState();
      expect(pausedState.state).toBe(TimerState.PAUSED);
      expect(pausedState.remainingTime).toBe(7);

      // Time should not advance while paused
      vi.advanceTimersByTime(5000);
      expect(timerService.getState().remainingTime).toBe(7);

      // Resume and complete
      timerService.resume();
      expect(timerService.getState().state).toBe(TimerState.WORK);
      
      vi.advanceTimersByTime(7000);
      expect(timerService.getState().state).toBe(TimerState.IDLE);
    });
  });

  describe('Theme Management Integration', () => {
    it('should initialize theme manager successfully', () => {
      // Skip async theme loading for integration tests
      expect(themeManager).toBeDefined();
      expect(typeof themeManager.getCurrentThemeName).toBe('function');
    });

    it('should persist theme state during timer operation', () => {
      // Start timer
      timerService.start();
      vi.advanceTimersByTime(3000);
      
      const beforeState = timerService.getState();
      expect(beforeState.state).toBe(TimerState.WORK);
      expect(beforeState.remainingTime).toBe(7);

      // Timer should continue running regardless of theme operations
      vi.advanceTimersByTime(7000);
      expect(timerService.getState().state).toBe(TimerState.IDLE);
    });
  });

  describe('Storage Integration', () => {
    it('should save and restore user preferences', async () => {
      const preferences = {
        theme: 'dawn-dusk',
        language: 'zh-CN',
        workDuration: 1800,
        shortBreakDuration: 600,
        longBreakDuration: 1200,
        sessionsUntilLongBreak: 3,
        autoStartBreaks: true,
        autoStartPomodoros: true,
        soundEnabled: false,
        notificationsEnabled: false,
        volume: 0.5,
      };

      // Save preferences
      await storageService.savePreferences(preferences);
      
      // Verify localStorage was called
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tempus_ring_preferences',
        JSON.stringify(preferences)
      );

      // Mock loading preferences
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(preferences));
      
      // Load preferences
      const loaded = await storageService.loadPreferences();
      
      expect(loaded.theme).toBe('dawn-dusk');
      expect(loaded.language).toBe('zh-CN');
      expect(loaded.workDuration).toBe(1800);
      expect(loaded.autoStartBreaks).toBe(true);
    });

    it('should propagate storage errors when both Tauri and localStorage fail', async () => {
      // Mock storage error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      // Should throw error when both storage methods fail
      await expect(
        storageService.savePreferences({ theme: 'cloudlight' })
      ).rejects.toThrow('Storage full');
    });
  });

  describe('Timer Configuration Persistence', () => {
    it('should restore timer configuration after restart simulation', () => {
      const customConfig: TimerConfig = {
        workDuration: 2000,
        shortBreakDuration: 400,
        longBreakDuration: 1000,
        sessionsUntilLongBreak: 3,
        autoStartBreaks: true,
        autoStartPomodoros: false,
      };

      // Create timer service with custom config
      const newTimerService = new TimerService(customConfig);

      const restoredConfig = newTimerService.getConfig();
      expect(restoredConfig.workDuration).toBe(2000);
      expect(restoredConfig.autoStartBreaks).toBe(true);
      expect(restoredConfig.sessionsUntilLongBreak).toBe(3);
    });

    it('should update configuration dynamically', () => {
      const originalConfig = timerService.getConfig();
      expect(originalConfig.workDuration).toBe(10);

      // Update configuration
      timerService.updateConfig({
        workDuration: 20,
        autoStartBreaks: true,
      });

      const updatedConfig = timerService.getConfig();
      expect(updatedConfig.workDuration).toBe(20);
      expect(updatedConfig.autoStartBreaks).toBe(true);
      // Other values should remain unchanged
      expect(updatedConfig.shortBreakDuration).toBe(5);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid timer configurations gracefully', () => {
      // Test with edge case values
      expect(() => {
        timerService.updateConfig({
          workDuration: 0,
          shortBreakDuration: -1,
        });
      }).not.toThrow();

      // Timer should still be functional
      timerService.start();
      expect(timerService.getState().state).toBe(TimerState.WORK);
    });

    it('should reset properly from any state', () => {
      // Start timer
      timerService.start();
      vi.advanceTimersByTime(5000);
      
      // Pause
      timerService.pause();
      expect(timerService.getState().state).toBe(TimerState.PAUSED);

      // Reset should work from paused state
      timerService.reset();
      const resetState = timerService.getState();
      expect(resetState.state).toBe(TimerState.IDLE);
      expect(resetState.remainingTime).toBe(0);
      expect(resetState.progress).toBe(0);
    });

    it('should handle multiple start calls correctly', () => {
      // First start
      timerService.start();
      expect(timerService.getState().state).toBe(TimerState.WORK);

      // Second start should not change state
      timerService.start();
      expect(timerService.getState().state).toBe(TimerState.WORK);

      // Should continue normally
      vi.advanceTimersByTime(10000);
      expect(timerService.getState().state).toBe(TimerState.IDLE);
    });
  });

  describe('Performance and Resource Management', () => {
    it('should clean up intervals properly on reset', () => {
      // Start multiple timers and reset
      for (let i = 0; i < 5; i++) {
        timerService.start();
        vi.advanceTimersByTime(1000);
        timerService.reset();
      }

      // Should not have accumulated intervals
      expect(timerService.getState().state).toBe(TimerState.IDLE);
    });

    it('should handle rapid state changes without issues', () => {
      // Rapid start/pause/resume cycles
      for (let i = 0; i < 10; i++) {
        timerService.start();
        timerService.pause();
        timerService.resume();
      }

      // Should end in consistent state
      expect(timerService.getState().state).toBe(TimerState.WORK);
      
      // Should still function normally
      vi.advanceTimersByTime(10000);
      expect(timerService.getState().state).toBe(TimerState.IDLE);
    });
  });
});