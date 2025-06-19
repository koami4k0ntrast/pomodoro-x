import { StorageService } from './storage';
import { Session, Cycle, DailyStats } from '../types';

export class TestDataGenerator {
  static async generateSampleData(): Promise<void> {
    // Generate sample sessions and cycles for the past 7 days
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate realistic pomodoro cycles for each day (0-12, weighted towards 4-8)
      const random = Math.random();
      let cycles;
      if (random < 0.1) {
        cycles = 0; // 10% chance of no work
      } else if (random < 0.3) {
        cycles = Math.floor(Math.random() * 4) + 1; // 20% chance of 1-4
      } else if (random < 0.8) {
        cycles = Math.floor(Math.random() * 5) + 4; // 50% chance of 4-8
      } else {
        cycles = Math.floor(Math.random() * 4) + 9; // 20% chance of 9-12
      }
      const shortBreaks = Math.floor(cycles * 0.8); // ~80% of work sessions
      const longBreaks = Math.floor(cycles / 4); // 1 long break per 4 work sessions
      
      // Calculate times
      const focusTime = cycles * 25; // 25 minutes per work session
      const breakTime = (shortBreaks * 5) + (longBreaks * 15); // 5 min short, 15 min long
      
      // Create daily stats
      const dailyStats: DailyStats = {
        date: dateStr,
        completedCycles: cycles,
        totalFocusTime: focusTime,
        totalBreakTime: breakTime,
        streak: i === 0 ? 3 : 0, // Current streak only for today
        categories: {
          'work': Math.floor(cycles * 0.6),
          'study': Math.floor(cycles * 0.3),
          'personal': Math.floor(cycles * 0.1),
        },
      };
      
      // Save daily stats for the specific date (not today)
      const currentStats = await StorageService.getTodayStats();
      if (dateStr === new Date().toISOString().split('T')[0]) {
        // Only update today's stats properly
        await StorageService.updateTodayStats(dailyStats);
      } else {
        // For historical dates, we need to save directly to storage
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const { STORAGE_KEYS } = require('../constants');
        await AsyncStorage.setItem(`${STORAGE_KEYS.STATS}_${dateStr}`, JSON.stringify(dailyStats));
      }
      
      // Generate sample cycles and sessions for this day
      let sessionTime = date.getTime();
      const cycleLabels = ['Deep Work', 'Email & Communication', 'Planning', 'Code Review'];
      const cycleCategories = ['work', 'study', 'personal'];
      
      for (let cycleIndex = 0; cycleIndex < cycles; cycleIndex++) {
        const cycleId = `cycle-${dateStr}-${cycleIndex}`;
        const label = cycleLabels[cycleIndex % cycleLabels.length];
        const category = cycleCategories[cycleIndex % cycleCategories.length];
        
        // Create cycle (4 work sessions with breaks, ending with long break)
        const cycleSessions: Session[] = [];
        const cycleStartTime = sessionTime;
        
        // Generate 4 work sessions with breaks for this cycle
        for (let sessionIndex = 0; sessionIndex < 4; sessionIndex++) {
          // Work session
          const workSession: Session = {
            id: `work-${dateStr}-${cycleIndex}-${sessionIndex}`,
            cycleId: cycleId,
            type: 'work',
            duration: 25,
            startTime: sessionTime,
            endTime: sessionTime + (25 * 60 * 1000),
            completed: true,
          };
          
          cycleSessions.push(workSession);
          await StorageService.saveSession(workSession);
          sessionTime += 25 * 60 * 1000;
          
          // Add break session (short break for first 3, long break for 4th)
          const isLastSession = sessionIndex === 3;
          const breakDuration = isLastSession ? 15 : 5;
          const breakType = isLastSession ? 'longBreak' : 'shortBreak';
          
          const breakSession: Session = {
            id: `break-${dateStr}-${cycleIndex}-${sessionIndex}`,
            cycleId: cycleId,
            type: breakType,
            duration: breakDuration,
            startTime: sessionTime,
            endTime: sessionTime + (breakDuration * 60 * 1000),
            completed: true,
          };
          
          cycleSessions.push(breakSession);
          await StorageService.saveSession(breakSession);
          sessionTime += breakDuration * 60 * 1000;
        }
        
        // Create and save the completed cycle
        const cycle: Cycle = {
          id: cycleId,
          label: label,
          category: category,
          startTime: cycleStartTime,
          endTime: sessionTime,
          completed: true,
          sessions: cycleSessions,
        };
        
        await StorageService.saveCycle(cycle);
      }
    }
    
    console.log('Sample data generated successfully!');
  }
  
  static async clearAllData(): Promise<void> {
    await StorageService.clearAll();
    console.log('All data cleared!');
  }
} 