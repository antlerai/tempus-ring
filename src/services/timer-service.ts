import type { TimerConfig, TimerData, TimerEvents, TimerSession } from '../types';
import { TimerState } from '../types';

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

const DEFAULT_CONFIG: TimerConfig = {
  workDuration: 1500, // 25 minutes
  shortBreakDuration: 300, // 5 minutes
  longBreakDuration: 900, // 15 minutes
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

export class TimerService extends EventEmitter<TimerEvents> {
  private config: TimerConfig = DEFAULT_CONFIG;
  private state: TimerState = TimerState.IDLE;
  private currentSession: TimerSession | undefined;
  private remainingTime = 0;
  private completedSessions = 0;
  private sessionsUntilLongBreak = 4;
  private intervalId: number | undefined;

  constructor(config?: Partial<TimerConfig>) {
    super();
    if (config) {
      this.config = { ...DEFAULT_CONFIG, ...config };
    }
    this.sessionsUntilLongBreak = this.config.sessionsUntilLongBreak;
  }

  public getConfig(): TimerConfig {
    return { ...this.config };
  }

  public updateConfig(config: Partial<TimerConfig>): void {
    this.config = { ...this.config, ...config };
    if (this.state === TimerState.IDLE) {
      this.sessionsUntilLongBreak = this.config.sessionsUntilLongBreak;
    }
  }

  public start(): void {
    if (this.state === TimerState.PAUSED) {
      this.resume();
      return;
    }

    if (this.state !== TimerState.IDLE) {
      return;
    }

    this.transitionTo(TimerState.WORK);
    this.remainingTime = this.config.workDuration;
    this.startSession(TimerState.WORK);
  }

  public pause(): void {
    if (
      this.state === TimerState.WORK ||
      this.state === TimerState.SHORT_BREAK ||
      this.state === TimerState.LONG_BREAK
    ) {
      this.transitionTo(TimerState.PAUSED);
      this.stopInterval();
      this.emit('timer:pause', undefined);
    }
  }

  public resume(): void {
    if (this.state === TimerState.PAUSED && this.currentSession) {
      this.transitionTo(this.currentSession.type);
      this.startInterval();
      this.emit('timer:resume', undefined);
    }
  }

  public reset(): void {
    this.stopInterval();
    this.completeCurrentSession(false);
    this.currentSession = undefined;
    this.transitionTo(TimerState.IDLE);
    this.remainingTime = 0;
    this.emit('timer:reset', undefined);
  }

  public getState(): TimerData {
    const currentSession = this.currentSession ? { ...this.currentSession } : undefined;
    return {
      state: this.state,
      currentSession,
      remainingTime: this.remainingTime,
      progress: this.calculateProgress(),
      completedSessions: this.completedSessions,
      sessionsUntilLongBreak: this.sessionsUntilLongBreak,
    };
  }

  private transitionTo(newState: TimerState): void {
    const oldState = this.state;
    this.state = newState;
    this.emit('timer:stateChange', { from: oldState, to: newState });
  }

  private startSession(type: TimerState): void {
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: new Date(),
      type,
      completed: false,
    };

    this.emit('timer:sessionStart', { ...this.currentSession });
    this.startInterval();
  }

  private completeCurrentSession(completed: boolean): void {
    if (this.currentSession) {
      this.currentSession.endTime = new Date();
      this.currentSession.completed = completed;

      if (completed) {
        this.emit('timer:sessionComplete', { ...this.currentSession });

        if (this.currentSession.type === TimerState.WORK) {
          this.completedSessions++;
          this.sessionsUntilLongBreak--;
        }
      }
    }
  }

  private startInterval(): void {
    this.stopInterval();
    this.intervalId = window.setInterval(() => {
      this.tick();
    }, 1000);
  }

  private stopInterval(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private tick(): void {
    this.remainingTime--;

    if (this.remainingTime <= 0) {
      this.handleSessionEnd();
      return;
    }

    this.emit('timer:tick', this.getState());
  }

  private handleSessionEnd(): void {
    this.stopInterval();
    this.completeCurrentSession(true);

    const currentType = this.state;

    if (currentType === TimerState.WORK) {
      if (this.sessionsUntilLongBreak <= 0) {
        this.startBreak(TimerState.LONG_BREAK);
        this.sessionsUntilLongBreak = this.config.sessionsUntilLongBreak;
      } else {
        this.startBreak(TimerState.SHORT_BREAK);
      }
    } else {
      this.startWork();
    }
  }

  private startBreak(breakType: TimerState): void {
    const duration =
      breakType === TimerState.SHORT_BREAK
        ? this.config.shortBreakDuration
        : this.config.longBreakDuration;

    if (this.config.autoStartBreaks) {
      this.remainingTime = duration;
      this.transitionTo(breakType);
      this.startSession(breakType);
    } else {
      this.remainingTime = 0;
      this.transitionTo(TimerState.IDLE);
    }
  }

  private startWork(): void {
    if (this.config.autoStartPomodoros) {
      this.remainingTime = this.config.workDuration;
      this.transitionTo(TimerState.WORK);
      this.startSession(TimerState.WORK);
    } else {
      this.remainingTime = 0;
      this.transitionTo(TimerState.IDLE);
    }
  }

  private calculateProgress(): number {
    if (this.state === TimerState.IDLE || !this.currentSession) {
      return 0;
    }

    const totalDuration = this.getTotalDurationForState(this.currentSession.type);
    return Math.max(0, Math.min(1, (totalDuration - this.remainingTime) / totalDuration));
  }

  private getTotalDurationForState(state: TimerState): number {
    switch (state) {
      case TimerState.WORK:
        return this.config.workDuration;
      case TimerState.SHORT_BREAK:
        return this.config.shortBreakDuration;
      case TimerState.LONG_BREAK:
        return this.config.longBreakDuration;
      default:
        return 0;
    }
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
