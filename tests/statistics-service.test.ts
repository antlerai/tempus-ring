import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TimerState } from '../src/types/timer-types';

// Create mock storage service instance
const mockStorageService = {
  saveStatistic: vi.fn(),
  loadStatistics: vi.fn(),
  clearStatistics: vi.fn(),
};

// Mock the storage service before importing StatisticsService
vi.mock('../src/services/storage-service', () => ({
  StorageService: {
    getInstance: vi.fn(() => mockStorageService),
  },
}));

// Import after mocking to ensure the mock is applied
const { StatisticsService } = await import('../src/services/statistics-service');

// Define TimerStatistic interface for tests
interface TimerStatistic {
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

describe('StatisticsService', () => {
  let statisticsService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the singleton
    (StatisticsService as any).instance = undefined;
    statisticsService = StatisticsService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = StatisticsService.getInstance();
      const instance2 = StatisticsService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Session Tracking', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should start a work session', () => {
      const startTime = new Date('2025-01-15T10:00:00Z');
      vi.setSystemTime(startTime);

      statisticsService.startSession(TimerState.WORK);
      
      // Access private properties for testing
      const service = statisticsService as any;
      expect(service.currentSessionStart).toEqual(startTime);
      expect(service.currentSessionType).toBe(TimerState.WORK);
    });

    it('should complete a work session successfully', async () => {
      const startTime = new Date('2025-01-15T10:00:00Z');
      const endTime = new Date('2025-01-15T10:25:00Z'); // 25 minutes later
      
      vi.setSystemTime(startTime);
      statisticsService.startSession(TimerState.WORK);
      
      vi.setSystemTime(endTime);
      
      // Mock existing statistic
      const existingStatistic: TimerStatistic = {
        id: 'stat-2025-01-15',
        date: '2025-01-15',
        completedPomodoros: 0,
        totalWorkTime: 0,
        totalBreakTime: 0,
        sessions: [],
      };
      
      mockStorageService.loadStatistics.mockResolvedValue([existingStatistic]);
      
      await statisticsService.completeSession(TimerState.WORK, true);
      
      expect(mockStorageService.saveStatistic).toHaveBeenCalledWith({
        id: 'stat-2025-01-15',
        date: '2025-01-15',
        completedPomodoros: 1,
        totalWorkTime: 1500, // 25 minutes in seconds
        totalBreakTime: 0,
        sessions: [
          {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            type: 'work',
            completed: true,
          },
        ],
      });
    });

    it('should complete a break session successfully', async () => {
      const startTime = new Date('2025-01-15T10:30:00Z');
      const endTime = new Date('2025-01-15T10:35:00Z'); // 5 minutes later
      
      vi.setSystemTime(startTime);
      statisticsService.startSession(TimerState.SHORT_BREAK);
      
      vi.setSystemTime(endTime);
      
      const existingStatistic: TimerStatistic = {
        id: 'stat-2025-01-15',
        date: '2025-01-15',
        completedPomodoros: 1,
        totalWorkTime: 1500,
        totalBreakTime: 0,
        sessions: [],
      };
      
      mockStorageService.loadStatistics.mockResolvedValue([existingStatistic]);
      
      await statisticsService.completeSession(TimerState.SHORT_BREAK, true);
      
      expect(mockStorageService.saveStatistic).toHaveBeenCalledWith({
        id: 'stat-2025-01-15',
        date: '2025-01-15',
        completedPomodoros: 1,
        totalWorkTime: 1500,
        totalBreakTime: 300, // 5 minutes in seconds
        sessions: [
          {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            type: 'short_break',
            completed: true,
          },
        ],
      });
    });

    it('should handle incomplete sessions', async () => {
      const startTime = new Date('2025-01-15T10:00:00Z');
      const endTime = new Date('2025-01-15T10:10:00Z'); // Interrupted after 10 minutes
      
      vi.setSystemTime(startTime);
      statisticsService.startSession(TimerState.WORK);
      
      vi.setSystemTime(endTime);
      
      const existingStatistic: TimerStatistic = {
        id: 'stat-2025-01-15',
        date: '2025-01-15',
        completedPomodoros: 0,
        totalWorkTime: 0,
        totalBreakTime: 0,
        sessions: [],
      };
      
      mockStorageService.loadStatistics.mockResolvedValue([existingStatistic]);
      
      await statisticsService.completeSession(TimerState.WORK, false);
      
      const savedStatistic = mockStorageService.saveStatistic.mock.calls[0][0];
      expect(savedStatistic.completedPomodoros).toBe(0); // Not incremented for incomplete session
      expect(savedStatistic.totalWorkTime).toBe(0); // No time added for incomplete session
      expect(savedStatistic.sessions[0].completed).toBe(false);
    });

    it('should warn when completing session without starting', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      await statisticsService.completeSession(TimerState.WORK, true);
      
      expect(consoleSpy).toHaveBeenCalledWith('No active session to complete');
      expect(mockStorageService.saveStatistic).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Daily Statistics', () => {
    it('should return null for non-existent date', async () => {
      mockStorageService.loadStatistics.mockResolvedValue([]);
      
      const result = await statisticsService.getDailyStatistics('2025-01-15');
      
      expect(result).toBeNull();
      expect(mockStorageService.loadStatistics).toHaveBeenCalledWith('2025-01-15', '2025-01-15');
    });

    it('should return daily statistics with efficiency calculation', async () => {
      const mockStatistic: TimerStatistic = {
        id: 'stat-2025-01-15',
        date: '2025-01-15',
        completedPomodoros: 3,
        totalWorkTime: 4500, // 75 minutes
        totalBreakTime: 900, // 15 minutes
        sessions: [
          {
            startTime: '2025-01-15T10:00:00Z',
            endTime: '2025-01-15T10:25:00Z',
            type: 'work',
            completed: true,
          },
          {
            startTime: '2025-01-15T10:30:00Z',
            endTime: '2025-01-15T10:35:00Z',
            type: 'short_break',
            completed: true,
          },
          {
            startTime: '2025-01-15T11:00:00Z',
            endTime: '2025-01-15T11:15:00Z',
            type: 'work',
            completed: false,
          },
        ],
      };
      
      mockStorageService.loadStatistics.mockResolvedValue([mockStatistic]);
      
      const result = await statisticsService.getDailyStatistics('2025-01-15');
      
      expect(result).toEqual({
        date: '2025-01-15',
        completedPomodoros: 3,
        totalWorkTime: 4500,
        totalBreakTime: 900,
        totalSessions: 3,
        efficiency: 66.66666666666666, // 2 completed out of 3 sessions
      });
    });
  });

