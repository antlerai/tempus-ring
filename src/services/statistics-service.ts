import { TimerState } from '../types/timer-types';
import { StorageService, type TimerStatistic } from './storage-service';

export interface DailyStatistics {
  date: string;
  completedPomodoros: number;
  totalWorkTime: number;
  totalBreakTime: number;
  totalSessions: number;
  efficiency: number;
}

export interface WeeklyStatistics {
  weekStart: string;
  weekEnd: string;
  totalPomodoros: number;
  totalWorkTime: number;
  totalBreakTime: number;
  averagePomodorosPerDay: number;
  dailyBreakdown: DailyStatistics[];
}

export interface MonthlyStatistics {
  month: string;
  year: number;
  totalPomodoros: number;
  totalWorkTime: number;
  totalBreakTime: number;
  completionRate: number;
  productiveHours: number;
  weeklyBreakdown: WeeklyStatistics[];
}

export interface StatisticsExport {
  exportDate: string;
  dateRange: {
    from: string;
    to: string;
  };
  summary: {
    totalPomodoros: number;
    totalWorkTime: number;
    totalBreakTime: number;
    totalSessions: number;
  };
  dailyStats: DailyStatistics[];
  completedSessions: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    duration: number;
    completed: boolean;
  }>;
}

export class StatisticsService {
  private static instance: StatisticsService;
  private storageService: StorageService;
  private currentSessionStart: Date | null = null;
  private currentSessionType: TimerState | null = null;

  private constructor() {
    this.storageService = StorageService.getInstance();
  }

  public static getInstance(): StatisticsService {
    if (!StatisticsService.instance) {
      StatisticsService.instance = new StatisticsService();
    }
    return StatisticsService.instance;
  }

  startSession(type: TimerState): void {
    this.currentSessionStart = new Date();
    this.currentSessionType = type;
  }

  async completeSession(type: TimerState, completed = true): Promise<void> {
    if (!this.currentSessionStart || !this.currentSessionType) {
      console.warn('No active session to complete');
      return;
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - this.currentSessionStart.getTime()) / 1000);
    const dateKey = this.currentSessionStart.toISOString().split('T')[0];

    if (!dateKey) {
      throw new Error('Invalid date format for session');
    }

    const existingStatistic = await this.getOrCreateDailyStatistic(dateKey);

    const sessionData = {
      startTime: this.currentSessionStart.toISOString(),
      endTime: endTime.toISOString(),
      type:
        type === TimerState.WORK
          ? ('work' as const)
          : type === TimerState.SHORT_BREAK
            ? ('short_break' as const)
            : ('long_break' as const),
      completed,
    };

    existingStatistic.sessions.push(sessionData);

    if (completed) {
      if (type === TimerState.WORK) {
        existingStatistic.completedPomodoros += 1;
        existingStatistic.totalWorkTime += duration;
      } else if (type === TimerState.SHORT_BREAK || type === TimerState.LONG_BREAK) {
        existingStatistic.totalBreakTime += duration;
      }
    }

    await this.storageService.saveStatistic(existingStatistic);

