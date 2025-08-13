export enum TimerState {
  IDLE = 'idle',
  WORK = 'work',
  SHORT_BREAK = 'short_break',
  LONG_BREAK = 'long_break',
  PAUSED = 'paused',
}

export interface TimerConfig {
  workDuration: number; // seconds (default: 1500 = 25min)
  shortBreakDuration: number; // seconds (default: 300 = 5min)
  longBreakDuration: number; // seconds (default: 900 = 15min)
  sessionsUntilLongBreak: number; // default: 4
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface TimerSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  type: TimerState;
  completed: boolean;
}

export interface TimerData {
  state: TimerState;
  currentSession?: TimerSession;
  remainingTime: number;
  progress: number;
  completedSessions: number;
  sessionsUntilLongBreak: number;
}

export type TimerEvents = {
  'timer:tick': TimerData;
  'timer:stateChange': { from: TimerState; to: TimerState };
  'timer:sessionComplete': TimerSession;
  'timer:sessionStart': TimerSession;
  'timer:pause': undefined;
  'timer:resume': undefined;
  'timer:reset': undefined;
};