  describe('Weekly Statistics', () => {
    it('should calculate weekly statistics correctly', async () => {
      const weekStart = new Date('2025-01-13'); // Monday
      
      // Mock statistics for the week
      const mockStatistics: TimerStatistic[] = [
        {
          id: 'stat-2025-01-13',
          date: '2025-01-13',
          completedPomodoros: 4,
          totalWorkTime: 6000,
          totalBreakTime: 900,
          sessions: [
            { startTime: '2025-01-13T10:00:00Z', endTime: '2025-01-13T10:25:00Z', type: 'work', completed: true },
            { startTime: '2025-01-13T10:30:00Z', endTime: '2025-01-13T10:35:00Z', type: 'short_break', completed: true },
          ],
        },
        {
          id: 'stat-2025-01-14',
          date: '2025-01-14',
          completedPomodoros: 2,
          totalWorkTime: 3000,
          totalBreakTime: 600,
          sessions: [
            { startTime: '2025-01-14T14:00:00Z', endTime: '2025-01-14T14:25:00Z', type: 'work', completed: true },
          ],
        },
      ];
      
      mockStorageService.loadStatistics.mockResolvedValue(mockStatistics);
      
      const result = await statisticsService.getWeeklyStatistics(weekStart);
      
      expect(result.weekStart).toBe('2025-01-13');
      expect(result.weekEnd).toBe('2025-01-19');
      expect(result.totalPomodoros).toBe(6);
      expect(result.totalWorkTime).toBe(9000);
      expect(result.totalBreakTime).toBe(1500);
      expect(result.averagePomodorosPerDay).toBe(6 / 7);
      expect(result.dailyBreakdown).toHaveLength(7);
    });
  });

  describe('Monthly Statistics', () => {
    it('should calculate monthly statistics correctly', async () => {
      const mockStatistics: TimerStatistic[] = [
        {
          id: 'stat-2025-01-01',
          date: '2025-01-01',
          completedPomodoros: 5,
          totalWorkTime: 7500,
          totalBreakTime: 1200,
          sessions: [
            { startTime: '2025-01-01T10:00:00Z', endTime: '2025-01-01T10:25:00Z', type: 'work', completed: true },
            { startTime: '2025-01-01T11:00:00Z', endTime: '2025-01-01T11:15:00Z', type: 'work', completed: false },
          ],
        },
      ];
      
      mockStorageService.loadStatistics.mockResolvedValue(mockStatistics);
      
      const result = await statisticsService.getMonthlyStatistics(2025, 1);
      
      expect(result.month).toBe('January');
      expect(result.year).toBe(2025);
      expect(result.totalPomodoros).toBe(5);
      expect(result.totalWorkTime).toBe(7500);
      expect(result.totalBreakTime).toBe(1200);
      expect(result.completionRate).toBe(50); // 1 completed out of 2 sessions
      expect(result.productiveHours).toBe(2.08); // 7500 seconds / 3600
    });
  });