    this.currentSessionStart = null;
    this.currentSessionType = null;
  }

  async getDailyStatistics(date: string): Promise<DailyStatistics | null> {
    const statistics = await this.storageService.loadStatistics(date, date);

    if (statistics.length === 0) {
      return null;
    }

    const stat = statistics[0];
    if (!stat) {
      return null;
    }

    const totalSessions = stat.sessions.length;
    const completedSessions = stat.sessions.filter((s) => s.completed).length;
    const efficiency = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    return {
      date: stat.date,
      completedPomodoros: stat.completedPomodoros,
      totalWorkTime: stat.totalWorkTime,
      totalBreakTime: stat.totalBreakTime,
      totalSessions,
      efficiency,
    };
  }

  async getWeeklyStatistics(weekStart: Date): Promise<WeeklyStatistics> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const statistics = await this.storageService.loadStatistics(
      this.formatDate(weekStart),
      this.formatDate(weekEnd)
    );

    let totalPomodoros = 0;
    let totalWorkTime = 0;
    let totalBreakTime = 0;
    const dailyBreakdown: DailyStatistics[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      const dateKey = this.formatDate(currentDate);

      const dayStats = statistics.find((s) => s.date === dateKey);

      if (dayStats) {
        const totalSessions = dayStats.sessions.length;
        const completedSessions = dayStats.sessions.filter((s) => s.completed).length;
        const efficiency = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

        dailyBreakdown.push({
          date: dateKey,
          completedPomodoros: dayStats.completedPomodoros,
          totalWorkTime: dayStats.totalWorkTime,
          totalBreakTime: dayStats.totalBreakTime,
          totalSessions,
          efficiency,
        });

        totalPomodoros += dayStats.completedPomodoros;
        totalWorkTime += dayStats.totalWorkTime;
        totalBreakTime += dayStats.totalBreakTime;
      } else {
        dailyBreakdown.push({
          date: dateKey,
          completedPomodoros: 0,
          totalWorkTime: 0,
          totalBreakTime: 0,
          totalSessions: 0,
          efficiency: 0,
        });
      }
    }

    return {
      weekStart: this.formatDate(weekStart),
      weekEnd: this.formatDate(weekEnd),
      totalPomodoros,
      totalWorkTime,
      totalBreakTime,
      averagePomodorosPerDay: totalPomodoros / 7,
      dailyBreakdown,
    };
  }

  async getMonthlyStatistics(year: number, month: number): Promise<MonthlyStatistics> {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    const statistics = await this.storageService.loadStatistics(
      this.formatDate(monthStart),
      this.formatDate(monthEnd)
    );

    let totalPomodoros = 0;
    let totalWorkTime = 0;
    let totalBreakTime = 0;
    let totalSessions = 0;
    let completedSessions = 0;

    for (const stat of statistics) {
      totalPomodoros += stat.completedPomodoros;
      totalWorkTime += stat.totalWorkTime;
      totalBreakTime += stat.totalBreakTime;
      totalSessions += stat.sessions.length;
      completedSessions += stat.sessions.filter((s) => s.completed).length;
    }

    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const productiveHours = Math.round((totalWorkTime / 3600) * 100) / 100;

    const weeklyBreakdown: WeeklyStatistics[] = [];
    const firstWeekStart = this.getWeekStart(monthStart);
    // biome-ignore lint/style/useConst: variable is mutated with setDate()
    let currentWeekStart = new Date(firstWeekStart);

    while (currentWeekStart <= monthEnd) {
      const weekStats = await this.getWeeklyStatistics(currentWeekStart);

      if (this.isWeekInMonth(currentWeekStart, year, month)) {
        weeklyBreakdown.push(weekStats);
      }

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return {
      month: monthStart.toLocaleDateString('en-US', { month: 'long' }),
      year,
      totalPomodoros,
      totalWorkTime,
      totalBreakTime,
      completionRate,
      productiveHours,
      weeklyBreakdown,
    };
  }

  async getStatisticsRange(fromDate: string, toDate: string): Promise<DailyStatistics[]> {
    const statistics = await this.storageService.loadStatistics(fromDate, toDate);

    return statistics.map((stat) => {
      const totalSessions = stat.sessions.length;
      const completedSessions = stat.sessions.filter((s) => s.completed).length;
      const efficiency = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

      return {
        date: stat.date,
        completedPomodoros: stat.completedPomodoros,
        totalWorkTime: stat.totalWorkTime,
        totalBreakTime: stat.totalBreakTime,
        totalSessions,
        efficiency,
      };
    });
  }

  async exportStatistics(fromDate: string, toDate: string): Promise<StatisticsExport> {
    const statistics = await this.storageService.loadStatistics(fromDate, toDate);
    const dailyStats = await this.getStatisticsRange(fromDate, toDate);

    let totalPomodoros = 0;
    let totalWorkTime = 0;
    let totalBreakTime = 0;
    let totalSessions = 0;
    const completedSessions: StatisticsExport['completedSessions'] = [];

    for (const stat of statistics) {
      totalPomodoros += stat.completedPomodoros;
      totalWorkTime += stat.totalWorkTime;
      totalBreakTime += stat.totalBreakTime;
      totalSessions += stat.sessions.length;

      for (const session of stat.sessions) {
        if (session.completed) {
          const startTime = new Date(session.startTime);
          const endTime = new Date(session.endTime);
          const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

          completedSessions.push({
            id: `${stat.date}-${session.startTime}`,
            date: stat.date,
            startTime: session.startTime,
            endTime: session.endTime,
            type: session.type,
            duration,
            completed: session.completed,
          });
        }
      }
    }

    return {
      exportDate: new Date().toISOString(),
      dateRange: {
        from: fromDate,
        to: toDate,
      },
      summary: {
        totalPomodoros,
        totalWorkTime,
        totalBreakTime,
        totalSessions,
      },
      dailyStats,
      completedSessions,
    };
  }

  async getTotalStatistics(): Promise<{
    totalPomodoros: number;
    totalWorkTime: number;
    totalBreakTime: number;
    totalDays: number;
    averagePomodorosPerDay: number;
  }> {
    const allStatistics = await this.storageService.loadStatistics();

    let totalPomodoros = 0;
    let totalWorkTime = 0;
    let totalBreakTime = 0;
    const totalDays = allStatistics.length;

    for (const stat of allStatistics) {
      totalPomodoros += stat.completedPomodoros;
      totalWorkTime += stat.totalWorkTime;
      totalBreakTime += stat.totalBreakTime;
    }

    const averagePomodorosPerDay = totalDays > 0 ? totalPomodoros / totalDays : 0;

    return {
      totalPomodoros,
      totalWorkTime,
      totalBreakTime,
      totalDays,
      averagePomodorosPerDay,
    };
  }

  async clearAllStatistics(): Promise<void> {
    await this.storageService.clearStatistics();
  }

  private async getOrCreateDailyStatistic(dateKey: string): Promise<TimerStatistic> {
    const existing = await this.storageService.loadStatistics(dateKey, dateKey);

    if (existing.length > 0) {
      const stat = existing[0];
      if (stat) {
        return stat;
      }
    }

    return {
      id: `stat-${dateKey}`,
      date: dateKey,
      completedPomodoros: 0,
      totalWorkTime: 0,
      totalBreakTime: 0,
      sessions: [],
    };
  }

  private formatDate(date: Date): string {
    const result = date.toISOString().split('T')[0];
    if (!result) {
      throw new Error('Invalid date format');
    }
    return result;
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  private isWeekInMonth(weekStart: Date, year: number, month: number): boolean {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    return (
      (weekStart >= monthStart && weekStart <= monthEnd) ||
      (weekEnd >= monthStart && weekEnd <= monthEnd)
    );
  }
}
