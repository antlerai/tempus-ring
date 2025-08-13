import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TimerService } from '../src/services/timer-service';
import { TimerState } from '../src/types';
import type { TimerConfig } from '../src/types';

// Mock timers
vi.useFakeTimers();

describe('TimerService', () => {
  let timerService: TimerService;
  const defaultConfig: TimerConfig = {
    workDuration: 1500,
    shortBreakDuration: 300,
    longBreakDuration: 900,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
  };

  beforeEach(() => {
    timerService = new TimerService(defaultConfig);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should initialize with IDLE state', () => {
      const state = timerService.getState();
      expect(state.state).toBe(TimerState.IDLE);
      expect(state.remainingTime).toBe(0);
      expect(state.progress).toBe(0);
      expect(state.completedSessions).toBe(0);
      expect(state.currentSession).toBeUndefined();
    });

    it('should use default config when none provided', () => {
      const defaultTimerService = new TimerService();
      const config = defaultTimerService.getConfig();
      expect(config.workDuration).toBe(1500);
      expect(config.shortBreakDuration).toBe(300);
    });

    it('should merge provided config with defaults', () => {
      const customConfig = { workDuration: 2000 };
      const customTimerService = new TimerService(customConfig);
      const config = customTimerService.getConfig();
      expect(config.workDuration).toBe(2000);
      expect(config.shortBreakDuration).toBe(300);
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      timerService.updateConfig({ workDuration: 2000 });
      const config = timerService.getConfig();
      expect(config.workDuration).toBe(2000);
    });

    it('should reset sessions until long break when config updated in IDLE', () => {
      timerService.updateConfig({ sessionsUntilLongBreak: 6 });
      const state = timerService.getState();
      expect(state.sessionsUntilLongBreak).toBe(6);
    });
  });

  describe('State Transitions', () => {
    it('should transition from IDLE to WORK when started', () => {
      const stateChanges: Array<{ from: TimerState; to: TimerState }> = [];
      timerService.on('timer:stateChange', (change) => stateChanges.push(change));

      timerService.start();
      const state = timerService.getState();

      expect(state.state).toBe(TimerState.WORK);
      expect(state.remainingTime).toBe(1500);
      expect(stateChanges).toHaveLength(1);
      expect(stateChanges[0]).toEqual({ from: TimerState.IDLE, to: TimerState.WORK });
    });

    it('should create new session when starting work', () => {
      const sessions: Array<any> = [];
      timerService.on('timer:sessionStart', (session) => sessions.push(session));

      timerService.start();
      const state = timerService.getState();

      expect(sessions).toHaveLength(1);
      expect(sessions[0].type).toBe(TimerState.WORK);
      expect(state.currentSession).toBeDefined();
      expect(state.currentSession!.type).toBe(TimerState.WORK);
    });

    it('should pause running timer', () => {
      timerService.start();
      timerService.pause();
      const state = timerService.getState();

      expect(state.state).toBe(TimerState.PAUSED);
    });

    it('should resume paused timer', () => {
      timerService.start();
      timerService.pause();
      timerService.resume();
      const state = timerService.getState();

      expect(state.state).toBe(TimerState.WORK);
    });

    it('should reset timer to IDLE', () => {
      timerService.start();
      timerService.reset();
      const state = timerService.getState();

      expect(state.state).toBe(TimerState.IDLE);
      expect(state.remainingTime).toBe(0);
      expect(state.currentSession).toBeUndefined();
    });

    it('should resume paused timer when start is called on paused state', () => {
      timerService.start();
      timerService.pause();
      
      const resumeEvents: Array<any> = [];
      timerService.on('timer:resume', () => resumeEvents.push(true));
      
      timerService.start();
      expect(resumeEvents).toHaveLength(1);
    });
  });

  describe('Timer Tick Logic', () => {
    it('should countdown time and emit tick events', () => {
      const ticks: Array<any> = [];
      timerService.on('timer:tick', (data) => ticks.push(data));

      timerService.start();
      vi.advanceTimersByTime(3000); // 3 seconds

      const state = timerService.getState();
      expect(state.remainingTime).toBe(1497); // 1500 - 3
      expect(ticks).toHaveLength(3);
    });

    it('should calculate progress correctly', () => {
      timerService.start();
      vi.advanceTimersByTime(150000); // 150 seconds (10% of 1500)

      const state = timerService.getState();
      expect(state.progress).toBeCloseTo(0.1, 2);
    });

    it('should not tick when paused', () => {
      timerService.start();
      timerService.pause();
      
      const initialTime = timerService.getState().remainingTime;
      vi.advanceTimersByTime(5000);
      
      const state = timerService.getState();
      expect(state.remainingTime).toBe(initialTime);
    });
  });

  describe('Session Completion', () => {
    it('should complete work session and transition to idle by default', () => {
      const completedSessions: Array<any> = [];
      timerService.on('timer:sessionComplete', (session) => completedSessions.push(session));

      timerService.start();
      vi.advanceTimersByTime(1500000); // Complete work session

      const state = timerService.getState();
      expect(completedSessions).toHaveLength(1);
      expect(completedSessions[0].type).toBe(TimerState.WORK);
      expect(completedSessions[0].completed).toBe(true);
      expect(state.completedSessions).toBe(1);
      expect(state.state).toBe(TimerState.IDLE);
      expect(state.sessionsUntilLongBreak).toBe(3);
    });

    it('should auto-start short break when configured', () => {
      timerService.updateConfig({ autoStartBreaks: true });
      timerService.start();
      vi.advanceTimersByTime(1500000); // Complete work session

      const state = timerService.getState();
      expect(state.state).toBe(TimerState.SHORT_BREAK);
      expect(state.remainingTime).toBe(300);
    });

    it('should transition to long break after configured number of sessions', () => {
      timerService.updateConfig({ autoStartBreaks: true, autoStartPomodoros: true, sessionsUntilLongBreak: 2 });
      
      // Complete first work session
      timerService.start();
      vi.advanceTimersByTime(1500000);
      
      // Complete first break
      vi.advanceTimersByTime(300000);
      
      // Complete second work session (auto-started)
      vi.advanceTimersByTime(1500000);
      
      const state = timerService.getState();
      expect(state.state).toBe(TimerState.LONG_BREAK);
      expect(state.remainingTime).toBe(900);
    });

    it('should auto-start next work session after break when configured', () => {
      timerService.updateConfig({ autoStartBreaks: true, autoStartPomodoros: true });
      
      timerService.start();
      vi.advanceTimersByTime(1500000); // Complete work
      vi.advanceTimersByTime(300000);  // Complete short break

      const state = timerService.getState();
      expect(state.state).toBe(TimerState.WORK);
      expect(state.remainingTime).toBe(1500);
    });

    it('should reset sessions until long break after long break', () => {
      timerService.updateConfig({ autoStartBreaks: true, sessionsUntilLongBreak: 1 });
      
      // Complete work session to trigger long break
      timerService.start();
      vi.advanceTimersByTime(1500000);
      
      // Complete long break
      vi.advanceTimersByTime(900000);
      
      const state = timerService.getState();
      expect(state.sessionsUntilLongBreak).toBe(1); // Reset to original config value
    });
  });

  describe('Event Emission', () => {
    it('should emit pause event', () => {
      const pauseEvents: Array<any> = [];
      timerService.on('timer:pause', () => pauseEvents.push(true));

      timerService.start();
      timerService.pause();

      expect(pauseEvents).toHaveLength(1);
    });

    it('should emit resume event', () => {
      const resumeEvents: Array<any> = [];
      timerService.on('timer:resume', () => resumeEvents.push(true));

      timerService.start();
      timerService.pause();
      timerService.resume();

      expect(resumeEvents).toHaveLength(1);
    });

    it('should emit reset event', () => {
      const resetEvents: Array<any> = [];
      timerService.on('timer:reset', () => resetEvents.push(true));

      timerService.start();
      timerService.reset();

      expect(resetEvents).toHaveLength(1);
    });

    it('should remove event listeners with off method', () => {
      const ticks: Array<any> = [];
      const callback = (data: any) => ticks.push(data);
      
      timerService.on('timer:tick', callback);
      timerService.off('timer:tick', callback);
      
      timerService.start();
      vi.advanceTimersByTime(2000);
      
      expect(ticks).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should not start if already running', () => {
      timerService.start();
      const initialState = timerService.getState();
      
      timerService.start(); // Try to start again
      const finalState = timerService.getState();
      
      expect(finalState.currentSession?.id).toBe(initialState.currentSession?.id);
    });

    it('should not pause if not running', () => {
      const pauseEvents: Array<any> = [];
      timerService.on('timer:pause', () => pauseEvents.push(true));

      timerService.pause();
      expect(pauseEvents).toHaveLength(0);
    });

    it('should not resume if not paused', () => {
      const resumeEvents: Array<any> = [];
      timerService.on('timer:resume', () => resumeEvents.push(true));

      timerService.resume();
      expect(resumeEvents).toHaveLength(0);
    });

    it('should generate unique session IDs', () => {
      const sessionIds = new Set<string>();
      
      for (let i = 0; i < 10; i++) {
        timerService.start();
        const session = timerService.getState().currentSession;
        if (session) {
          sessionIds.add(session.id);
        }
        timerService.reset();
      }
      
      expect(sessionIds.size).toBe(10);
    });

    it('should handle incomplete sessions on reset', () => {
      const completedSessions: Array<any> = [];
      timerService.on('timer:sessionComplete', (session) => completedSessions.push(session));

      timerService.start();
      vi.advanceTimersByTime(500000); // Partial completion
      timerService.reset();

      expect(completedSessions).toHaveLength(0); // Should not emit completion for reset
    });
  });
});