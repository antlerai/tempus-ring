import { invoke } from '@tauri-apps/api/core';

export interface UserPreferences {
  theme: string;
  language: string;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  volume: number;
}

export interface TimerStatistic {
  id: string;
  date: string;
  completedPomodoros: number;
  totalWorkTime: number;
  totalBreakTime: number;
  sessions: Array<{
    startTime: string;
    endTime: string;
    type: 'work' | 'short_break' | 'long_break';
    completed: boolean;
  }>;
}

export class StorageService {
  private static instance: StorageService;
  private defaultPreferences: UserPreferences = {
    theme: 'cloudlight',
    language: 'en',
    workDuration: 1500,
    shortBreakDuration: 300,
    longBreakDuration: 900,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    notificationsEnabled: true,
    volume: 0.7,
  };

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      await invoke('save_preferences', { preferences });
    } catch (error) {
      console.error('Failed to save preferences via Tauri:', error);
      localStorage.setItem('tempus_ring_preferences', JSON.stringify(preferences));
    }
  }

  async loadPreferences(): Promise<UserPreferences> {
    try {
      const preferences = await invoke<UserPreferences>('load_preferences');
      return { ...this.defaultPreferences, ...preferences };
    } catch (error) {
      console.warn('Failed to load preferences via Tauri, falling back to localStorage:', error);
      const stored = localStorage.getItem('tempus_ring_preferences');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return { ...this.defaultPreferences, ...parsed };
        } catch (parseError) {
          console.error('Failed to parse stored preferences:', parseError);
        }
      }
      return this.defaultPreferences;
    }
  }

  async saveStatistic(statistic: TimerStatistic): Promise<void> {
    try {
      await invoke('save_statistic', { statistic });
    } catch (error) {
      console.error('Failed to save statistic via Tauri:', error);
      const key = `tempus_ring_stat_${statistic.date}`;
      localStorage.setItem(key, JSON.stringify(statistic));
    }
  }

  async loadStatistics(fromDate?: string, toDate?: string): Promise<TimerStatistic[]> {
    try {
      const statistics = await invoke<TimerStatistic[]>('load_statistics', {
        fromDate,
        toDate,
      });
      return statistics;
    } catch (error) {
      console.warn('Failed to load statistics via Tauri, falling back to localStorage:', error);
      const stats: TimerStatistic[] = [];
      const keys = Object.keys(localStorage);

      for (const key of keys) {
        if (key.startsWith('tempus_ring_stat_')) {
          try {
            const stat = JSON.parse(localStorage.getItem(key) || '{}');
            if (this.isDateInRange(stat.date, fromDate, toDate)) {
              stats.push(stat);
            }
          } catch (parseError) {
            console.error(`Failed to parse statistic ${key}:`, parseError);
          }
        }
      }

      return stats.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  }

  async clearStatistics(): Promise<void> {
    try {
      await invoke('clear_statistics');
    } catch (error) {
      console.error('Failed to clear statistics via Tauri:', error);
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('tempus_ring_stat_')) {
          localStorage.removeItem(key);
        }
      }
    }
  }

  async exportData(): Promise<{ preferences: UserPreferences; statistics: TimerStatistic[] }> {
    const [preferences, statistics] = await Promise.all([
      this.loadPreferences(),
      this.loadStatistics(),
    ]);

    return {
      preferences,
      statistics,
    };
  }

  async importData(data: {
    preferences?: UserPreferences;
    statistics?: TimerStatistic[];
  }): Promise<void> {
    if (data.preferences) {
      await this.savePreferences(data.preferences);
    }

    if (data.statistics) {
      for (const statistic of data.statistics) {
        await this.saveStatistic(statistic);
      }
    }
  }

  private isDateInRange(date: string, fromDate?: string, toDate?: string): boolean {
    const checkDate = new Date(date);

    if (fromDate && checkDate < new Date(fromDate)) {
      return false;
    }

    if (toDate && checkDate > new Date(toDate)) {
      return false;
    }

    return true;
  }

  async getStorageSize(): Promise<{ tauriSize?: number; localStorageSize: number }> {
    let localStorageSize = 0;
    const keys = Object.keys(localStorage);

    for (const key of keys) {
      if (key.startsWith('tempus_ring_')) {
        const value = localStorage.getItem(key);
        if (value) {
          localStorageSize += new Blob([value]).size;
        }
      }
    }

    try {
      const tauriSize = await invoke<number>('get_storage_size');
      return { tauriSize, localStorageSize };
    } catch (_error) {
      return { localStorageSize };
    }
  }
}
