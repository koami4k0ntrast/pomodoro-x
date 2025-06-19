import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings, Session, Cycle, DailyStats } from '../types';
import { STORAGE_KEYS, DefaultSettings } from '../constants';

export class StorageService {
  // Settings
  static async getSettings(): Promise<Settings> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? { ...DefaultSettings, ...JSON.parse(settings) } : DefaultSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DefaultSettings;
    }
  }

  static async saveSettings(settings: Settings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  // Cycles
  static async getCycles(): Promise<Cycle[]> {
    try {
      const cycles = await AsyncStorage.getItem(STORAGE_KEYS.CYCLES);
      return cycles ? JSON.parse(cycles) : [];
    } catch (error) {
      console.error('Error loading cycles:', error);
      return [];
    }
  }

  static async saveCycle(cycle: Cycle): Promise<void> {
    try {
      const cycles = await this.getCycles();
      cycles.push(cycle);
      await AsyncStorage.setItem(STORAGE_KEYS.CYCLES, JSON.stringify(cycles));
    } catch (error) {
      console.error('Error saving cycle:', error);
    }
  }

  // Sessions (still kept for individual session tracking)
  static async getSessions(): Promise<Session[]> {
    try {
      const sessions = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  }

  static async saveSession(session: Session): Promise<void> {
    try {
      const sessions = await this.getSessions();
      sessions.push(session);
      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  // Daily Stats
  static async getTodayStats(): Promise<DailyStats> {
    const today = new Date().toISOString().split('T')[0];
    try {
      const stats = await AsyncStorage.getItem(`${STORAGE_KEYS.STATS}_${today}`);
      return stats ? JSON.parse(stats) : {
        date: today,
        completedCycles: 0,
        totalFocusTime: 0,
        totalBreakTime: 0,
        streak: 0,
        categories: {},
      };
    } catch (error) {
      console.error('Error loading today stats:', error);
      return {
        date: today,
        completedCycles: 0,
        totalFocusTime: 0,
        totalBreakTime: 0,
        streak: 0,
        categories: {},
      };
    }
  }

  static async updateTodayStats(update: Partial<DailyStats>): Promise<void> {
    try {
      const currentStats = await this.getTodayStats();
      const updatedStats = { ...currentStats, ...update };
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(`${STORAGE_KEYS.STATS}_${today}`, JSON.stringify(updatedStats));
    } catch (error) {
      console.error('Error updating today stats:', error);
    }
  }

  // Clear all data (for testing/reset)
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Get stats for a specific date range
  static async getStatsForDateRange(startDate: string, endDate: string): Promise<DailyStats[]> {
    try {
      const stats: DailyStats[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        try {
          const dayStats = await AsyncStorage.getItem(`${STORAGE_KEYS.STATS}_${dateStr}`);
          if (dayStats) {
            stats.push(JSON.parse(dayStats));
          } else {
            // Create empty stats for missing days
            stats.push({
              date: dateStr,
              completedCycles: 0,
              totalFocusTime: 0,
              totalBreakTime: 0,
              streak: 0,
              categories: {},
            });
          }
        } catch (error) {
          console.error(`Error loading stats for ${dateStr}:`, error);
        }
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting stats for date range:', error);
      return [];
    }
  }

  // Get cycles for a specific date range
  static async getCyclesForDateRange(startDate: string, endDate: string): Promise<Cycle[]> {
    try {
      const allCycles = await this.getCycles();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime() + (24 * 60 * 60 * 1000); // End of day
      
      return allCycles.filter(cycle => 
        cycle.startTime >= start && cycle.startTime < end
      );
    } catch (error) {
      console.error('Error getting cycles for date range:', error);
      return [];
    }
  }

  // Get sessions for a specific date range
  static async getSessionsForDateRange(startDate: string, endDate: string): Promise<Session[]> {
    try {
      const allSessions = await this.getSessions();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime() + (24 * 60 * 60 * 1000); // End of day
      
      return allSessions.filter(session => 
        session.startTime >= start && session.startTime < end
      );
    } catch (error) {
      console.error('Error getting sessions for date range:', error);
      return [];
    }
  }

  // Calculate weekly stats
  static async getWeeklyStats(): Promise<DailyStats[]> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return this.getStatsForDateRange(
      startOfWeek.toISOString().split('T')[0],
      endOfWeek.toISOString().split('T')[0]
    );
  }

  // Calculate monthly stats
  static async getMonthlyStats(): Promise<DailyStats[]> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return this.getStatsForDateRange(
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    );
  }

  // Get current streak (based on completed cycles)
  static async getCurrentStreak(): Promise<number> {
    try {
      const settings = await this.getSettings();
      const dailyGoal = settings.goals.dailyCycles;
      const today = new Date();
      let streak = 0;
      
      for (let i = 0; i < 365; i++) { // Check up to a year back
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const dayStats = await AsyncStorage.getItem(`${STORAGE_KEYS.STATS}_${dateStr}`);
        if (dayStats) {
          const stats = JSON.parse(dayStats);
          // Only count streak if daily goal was reached
          if (stats.completedCycles >= dailyGoal) {
            streak++;
          } else {
            break; // Streak broken
          }
        } else {
          break; // No data means streak broken
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }

  // Reset all statistics (keep settings)
  static async resetStatistics(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const statsKeys = keys.filter(key => 
        key.includes(STORAGE_KEYS.STATS) || 
        key === STORAGE_KEYS.SESSIONS ||
        key === STORAGE_KEYS.CYCLES
      );
      
      await AsyncStorage.multiRemove(statsKeys);
    } catch (error) {
      console.error('Error resetting statistics:', error);
    }
  }

  // Reset today's statistics only
  static async resetTodayStats(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.removeItem(`${STORAGE_KEYS.STATS}_${today}`);
    } catch (error) {
      console.error('Error resetting today stats:', error);
    }
  }
} 