  describe('Statistics Export', () => {
    it('should export statistics with correct format', async () => {
      const mockStatistics: TimerStatistic[] = [
        {
          id: 'stat-2025-01-15',
          date: '2025-01-15',
          completedPomodoros: 2,
          totalWorkTime: 3000,
          totalBreakTime: 600,
          sessions: [
            {
              startTime: '2025-01-15T10:00:00Z',
              endTime: '2025-01-15T10:25:00Z',
              type: 'work',
              completed: true,
            },
            {
              startTime: '2025-01-15T10:30:00Z',
              endTime: '2025-01-15T10:35:00Z',
              type: 'short_break',
              completed: true,
            },
          ],
        },
      ];
      
      mockStorageService.loadStatistics.mockResolvedValue(mockStatistics);
      
      const exportDate = new Date('2025-01-16T12:00:00Z');
      vi.setSystemTime(exportDate);
      
      const result = await statisticsService.exportStatistics('2025-01-15', '2025-01-15');
      
      expect(result.exportDate).toBe(exportDate.toISOString());
      expect(result.dateRange).toEqual({
        from: '2025-01-15',
        to: '2025-01-15',
      });
      expect(result.summary.totalPomodoros).toBe(2);
      expect(result.summary.totalWorkTime).toBe(3000);
      expect(result.summary.totalBreakTime).toBe(600);
      expect(result.summary.totalSessions).toBe(2);
      expect(result.completedSessions).toHaveLength(2);
    });
  });

  describe('Total Statistics', () => {
    it('should calculate total statistics across all data', async () => {
      const mockStatistics: TimerStatistic[] = [
        {
          id: 'stat-2025-01-13',
          date: '2025-01-13',
          completedPomodoros: 4,
          totalWorkTime: 6000,
          totalBreakTime: 900,
          sessions: [],
        },
        {
          id: 'stat-2025-01-14',
          date: '2025-01-14',
          completedPomodoros: 3,
          totalWorkTime: 4500,
          totalBreakTime: 600,
          sessions: [],
        },
      ];
      
      mockStorageService.loadStatistics.mockResolvedValue(mockStatistics);
      
      const result = await statisticsService.getTotalStatistics();
      
      expect(result.totalPomodoros).toBe(7);
      expect(result.totalWorkTime).toBe(10500);
      expect(result.totalBreakTime).toBe(1500);
      expect(result.totalDays).toBe(2);
      expect(result.averagePomodorosPerDay).toBe(3.5);
    });

    it('should handle empty statistics gracefully', async () => {
      mockStorageService.loadStatistics.mockResolvedValue([]);
      
      const result = await statisticsService.getTotalStatistics();
      
      expect(result.totalPomodoros).toBe(0);
      expect(result.totalWorkTime).toBe(0);
      expect(result.totalBreakTime).toBe(0);
      expect(result.totalDays).toBe(0);
      expect(result.averagePomodorosPerDay).toBe(0);
    });
  });

  describe('Clear Statistics', () => {
    it('should clear all statistics', async () => {
      await statisticsService.clearAllStatistics();
      
      expect(mockStorageService.clearStatistics).toHaveBeenCalled();
    });
  });

  describe('Date Utilities', () => {
    it('should format dates correctly', () => {
      const service = statisticsService as any;
      const testDate = new Date('2025-01-15T10:30:00Z');
      
      const result = service.formatDate(testDate);
      
      expect(result).toBe('2025-01-15');
    });

    it('should calculate week start correctly', () => {
      const service = statisticsService as any;
      
      // Test with a Wednesday (2025-01-15)
      const wednesday = new Date('2025-01-15');
      const weekStart = service.getWeekStart(wednesday);
      
      // Week should start on Sunday (2025-01-12)
      expect(weekStart.getDay()).toBe(0); // Sunday
      expect(weekStart.getDate()).toBe(12);
    });

    it('should determine if week is in month correctly', () => {
      const service = statisticsService as any;
      
      // Week starting January 26, 2025 (overlaps with February)
      const weekStart = new Date('2025-01-26');
      
      const isInJanuary = service.isWeekInMonth(weekStart, 2025, 1);
      const isInFebruary = service.isWeekInMonth(weekStart, 2025, 2);
      
      expect(isInJanuary).toBe(true);
      expect(isInFebruary).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid date format', () => {
      const service = statisticsService as any;
      
      // Mock a date that would return empty array from split
      const invalidDate = {
        toISOString: () => '',
      } as Date;
      
      expect(() => service.formatDate(invalidDate)).toThrow('Invalid date format');
    });

    it('should handle storage service errors gracefully', async () => {
      mockStorageService.loadStatistics.mockRejectedValue(new Error('Storage error'));
      
      // Should not throw, but let the error propagate to the caller
      await expect(statisticsService.getDailyStatistics('2025-01-15')).rejects.toThrow('Storage error');
    });
  });
});